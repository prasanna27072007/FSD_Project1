import Patient from '../models/Patient.js';
import Alert from '../models/Alert.js';
import Vitals from '../models/Vitals.js';

export async function overview(req, res) {
  const [patients, alerts, vitals, risk] = await Promise.all([
    Patient.countDocuments(),
    Alert.countDocuments({ acknowledged: false }),
    Vitals.countDocuments(),
    Patient.aggregate([{ $group: { _id: '$risk', count: { $sum: 1 } } }]),
  ]);

  res.json({
    patients,
    activeAlerts: alerts,
    vitalRecords: vitals,
    risk: risk.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
  });
}

