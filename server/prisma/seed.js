import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');
  await prisma.donationHistory.deleteMany();
  await prisma.bloodRequest.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  console.log('Creating sample users...');
  
  // Create 8 Donors
  const donors = await Promise.all([
    prisma.user.create({ data: { name: 'Rahul Sharma', email: 'rahul@example.com', passwordHash, phone: '9876543210', bloodGroup: 'O_POS', role: 'DONOR', city: 'Mumbai', state: 'MH', isAvailable: true } }),
    prisma.user.create({ data: { name: 'Priya Patel', email: 'priya@example.com', passwordHash, phone: '9876543211', bloodGroup: 'A_POS', role: 'DONOR', city: 'Delhi', state: 'DL', isAvailable: true } }),
    prisma.user.create({ data: { name: 'Amit Singh', email: 'amit@example.com', passwordHash, phone: '9876543212', bloodGroup: 'B_NEG', role: 'DONOR', city: 'Bangalore', state: 'KA', isAvailable: false } }),
    prisma.user.create({ data: { name: 'Sneha Reddy', email: 'sneha@example.com', passwordHash, phone: '9876543213', bloodGroup: 'AB_POS', role: 'DONOR', city: 'Hyderabad', state: 'TG', isAvailable: true } }),
    prisma.user.create({ data: { name: 'Vikram Das', email: 'vikram@example.com', passwordHash, phone: '9876543214', bloodGroup: 'O_NEG', role: 'DONOR', city: 'Kolkata', state: 'WB', isAvailable: true } }),
    prisma.user.create({ data: { name: 'Neha Gupta', email: 'neha@example.com', passwordHash, phone: '9876543215', bloodGroup: 'A_NEG', role: 'DONOR', city: 'Pune', state: 'MH', isAvailable: true } }),
    prisma.user.create({ data: { name: 'Rohan Joshi', email: 'rohan@example.com', passwordHash, phone: '9876543216', bloodGroup: 'B_POS', role: 'DONOR', city: 'Chennai', state: 'TN', isAvailable: true } }),
    prisma.user.create({ data: { name: 'Kavita Verma', email: 'kavita@example.com', passwordHash, phone: '9876543217', bloodGroup: 'AB_NEG', role: 'DONOR', city: 'Jaipur', state: 'RJ', isAvailable: false } }),
  ]);

  // Create 3 Recipients
  const recipients = await Promise.all([
    prisma.user.create({ data: { name: 'City Hospital Admin', email: 'admin@cityhospital.com', passwordHash, phone: '1111111111', bloodGroup: 'O_POS', role: 'RECIPIENT', city: 'Mumbai', state: 'MH' } }),
    prisma.user.create({ data: { name: 'Sanjeevani Care', email: 'care@sanjeevani.com', passwordHash, phone: '2222222222', bloodGroup: 'A_POS', role: 'RECIPIENT', city: 'Delhi', state: 'DL' } }),
    prisma.user.create({ data: { name: 'LifeLine Blood Bank', email: 'info@lifeline.com', passwordHash, phone: '3333333333', bloodGroup: 'B_POS', role: 'RECIPIENT', city: 'Bangalore', state: 'KA' } }),
  ]);

  console.log('Creating sample blood requests...');
  
  const requests = await Promise.all([
    prisma.bloodRequest.create({
      data: {
        recipientId: recipients[0].id, patientName: 'Suresh Kumar', hospitalName: 'City Hospital', hospitalAddr: 'Andheri West', bloodGroup: 'O_NEG', unitsNeeded: 2, urgency: 'CRITICAL', city: 'Mumbai', state: 'MH', contactPhone: '1111111111'
      }
    }),
    prisma.bloodRequest.create({
      data: {
        recipientId: recipients[1].id, patientName: 'Meera Devi', hospitalName: 'Sanjeevani Care', hospitalAddr: 'Rohini', bloodGroup: 'A_POS', unitsNeeded: 1, urgency: 'HIGH', city: 'Delhi', state: 'DL', contactPhone: '2222222222'
      }
    }),
    prisma.bloodRequest.create({
      data: {
        recipientId: recipients[2].id, patientName: 'Ramesh Babu', hospitalName: 'LifeLine Hospital', hospitalAddr: 'Indiranagar', bloodGroup: 'B_NEG', unitsNeeded: 3, urgency: 'CRITICAL', city: 'Bangalore', state: 'KA', contactPhone: '3333333333'
      }
    }),
    prisma.bloodRequest.create({
      data: {
        recipientId: recipients[0].id, patientName: 'Anil Desai', hospitalName: 'City Hospital', hospitalAddr: 'Andheri West', bloodGroup: 'AB_POS', unitsNeeded: 1, urgency: 'NORMAL', city: 'Mumbai', state: 'MH', contactPhone: '1111111111'
      }
    }),
    prisma.bloodRequest.create({
      data: {
        recipientId: recipients[1].id, patientName: 'Sunita Sharma', hospitalName: 'Sanjeevani Care', hospitalAddr: 'Rohini', bloodGroup: 'O_POS', unitsNeeded: 2, urgency: 'HIGH', city: 'Delhi', state: 'DL', contactPhone: '2222222222'
      }
    }),
  ]);

  console.log('Creating sample donation history...');
  
  await prisma.donationHistory.create({
    data: { donorId: donors[4].id, requestId: requests[0].id, status: 'COMPLETED' } // Vikram (O_NEG) completed request for O_NEG
  });
  
  await prisma.donationHistory.create({
    data: { donorId: donors[1].id, requestId: requests[1].id, status: 'PLEDGED' } // Priya (A_POS) pledged for A_POS
  });

  console.log('Seed completed successfully!');
  console.log(`Created 8 Donors, 3 Recipients, 5 Blood Requests, 2 Donation Records`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
