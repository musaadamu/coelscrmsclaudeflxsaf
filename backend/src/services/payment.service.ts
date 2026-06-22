import { paymentRepository } from '../repositories/payment.repository';
import { studentFeeRepository } from '../repositories/course.repository';
import { scratchCardRepository } from '../repositories/course.repository';
import { emailQueue } from '../workers/queues';
import { AppError } from '../middleware/errorHandler';
import crypto from 'crypto';
import axios from 'axios';
import Payment from '../models/payment.model';
import StudentFee from '../models/studentFee.model';
import AuditLog from '../models/auditLog.model';
import { getAsyncContext } from '../utils/asyncContext';
import Redis from 'ioredis'

const redis = new Redis({ host: process.env.REDIS_HOST || '127.0.0.1', port: parseInt(process.env.REDIS_PORT || '6379') })

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

export class PaymentService {
  async initiatePaystack(studentId: string, amountKobo: number, feeType: string) {
    const reference = `COELS-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    const payment = await paymentRepository.create({
      student: studentId,
      reference,
      amountKobo,
      feeType,
      status: 'PENDING',
      provider: 'PAYSTACK',
    });

    try {
      const response = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          email: `student${studentId}@coels.edu.ng`, // Replace with actual student email
          amount: amountKobo,
          reference,
          metadata: {
            studentId,
            feeType,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        authorizationUrl: response.data.data.authorization_url,
        reference,
        paymentId: payment._id,
      };
    } catch (error) {
      throw new AppError(500, 'PAYMENT_INIT_FAILED', 'Failed to initialize payment');
    }
  }

  async verifyPaystackWebhook(rawBody: Buffer, signature: string) {
    const hash = crypto.createHmac('sha512', PAYSTACK_SECRET!).update(rawBody).digest('hex');

    if (hash !== signature) {
      throw new AppError(401, 'INVALID_SIGNATURE', 'Invalid webhook signature');
    }

    const body = JSON.parse(rawBody.toString());

    if (body.event !== 'charge.success') {
      return null;
    }

    const { reference, metadata } = body.data;
    const { studentId, feeType } = metadata;

    // Update payment status
    const payment = await paymentRepository.updateByReference(reference, {
      status: 'SUCCESS',
      verifiedAt: new Date(),
      verificationData: body.data,
    });

    // Update student fee
    const studentFee = await StudentFee.findOne({ student: studentId, feeType });
    if (studentFee) {
      const newAmountPaid = (studentFee.amountPaidKobo || 0) + body.data.amount;
      const newStatus = newAmountPaid >= studentFee.amountDueKobo ? 'PAID' : 'PARTIAL';

      await studentFeeRepository.updateById(studentFee._id, {
        amountPaidKobo: newAmountPaid,
        status: newStatus,
      });
    }

    // Queue receipt PDF and email
    await emailQueue.add('payment-receipt', {
      to: `student${studentId}@coels.edu.ng`,
      template: 'payment-receipt',
      context: {
        studentName: 'Student Name',
        amountNaira: (body.data.amount / 100).toFixed(2),
        reference,
        date: new Date().toLocaleDateString(),
        receiptNo: payment._id,
        feeType,
      },
    });

    return payment;
  }

  async redeemScratchCard(serial: string, pin: string, studentId: string, studentFeeId: string) {
    // Rate limiting: max 5 attempts per 30 minutes per (serial+student)
    const attemptsKey = `scratch:attempts:${serial}:${studentId}`
    const attempts = parseInt((await redis.get(attemptsKey)) || '0', 10)
    if (attempts >= 5) {
      throw new AppError(429, 'TOO_MANY_ATTEMPTS', 'Too many invalid attempts. Try again later.')
    }

    const card = await scratchCardRepository.findBySerial(serial);
    if (!card) {
      // increment attempts
      const newAttempts = await redis.incr(attemptsKey)
      await redis.expire(attemptsKey, 30 * 60)
      const context = getAsyncContext()
      await AuditLog.create({ action: 'SCRATCH_CARD_FAIL', details: { serial, reason: 'NOT_FOUND', attempts: newAttempts }, performedBy: context.userId, ipAddress: context.ip })
      if (newAttempts >= 5) {
        await AuditLog.create({ action: 'SCRATCH_CARD_LOCK', details: { serial }, performedBy: context.userId, ipAddress: context.ip })
      }
      throw new AppError(404, 'NOT_FOUND', 'Scratch card not found');
    }

    if (card.usedBy) {
      throw new AppError(400, 'CARD_USED', 'This scratch card has already been used');
    }

    // Validate PIN (in production, use bcryptjs comparison)
    // For now, simple comparison
    if (card.pin !== pin) {
      const newAttempts = await redis.incr(attemptsKey)
      await redis.expire(attemptsKey, 30 * 60)
      const context = getAsyncContext()
      await AuditLog.create({ action: 'SCRATCH_CARD_FAIL', details: { serial, reason: 'INVALID_PIN', attempts: newAttempts }, performedBy: context.userId, ipAddress: context.ip })
      if (newAttempts >= 5) {
        await AuditLog.create({ action: 'SCRATCH_CARD_LOCK', details: { serial }, performedBy: context.userId, ipAddress: context.ip })
      }
      throw new AppError(400, 'INVALID_PIN', 'Invalid PIN');
    }

    // Create payment record
    const payment = await paymentRepository.create({
      student: studentId,
      reference: `SCRATCH-${serial}`,
      amountKobo: card.denominationKobo,
      feeType: 'TUITION',
      status: 'SUCCESS',
      verifiedAt: new Date(),
      provider: 'SCRATCH_CARD',
    });

    // Update scratch card
    await scratchCardRepository.updateById(card._id, {
      usedBy: studentId,
      usedAt: new Date(),
      paymentId: payment._id,
    });

    // Update student fee
    const fee = await studentFeeRepository.findById(studentFeeId);
    const newAmountPaid = (fee.amountPaidKobo || 0) + card.denominationKobo;
    const newStatus = newAmountPaid >= fee.amountDueKobo ? 'PAID' : 'PARTIAL';

    await studentFeeRepository.updateById(studentFeeId, {
      amountPaidKobo: newAmountPaid,
      status: newStatus,
    });

    // reset attempts on successful redemption
    await redis.del(attemptsKey)

    return payment;
  }

  async getPayment(paymentId: string) {
    return await paymentRepository.findById(paymentId);
  }

  async getPaymentByReference(reference: string) {
    return await paymentRepository.findByReference(reference);
  }

  async getStudentPayments(studentId: string, options: any = {}) {
    return await paymentRepository.findByStudent(studentId, options);
  }

  async generateScratchCards(count: number, denominationKobo: number, generatedBy: string) {
    const cards = [];
    for (let i = 0; i < count; i++) {
      cards.push({
        serial: crypto.randomBytes(8).toString('hex').toUpperCase(),
        pin: Math.floor(Math.random() * 100000000).toString().padStart(8, '0'),
        denominationKobo,
        generatedBy,
        generatedAt: new Date(),
      });
    }

    const created = await scratchCardRepository.createMany(cards);
    return created;
  }
}

export const paymentService = new PaymentService();
