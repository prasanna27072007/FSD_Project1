import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { api } from '../lib/api';
import Badge from '../components/Badge';
import RecordVitalsForm from '../components/RecordVitalsForm';

export default function PatientDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [live, setLive] = useState(null);
  const [interaction, setInteraction] = useState(null);

  const { data: patient, isLoading } = useQuery({
    queryKey: ['patient', id],
    queryFn: () => api.get(`/patients/${id}`).then((r) => r.data),
  });

  const { data: vitals = [] } = useQuery({
    queryKey: ['vitals', id],
    queryFn: () => api.get(`/vitals/${id}`).then((r) => r.data),
  });

  const check = useMutation({
    mutationFn: () =>
      api
        .post('/medications/check-interaction', { medications: patient?.medications || [] })
        .then((r) => r.data),
    onSuccess: (data) => setInteraction(data),
  });

  useEffect(() => {
    const socket = io(window.location.origin);
    socket.emit('join:patient', id);
    socket.on('vitals:update', (payload) => {
      if (String(payload.patient?._id || payload.patient) === String(id)) {
        setLive(payload);
        queryClient.invalidateQueries({ queryKey: ['vitals', id] });
      }
    });

    return () => socket.disconnect();
  }, [id, queryClient]);

  if (isLoading) {
    return <div className="animate-pulse text-slate-400">Loading patient record…</div>;
  }

  if (!patient) {
    return <div>Patient not found.</div>;
  }

  const riskTone = patient.risk === 'Critical' ? 'red' : patient.risk === 'High' ? 'yellow' : patient.risk === 'Medium' ? 'blue' : 'green';

  return (
    <div className="space-y-5">
      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="text-xs text-slate-500">{patient.mrn}</div>
            <h1 className="mt-1 text-3xl font-bold">{patient.name}</h1>
            <div className="mt-2 text-sm text-slate-400">
              {patient.age} years · {patient.gender} · {patient.condition}
            </div>
          </div>
          <Badge tone={riskTone}>{patient.risk} risk</Badge>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_.6fr]">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Vitals timeline</h2>
              <p className="text-xs text-slate-500">{live ? 'Live update received' : 'Historical trend'}</p>
            </div>
            {live && <Badge tone="green">Live</Badge>}
          </div>

          <RecordVitalsForm patientId={id} />

          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={vitals}>
                <CartesianGrid stroke="#ffffff10" vertical={false} />
                <XAxis
                  dataKey="recordedAt"
                  tickFormatter={(value) => new Date(value).getHours() + ':00'}
                  stroke="#64748b"
                  fontSize={11}
                />
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

        <div className="space-y-5">
          <section className="glass rounded-2xl p-5">
            <h2 className="font-semibold">Allergies</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {patient.allergies?.length ? (
                patient.allergies.map((item) => <Badge key={item} tone="red">{item}</Badge>)
              ) : (
                <span className="text-sm text-slate-500">No known allergies</span>
              )}
            </div>
          </section>

          <section className="glass rounded-2xl p-5">
            <h2 className="font-semibold">Medications</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {patient.medications?.length ? (
                patient.medications.map((item) => (
                  <li key={item} className="rounded-lg bg-white/5 p-2">
                    {item}
                  </li>
                ))
              ) : (
                <li className="text-slate-500">No active medications recorded.</li>
              )}
            </ul>
          </section>

          <section className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Medication safety</h2>
              <button
                type="button"
                onClick={() => check.mutate()}
                className="rounded-lg bg-blue-400/10 px-3 py-1.5 text-xs text-blue-300"
              >
                Check interactions
              </button>
            </div>

            {interaction && (
              <div className="mt-3 text-sm">
                {interaction.conflicts?.length ? (
                  interaction.conflicts.map((conflict) => (
                    <div key={conflict.message} className="mb-2 rounded-lg bg-rose-400/10 p-2 text-rose-200">
                      {conflict.message}
                    </div>
                  ))
                ) : (
                  <div className="text-emerald-300">No known demo conflicts detected.</div>
                )}
              </div>
            )}
          </section>

          <section className="glass rounded-2xl p-5">
            <h2 className="font-semibold">History</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              {patient.history?.length ? (
                patient.history.map((item) => <li key={item}>• {item}</li>)
              ) : (
                <li>No documented history available.</li>
              )}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
