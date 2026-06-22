require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/user.model');
const Programme = require('../models/programme.model');
const Department = require('../models/department.model');
const Faculty = require('../models/faculty.model');
const AcademicSession = require('../models/academicSession.model');
const Semester = require('../models/semester.model');
const Student = require('../models/student.model');
const Staff = require('../models/staff.model');
const Hostel = require('../models/hostel.model');
const HostelRoom = require('../models/hostelRoom.model');
const ScratchCard = require('../models/scratchCard.model');

const MONGO_URI = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/coels_crms';

async function seed() {
  console.log(`Connecting to MongoDB at: ${MONGO_URI}...`);
  await mongoose.connect(MONGO_URI);
  console.log('Connected successfully. Cleaning up old data...');

  // Clean old collections
  await Promise.all([
    User.deleteMany({}),
    Programme.deleteMany({}),
    Department.deleteMany({}),
    Faculty.deleteMany({}),
    AcademicSession.deleteMany({}),
    Semester.deleteMany({}),
    Student.deleteMany({}),
    Staff.deleteMany({}),
    Hostel.deleteMany({}),
    HostelRoom.deleteMany({}),
    ScratchCard.deleteMany({})
  ]);

  console.log('Database cleaned. Inserting seed data...');

  // 1. Create a Faculty
  const faculty = await Faculty.create({
    name: 'School of Education',
    code: 'SOE'
  });

  // 2. Create a Department
  const department = await Department.create({
    name: 'Primary Education Studies',
    code: 'PES',
    faculty: faculty._id
  });

  // 3. Create 3 Programmes
  const nce = await Programme.create({
    name: 'NCE Primary Education Studies',
    code: 'NCE',
    type: 'NCE',
    durationYears: 3,
    department: department._id,
    affiliation: 'NCCE'
  });

  const diploma = await Programme.create({
    name: 'Diploma in Educational Management',
    code: 'DIP',
    type: 'DIPLOMA',
    durationYears: 2,
    department: department._id,
    affiliation: 'COELS'
  });

  const ptNce = await Programme.create({
    name: 'Part-Time NCE PES',
    code: 'PTNCE',
    type: 'PART_TIME_NCE',
    durationYears: 4,
    department: department._id,
    affiliation: 'NCCE'
  });

  // 4. Create 1 Academic Session
  const session = await AcademicSession.create({
    name: '2024/2025',
    startDate: new Date('2024-10-01'),
    endDate: new Date('2025-08-31'),
    isCurrent: true
  });

  // 5. Create 2 Semesters
  const firstSemester = await Semester.create({
    session: session._id,
    name: 'FIRST',
    startDate: new Date('2024-10-01'),
    endDate: new Date('2025-03-31'),
    registrationOpen: true,
    addDropDeadline: new Date('2024-11-30'),
    isCurrent: true
  });

  const secondSemester = await Semester.create({
    session: session._id,
    name: 'SECOND',
    startDate: new Date('2025-04-01'),
    endDate: new Date('2025-08-31'),
    registrationOpen: false,
    addDropDeadline: new Date('2025-05-31'),
    isCurrent: false
  });

  // 6. Create 2 Hostels and 10 QUAD rooms each
  const maleHostel = await Hostel.create({
    name: 'Male Hostel',
    gender: 'MALE',
    totalRooms: 10,
    address: 'East Campus'
  });

  const femaleHostel = await Hostel.create({
    name: 'Female Hostel',
    gender: 'FEMALE',
    totalRooms: 10,
    address: 'West Campus'
  });

  const hostelRooms = [];
  const roomPriceKobo = 25000 * 100; // 25,000 NGN

  for (let i = 1; i <= 10; i++) {
    const roomNum = i < 10 ? `0${i}` : `${i}`;
    // Male Hostel Rooms
    hostelRooms.push({
      hostel: maleHostel._id,
      roomNumber: `M${roomNum}`,
      floor: 1,
      capacity: 4,
      roomType: 'QUAD',
      pricePerSessionKobo: roomPriceKobo,
      isAvailable: true
    });
    // Female Hostel Rooms
    hostelRooms.push({
      hostel: femaleHostel._id,
      roomNumber: `F${roomNum}`,
      floor: 1,
      capacity: 4,
      roomType: 'QUAD',
      pricePerSessionKobo: roomPriceKobo,
      isAvailable: true
    });
  }
  await HostelRoom.create(hostelRooms);

  // 7. Create Super Admin User
  // Note: The pre-save hook handles the hashing automatically when we pass a plain text password to passwordHash
  const adminUser = await User.create({
    email: 'admin@coels.edu.ng',
    passwordHash: 'Admin@2024!',
    roles: ['super_admin'],
    isActive: true
  });

  // 8. Create 100 ScratchCards
  console.log('Generating 100 scratch cards in parallel...');
  const cardDataPromises = Array.from({ length: 100 }).map(async (_, idx) => {
    const serial = Math.random().toString(16).substring(2, 10).toUpperCase() + 
                   Math.random().toString(16).substring(2, 10).toUpperCase(); // 16-char hex
    const pin = Math.floor(10000000 + Math.random() * 90000000).toString(); // 8-digit PIN
    const pinHash = await bcrypt.hash(pin, 12);
    return {
      serial,
      pinHash,
      denominationKobo: 50000 * 100, // 50,000 NGN
      batchRef: 'SEED_BATCH_001',
      generatedBy: adminUser._id,
      generatedAt: new Date()
    };
  });
  const scratchCards = await Promise.all(cardDataPromises);
  await ScratchCard.create(scratchCards);

  // 9. Create Demo Student User + Student Profile
  const studentUser = await User.create({
    email: 'student@coels.edu.ng',
    passwordHash: 'Student@2024!',
    roles: ['student'],
    isActive: true
  });

  const studentProfile = await Student.create({
    user: studentUser._id,
    matricNo: 'COELS/NCE/2024/001',
    firstName: 'Demo',
    lastName: 'Student',
    gender: 'MALE',
    dob: new Date('2005-01-01'),
    stateOfOrigin: 'Yobe',
    lga: 'Nguru',
    programme: nce._id,
    currentLevel: 100,
    admissionYear: 2024,
    status: 'ACTIVE'
  });

  // 10. Create Demo Lecturer User + Staff Profile
  const lecturerUser = await User.create({
    email: 'lecturer@coels.edu.ng',
    passwordHash: 'Lecturer@2024!',
    roles: ['lecturer'],
    isActive: true
  });

  const lecturerProfile = await Staff.create({
    user: lecturerUser._id,
    employeeId: 'COELS/STAFF/001',
    firstName: 'Demo',
    lastName: 'Lecturer',
    gender: 'MALE',
    department: department._id,
    rank: 'Lecturer I',
    joinedAt: new Date('2022-01-01')
  });

  // 11. Create Demo HOD User + Staff Profile
  const hodUser = await User.create({
    email: 'hod@coels.edu.ng',
    passwordHash: 'Hod@2024!',
    roles: ['hod'],
    isActive: true
  });

  const hodProfile = await Staff.create({
    user: hodUser._id,
    employeeId: 'COELS/STAFF/002',
    firstName: 'Demo',
    lastName: 'HOD',
    gender: 'FEMALE',
    department: department._id,
    rank: 'Senior Lecturer',
    joinedAt: new Date('2020-01-01')
  });

  // Update HOD on Department
  department.hod = hodUser._id;
  await department.save();

  // Log summary counts
  console.log('\n--- Seed Statistics ---');
  console.log(`Faculties:       ${await Faculty.countDocuments()}`);
  console.log(`Departments:     ${await Department.countDocuments()}`);
  console.log(`Programmes:      ${await Programme.countDocuments()}`);
  console.log(`Sessions:        ${await AcademicSession.countDocuments()}`);
  console.log(`Semesters:       ${await Semester.countDocuments()}`);
  console.log(`Hostels:         ${await Hostel.countDocuments()}`);
  console.log(`Hostel Rooms:    ${await HostelRoom.countDocuments()}`);
  console.log(`Users:           ${await User.countDocuments()}`);
  console.log(`Students:        ${await Student.countDocuments()}`);
  console.log(`Staff Profiles:  ${await Staff.countDocuments()}`);
  console.log(`Scratch Cards:   ${await ScratchCard.countDocuments()}`);
  console.log('-----------------------\nSeeding completed successfully!');
}

seed()
  .then(() => mongoose.disconnect())
  .catch((err) => {
    console.error('Seeding failed:', err);
    mongoose.disconnect();
  });
