import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import ScratchCard from '../../../src/models/scratchCard.model';
import Payment from '../../../src/models/payment.model';
import { paymentService } from '../../../src/services/payment.service';
import Redis from 'ioredis';

// Mock Redis
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => {
    const store: any = {};
    return {
      incr: jest.fn(async (key) => { store[key] = (store[key] || 0) + 1; return store[key]; }),
      expire: jest.fn(async () => true),
      get: jest.fn(async (key) => store[key]),
      del: jest.fn(async (key) => { delete store[key]; }),
    };
  });
});

describe('Scratch Card Service', () => {
  const serial = 'ABCDEF1234567890';
  const pin = '12345678';
  const studentId = new mongoose.Types.ObjectId();
  const feeId = new mongoose.Types.ObjectId();

  beforeAll(async () => {
    const pinHash = await bcrypt.hash(pin, 10);
    await ScratchCard.create({
      serial,
      pinHash,
      denominationKobo: 5000000,
      usedBy: null,
      batchRef: 'TEST_BATCH'
    });
  });

  it('Test 2: wrong PIN attempt 1 -> 401 INVALID_PIN', async () => {
    await expect(paymentService.redeemScratchCard(serial, '00000000', studentId.toString(), feeId.toString()))
      .rejects.toThrow('INVALID_PIN');
  });

  it('Test 3: wrong PIN attempt 5 -> 401 INVALID_PIN', async () => {
    for(let i=0; i<3; i++) {
      await expect(paymentService.redeemScratchCard(serial, '00000000', studentId.toString(), feeId.toString()))
        .rejects.toThrow('INVALID_PIN');
    }
    await expect(paymentService.redeemScratchCard(serial, '00000000', studentId.toString(), feeId.toString()))
      .rejects.toThrow('INVALID_PIN');
  });

  it('Test 4: 6th attempt -> 429 CARD_LOCKED', async () => {
    await expect(paymentService.redeemScratchCard(serial, '00000000', studentId.toString(), feeId.toString()))
      .rejects.toThrow('CARD_LOCKED');
  });

  // Note: To run Test 1, we must simulate clearing the lock or using a new card
  it('Test 1: correct serial + correct PIN -> payment created', async () => {
    const newSerial = 'AAAA1111BBBB2222';
    await ScratchCard.create({
      serial: newSerial,
      pinHash: await bcrypt.hash(pin, 10),
      denominationKobo: 5000000,
      usedBy: null,
      batchRef: 'TEST_BATCH'
    });
    
    // This is mocked out to just test the flow
    // payment created, card.usedBy set
    const result = await paymentService.redeemScratchCard(newSerial, pin, studentId.toString(), feeId.toString());
    expect(result).toBeDefined();
    
    const card = await ScratchCard.findOne({ serial: newSerial });
    expect(card?.usedBy?.toString()).toBe(studentId.toString());
  });

  it('Test 5: already used card -> 409 CARD_ALREADY_USED', async () => {
    const newSerial = 'AAAA1111BBBB2222';
    await expect(paymentService.redeemScratchCard(newSerial, pin, studentId.toString(), feeId.toString()))
      .rejects.toThrow('CARD_ALREADY_USED');
  });
});
