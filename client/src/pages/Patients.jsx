import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight, Plus, X } from 'lucide-react';
import { api } from '../lib/api';
import Badge from '../components/Badge';

const emptyForm = {
  mrn: '',
  name: '',
  age: '',
  gender: 'Male',
  condition: '',
  risk: 'Low',
  allergies: '',
  history: '',
  symptoms: '',
  medications: '',
};

export default function Patients() {
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data = [], isLoading } = useQuery({
    queryKey: ['patients', q],
    queryFn: () => api.get('/patients', { params: { q } }).then((r) => r.data),
  });

  const createPatient = useMutation({
    mutationFn: (payload) => api.post('/patients', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['patients'] });
      setShowForm(false);
      setForm(emptyForm);
    },
  });

  const summary = useMemo(() => {
    const buckets = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    for (const patient of data) {
      if (buckets[patient.risk] !== undefined) buckets[patient.risk] += 1;
    }
    return buckets;
  }, [data]);

  const submit = (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      age: Number(form.age),
      allergies: form.allergies ? form.allergies.split(',').map((item) => item.trim()).filter(Boolean) : [],
      history: form.history ? form.history.split(',').map((item) => item.trim()).filter(Boolean) : [],
      symptoms: form.symptoms ? form.symptoms.split(',').map((item) => item.trim()).filter(Boolean) : [],
      medications: form.medications ? form.medications.split(',').map((item) => item.trim()).filter(Boolean) : [],
    };
    createPatient.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[.22em] text-teal-300">Population</div>
          <h1 className="mt-2 text-3xl font-bold">Patients</h1>
          <p className="mt-1 text-slate-400">Search and triage your patient population.</p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm((current) => !current)}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-400 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-teal-300"
        >
          <Plus size={16} />
          {showForm ? 'Close form' : 'Add patient'}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {Object.entries(summary).map(([label, value]) => (
          <div key={label} className="glass rounded-2xl p-4">
            <div className="text-xs uppercase tracking-[.2em] text-slate-500">{label}</div>
            <div className="mt-2 text-2xl font-bold">{value}</div>
          </div>
        ))}
      </div>

      {showForm && (
        <form onSubmit={submit} className="glass rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Create patient record</h2>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-white/10 p-2 text-slate-400">
              <X size={16} />
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-slate-300">MRN<input value={form.mrn} onChange={(e) => setForm({ ...form, mrn: e.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm" required /></label>
            <label className="text-sm text-slate-300">Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm" required /></label>
            <label className="text-sm text-slate-300">Age<input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm" required /></label>
            <label className="text-sm text-slate-300">Gender<select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm"><option>Male</option><option>Female</option><option>Other</option></select></label>
            <label className="text-sm text-slate-300">Condition<input value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm" required /></label>
            <label className="text-sm text-slate-300">Risk<select value={form.risk} onChange={(e) => setForm({ ...form, risk: e.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm"><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select></label>
            <label className="md:col-span-2 text-sm text-slate-300">Allergies<input value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm" placeholder="Penicillin, Sulfa" /></label>
            <label className="md:col-span-2 text-sm text-slate-300">History<input value={form.history} onChange={(e) => setForm({ ...form, history: e.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm" placeholder="Routine follow-up, prior admission" /></label>
            <label className="md:col-span-2 text-sm text-slate-300">Symptoms<input value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm" placeholder="fatigue, fever" /></label>
            <label className="md:col-span-2 text-sm text-slate-300">Medications<input value={form.medications} onChange={(e) => setForm({ ...form, medications: e.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm" placeholder="lisinopril, metformin" /></label>
          </div>

          <div className="mt-5 flex justify-end">
            <button type="submit" disabled={createPatient.isPending} className="rounded-xl bg-teal-400 px-4 py-2.5 text-sm font-semibold text-slate-950 disabled:opacity-60">
              {createPatient.isPending ? 'Saving...' : 'Save patient'}
            </button>
          </div>
        </form>
      )}

      <div className="glass overflow-hidden rounded-2xl">
        <div className="border-b border-white/10 p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 text-slate-500" size={17} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-teal-400"
              placeholder="Search name, MRN or condition…"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[.03] text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-4">Patient</th>
                <th>Condition</th>
                <th>Age</th>
                <th>Risk</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [1, 2, 3, 4].map((item) => (
                  <tr key={item} className="border-t border-white/5">
                    <td colSpan="5" className="px-5 py-5">
                      <div className="h-5 animate-pulse rounded bg-white/5" />
                    </td>
                  </tr>
                ))
              ) : (
                data.map((patient) => (
                  <tr key={patient._id} className="border-t border-white/5 transition hover:bg-white/[.025]">
                    <td className="px-5 py-4">
                      <div className="font-medium">{patient.name}</div>
                      <div className="text-xs text-slate-500">{patient.mrn}</div>
                    </td>
                    <td>{patient.condition}</td>
                    <td>{patient.age}</td>
                    <td>
                      <Badge tone={patient.risk === 'Critical' ? 'red' : patient.risk === 'High' ? 'yellow' : patient.risk === 'Medium' ? 'blue' : 'green'}>
                        {patient.risk}
                      </Badge>
                    </td>
                    <td>
                      <Link to={`/patients/${patient._id}`} className="inline-flex rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-white">
                        <ChevronRight size={18} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {!isLoading && !data.length && <div className="p-12 text-center text-sm text-slate-500">No patients match your search.</div>}
        </div>
      </div>
    </div>
  );
}

