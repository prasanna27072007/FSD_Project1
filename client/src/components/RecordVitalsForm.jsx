import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Activity } from 'lucide-react';
import { api } from '../lib/api';

const fields = [
  { name: 'heartRate', label: 'Heart rate', unit: 'bpm', min: 1, max: 300, step: 1 },
  { name: 'systolic', label: 'Systolic BP', unit: 'mmHg', min: 1, max: 300, step: 1 },
  { name: 'diastolic', label: 'Diastolic BP', unit: 'mmHg', min: 1, max: 200, step: 1 },
  { name: 'spo2', label: 'SpO₂', unit: '%', min: 0, max: 100, step: 0.1 },
  { name: 'temperature', label: 'Temperature', unit: '°C', min: 25, max: 45, step: 0.1 },
];

const emptyForm = {
  heartRate: '',
  systolic: '',
  diastolic: '',
  spo2: '',
  temperature: '',
};

export default function RecordVitalsForm({ patientId }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);

  const mutation = useMutation({
    mutationFn: (payload) => api.post('/vitals', payload),
    onSuccess: () => {
      setForm(emptyForm);
      queryClient.invalidateQueries({ queryKey: ['vitals', patientId] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  const submit = (event) => {
    event.preventDefault();
    mutation.mutate({
      patient: patientId,
      heartRate: Number(form.heartRate),
      systolic: Number(form.systolic),
      diastolic: Number(form.diastolic),
      spo2: Number(form.spo2),
      temperature: Number(form.temperature),
    });
  };

  return (
    <form onSubmit={submit} className="mt-5 rounded-xl border border-white/10 bg-white/[.02] p-4">
      <div className="mb-4 flex items-center gap-2">
        <Activity size={16} className="text-teal-300" />
        <h3 className="text-sm font-semibold">Record observation</h3>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {fields.map(({ name, label, unit, min, max, step }) => (
          <label key={name} className="text-xs text-slate-400">
            {label} ({unit})
            <input
              aria-label={`${label} (${unit})`}
              type="number"
              min={min}
              max={max}
              step={step}
              required
              value={form[name]}
              onChange={(event) => setForm({ ...form, [name]: event.target.value })}
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-teal-400"
            />
          </label>
        ))}
      </div>

      {mutation.isError && (
        <p role="alert" className="mt-3 text-sm text-rose-300">
          {mutation.error.response?.data?.message || 'Could not save the observation. Please try again.'}
        </p>
      )}
      {mutation.isSuccess && (
        <p role="status" className="mt-3 text-sm text-emerald-300">
          Observation recorded.
        </p>
      )}

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-lg bg-teal-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-teal-300 disabled:opacity-50"
        >
          {mutation.isPending ? 'Saving…' : 'Save observation'}
        </button>
      </div>
    </form>
  );
}
