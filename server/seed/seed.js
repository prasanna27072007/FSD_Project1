import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Vitals from '../models/Vitals.js';
import Alert from '../models/Alert.js';

const demoPassword = 'Demo@123';
const demoUsers = [
  { name: 'Dr. Maya Chen', email: 'doctor@hdss.local', role: 'Doctor' },
  { name: 'Nurse Jordan Lee', email: 'nurse@hdss.local', role: 'Nurse' },
  { name: 'System Admin', email: 'admin@hdss.local', role: 'Admin' },
];
const patientNames = [
  'Aarav Mehta', 'Diya Raman', 'Rohan Patel', 'Ananya Iyer', 'Vikram Shah', 'Meera Nair',
  'Kabir Singh', 'Ishita Rao', 'Arjun Menon', 'Sara Thomas', 'Neil Joseph', 'Tara Kapoor',
];
const conditions = ['Pneumonia', 'Hypertension', 'Type 2 Diabetes', 'Asthma', 'Heart failure', 'Migraine'];

async function seed() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing. Set it in server/.env to seed a persistent MongoDB database.');
  }

  // Seeding must never silently target the temporary in-memory database.
  await connectDB({ allowMemoryFallback: false });

  const password = await bcrypt.hash(demoPassword, 10);
  for (const user of demoUsers) {
    await User.updateOne(
      { email: user.email },
      { $set: { ...user, password } },
      { upsert: true },
    );
  }

  const patients = [];
  for (const [i, name] of patientNames.entries()) {
    const patient = await Patient.findOneAndUpdate(
      { mrn: `HDSS-${1001 + i}` },
      { $setOnInsert: {
        mrn: `HDSS-${1001 + i}`,
        name,
        age: 22 + i * 4,
        gender: i % 3 === 0 ? 'Female' : i % 3 === 1 ? 'Male' : 'Other',
        admissionDate: new Date(Date.now() - i * 86400000),
        condition: conditions[i % conditions.length],
        risk: ['Low', 'Medium', 'High', 'Critical'][i % 4],
        allergies: i % 4 === 0 ? ['Penicillin'] : [],
        history: ['Routine follow-up', 'Previous admission documented'],
        symptoms: i % 3 === 0 ? ['fatigue', 'fever'] : ['headache', 'shortness of breath'],
        medications: i % 2 === 0 ? ['lisinopril'] : ['metformin'],
      } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    patients.push(patient);
  }

  if (await Vitals.countDocuments() === 0) {
    const vitals = [];
    for (const [i, patient] of patients.entries()) {
      for (let j = 0; j < 7; j += 1) {
        vitals.push({
          patient: patient._id,
          heartRate: 72 + (i % 20) + (j % 4),
          systolic: 118 + (i % 18),
          diastolic: 76 + (i % 8),
          spo2: 95 - (i % 3),
          temperature: 36.7 + (i % 4 === 0 ? 0.9 : 0),
          recordedAt: new Date(Date.now() - (6 - j) * 3600000),
        });
      }
    }
    await Vitals.insertMany(vitals);
  }

  if (await Alert.countDocuments() === 0) {
    await Alert.insertMany(patients.slice(0, 6).map((patient, i) => ({
      patient: patient._id,
      title: i % 2 ? 'Oxygen saturation trend' : 'Elevated temperature',
      message: i % 2
        ? 'SpO2 has remained below target threshold.'
        : 'Temperature is elevated and should be reviewed.',
      priority: i < 2 ? 'Critical' : i < 4 ? 'Warning' : 'Info',
    })));
  }

  console.log(`Seed complete in MongoDB. Demo password for all accounts: ${demoPassword}`);
  console.log(`Accounts: ${demoUsers.map(({ email }) => email).join(', ')}`);
}

try {
  await seed();
} catch (error) {
  console.error(`Seed failed: ${error.message}`);
  for (const [address, server] of error.reason?.servers ?? []) {
    if (server.error) {
      console.error(`MongoDB node ${address}: ${server.error.name} ${server.error.code ?? ''} ${server.error.message}`);
    }
  }
  process.exitCode = 1;
} finally {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
}
