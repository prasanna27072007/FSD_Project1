import 'dotenv/config';
import helmet from 'helmet';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import http from 'http';
import bcrypt from 'bcryptjs';
import { Server } from 'socket.io';
import { connectDB } from './config/db.js';
import auth from './routes/auth.js';
import patients from './routes/patients.js';
import vitals from './routes/vitals.js';
import ai from './routes/ai.js';
import alerts from './routes/alerts.js';
import analytics from './routes/analytics.js';
import medications from './routes/medications.js';
import User from './models/User.js';
import Patient from './models/Patient.js';
import VitalsModel from './models/Vitals.js';
import AlertModel from './models/Alert.js';
import { notFound, errorHandler } from './middleware/error.js';

await connectDB();
await seedDemoData();

async function seedDemoData() {
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    const passwordHash = await bcrypt.hash('Demo@123', 10);
    const users = [
      { name: 'Dr. Maya Chen', email: 'doctor@hdss.local', password: passwordHash, role: 'Doctor' },
      { name: 'Nurse Jordan Lee', email: 'nurse@hdss.local', password: passwordHash, role: 'Nurse' },
      { name: 'System Admin', email: 'admin@hdss.local', password: passwordHash, role: 'Admin' },
    ];
    await User.insertMany(users);
  }

  if (await Patient.countDocuments() > 0) return;

  const names = ['Aarav Mehta', 'Diya Raman', 'Rohan Patel', 'Ananya Iyer', 'Vikram Shah', 'Meera Nair', 'Kabir Singh', 'Ishita Rao', 'Arjun Menon', 'Sara Thomas', 'Neil Joseph', 'Tara Kapoor'];
  const conditions = ['Pneumonia', 'Hypertension', 'Type 2 Diabetes', 'Asthma', 'Heart failure', 'Migraine'];
  const patientsList = await Patient.insertMany(
    names.map((name, i) => ({
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
    })),
  );

  const vitals = [];
  for (const [i, patient] of patientsList.entries()) {
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

  await VitalsModel.insertMany(vitals);
  await AlertModel.insertMany(
    patientsList.slice(0, 6).map((patient, i) => ({
      patient: patient._id,
      title: i % 2 ? 'Oxygen saturation trend' : 'Elevated temperature',
      message: i % 2 ? 'SpO2 has remained below target threshold.' : 'Temperature is elevated and should be reviewed.',
      priority: i < 2 ? 'Critical' : i < 4 ? 'Warning' : 'Info',
    })),
  );

  console.log('Demo patient data initialized.');
}

const app = express();
const server = http.createServer(app);
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const allowedClientOrigins = process.env.NODE_ENV === 'production'
  ? [clientUrl]
  : [...new Set([clientUrl, 'http://localhost:5173', 'http://localhost:5174'])];
const isAllowedClientOrigin = (origin) => !origin
  || allowedClientOrigins.includes(origin)
  || (process.env.NODE_ENV !== 'production' && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin));
const checkClientOrigin = (origin, callback) => callback(null, isAllowedClientOrigin(origin));
const io = new Server(server, { cors: { origin: checkClientOrigin, credentials: true } });

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts. Please try again later.' },
});

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: checkClientOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use('/api/auth', authLimiter);
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'HDSS API' }));
app.use('/api/auth', auth);
app.use('/api/patients', patients);
app.use('/api/vitals', vitals);
app.use('/api/ai', ai);
app.use('/api/alerts', alerts);
app.use('/api/analytics', analytics);
app.use('/api/medications', medications);
app.use(notFound);
app.use(errorHandler);

io.on('connection', (socket) => {
  socket.on('join:patient', (id) => socket.join(`patient:${id}`));
});

const preferredPort = Number(process.env.PORT || 5001);

function listenWithFallback(startPort, maxAttempts = 10) {
  let port = startPort;

  const tryListen = () => {
    server.once('error', (error) => {
      if (error.code === 'EADDRINUSE' && port < startPort + maxAttempts) {
        const nextPort = port + 1;
        console.warn(`Port ${port} is busy. Retrying on ${nextPort}.`);
        port = nextPort;
        tryListen();
        return;
      }

      throw error;
    });

    server.listen(port, () => console.log(`HDSS API running on ${port}`));
  };

  tryListen();
}

listenWithFallback(preferredPort);
