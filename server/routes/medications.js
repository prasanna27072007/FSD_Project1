import { Router } from 'express';
import { auth } from '../middleware/auth.js';

const r = Router();

r.post('/check-interaction', auth, (req, res) => {
  const meds = (req.body.medications || []).map((x) => String(x).toLowerCase());
  const known = [
    ['warfarin', 'aspirin', 'Major bleeding risk — requires clinician review'],
    ['lisinopril', 'potassium', 'Potential hyperkalemia risk'],
    ['penicillin', 'amoxicillin', 'Duplicate beta-lactam therapy'],
  ];

  const found = known
    .filter(([a, b]) => meds.includes(a) && meds.includes(b))
    .map(([a, b, message]) => ({ a, b, severity: 'High', message }));

  res.json({ conflicts: found });
});

export default r;
