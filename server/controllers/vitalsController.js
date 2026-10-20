import { z } from 'zod';
import Vitals from '../models/Vitals.js';
import Patient from '../models/Patient.js';

const vitalSchema = z.object({
  patient: z.string().regex(/^[a-f\d]{24}$/i, 'A valid patient is required'),
  heartRate: z.coerce.number().int().min(1).max(300),
  systolic: z.coerce.number().int().min(1).max(300),
  diastolic: z.coerce.number().int().min(1).max(200),
  spo2: z.coerce.number().min(0).max(100),
  temperature: z.coerce.number().min(25).max(45),
  recordedAt: z.coerce.date().optional(),
});

export async function list(req, res) {
  res.json(await Vitals.find({ patient: req.params.patientId }).sort({ recordedAt: 1 }).limit(100));
}

export async function create(req, res) {
  const parsed = vitalSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: 'Enter valid values for all vital signs.',
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  const patient = await Patient.findById(parsed.data.patient);
  if (!patient) {
    return res.status(404).json({ message: 'Patient not found' });
  }

  const vital = await Vitals.create(parsed.data);
  const full = await vital.populate('patient', 'name mrn');
  req.io.to(`patient:${patient._id}`).emit('vitals:update', full);
  res.status(201).json(full);
}

export async function seedForPatient(req, res) {
  res.json(await Patient.findById(req.params.patientId));
}
