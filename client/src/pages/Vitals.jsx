import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, HeartPulse, Thermometer, Droplets } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { api } from '../lib/api';
import RecordVitalsForm from '../components/RecordVitalsForm';

export default function VitalSigns() {
  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: () => api.get('/patients').then((r) => r.data),
  });

  const [patientId, setPatientId] = useState('');
  const selectedPatient = patients.find((patient) => patient._id === patientId) || patients[0] || null;
  const selectedPatientId = selectedPatient?._id || '';
  const { data: vitals = [] } = useQuery({
    queryKey: ['vitals', selectedPatientId],
    enabled: Boolean(selectedPatientId),
    queryFn: () => api.get(`/vitals/${selectedPatientId}`).then((r) => r.data),
  });

  const latest = vitals[vitals.length - 1] || null;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.22em] text-emerald-300">
          <HeartPulse size={15} />
          Observations
        </div>
        <h1 className="mt-2 text-3xl font-bold">Vital Signs</h1>
        <p className="mt-1 text-slate-400">Review patient trends and recent observations.</p>
      </div>

      {selectedPatient && (
        <div className="glass rounded-2xl p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[.2em] text-slate-500">Selected patient</div>
              <div className="mt-2 text-2xl font-bold">{selectedPatient.name}</div>
            </div>

            <select
              value={selectedPatient._id}
              onChange={(event) => setPatientId(event.target.value)}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none"
            >
              {patients.map((patient) => (
                <option key={patient._id} value={patient._id}>{patient.name}</option>
              ))}
            </select>
          </div>
          <RecordVitalsForm patientId={selectedPatient._id} />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 text-sm text-slate-400"><HeartPulse size={16} /> Heart rate</div>
          <div className="mt-3 text-2xl font-bold">{latest?.heartRate ?? '--'} bpm</div>
          <div className="text-xs text-slate-500">Current trend</div>
        </div>
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 text-sm text-slate-400"><Droplets size={16} /> SpO₂</div>
          <div className="mt-3 text-2xl font-bold">{latest?.spo2 ?? '--'}%</div>
          <div className="text-xs text-slate-500">Oxygenation</div>
        </div>
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 text-sm text-slate-400"><Thermometer size={16} /> Temperature</div>
          <div className="mt-3 text-2xl font-bold">{latest?.temperature ?? '--'}°C</div>
          <div className="text-xs text-slate-500">Core temp</div>
        </div>
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 text-sm text-slate-400"><Activity size={16} /> Status</div>
          <div className="mt-3 text-xl font-bold">{selectedPatient?.risk || 'Low'}</div>
          <div className="text-xs text-slate-500">Risk level</div>
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <h2 className="font-semibold">Observation trend</h2>
        <div className="mt-5 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={vitals}>
              <CartesianGrid stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="recordedAt" tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{
                  background: '#0c1f34',
                  border: '1px solid #ffffff15',
                  borderRadius: 12,
                }}
              />
              <Line type="monotone" dataKey="heartRate" stroke="#2dd4bf" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="spo2" stroke="#60a5fa" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <h2 className="font-semibold">Recent entries</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="pb-3">Time</th>
                <th className="pb-3">HR</th>
                <th className="pb-3">SpO₂</th>
                <th className="pb-3">Temp</th>
              </tr>
            </thead>
            <tbody>
              {vitals.slice(-8).map((item) => (
                <tr key={item._id || item.recordedAt} className="border-t border-white/5">
                  <td className="py-3 text-slate-300">{new Date(item.recordedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                  <td className="py-3">{item.heartRate}</td>
                  <td className="py-3">{item.spo2}</td>
                  <td className="py-3">{item.temperature}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
