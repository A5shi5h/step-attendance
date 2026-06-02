import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const STEPS = { INPUT: 'input', CONFIRM: 'confirm', SUCCESS: 'success', ERROR: 'error' };

export default function AttendancePage() {
  const [step, setStep] = useState(STEPS.INPUT);
  const [roll, setRoll] = useState('');
  const [teacher, setTeacher] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    fetchActiveSession();
  }, []);

  async function fetchActiveSession() {
    setSessionLoading(true);
    try {
      const res = await api.get('/sessions/active');
      setSession(res.data.session);
    } catch {
      setSession(null);
    } finally {
      setSessionLoading(false);
    }
  }

  async function handleSearch(e) {
    e.preventDefault();
    if (!roll.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/teachers/roll/${roll.trim()}`);
      setTeacher(res.data);
      setStep(STEPS.CONFIRM);
    } catch (err) {
      if (err.response?.status === 404) setError('No teacher found with this Roll Number. Please check and try again.');
      else setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    if (!session) return;
    setLoading(true);
    setError('');
    try {
      await api.post('/attendance', { teacher_id: teacher.id, session_id: session.id });
      setStep(STEPS.SUCCESS);
    } catch (err) {
      if (err.response?.status === 409) {
        setError('Attendance already submitted for this session.\n\nPlease contact the administrator if changes are required.');
        setStep(STEPS.ERROR);
      } else {
        setError('Failed to record attendance. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setStep(STEPS.INPUT);
    setRoll('');
    setTeacher(null);
    setError('');
    fetchActiveSession();
  }

  return (
    <div className="min-h-screen bg-[#0A0C12] flex flex-col">
      {/* Header */}
      <header className="px-5 py-4 border-b border-[#1E2440]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center">
            <span className="text-cyan-400 text-sm">✦</span>
          </div>
          <div>
            <p className="font-display font-bold text-white text-sm leading-tight">AI & Coding Workshop</p>
            <p className="text-xs text-slate-500 font-mono">Attendance Portal</p>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-5 py-8">
        <div className="w-full max-w-sm animate-fade-in-up">

          {/* Session Status Banner */}
          <div className="mb-6">
            {sessionLoading ? (
              <div className="h-12 bg-[#161A2B] rounded-xl animate-pulse" />
            ) : session ? (
              <div className="bg-emerald-400/10 border border-emerald-400/30 rounded-xl px-4 py-3 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-glow flex-shrink-0" />
                <div>
                  <p className="text-emerald-400 text-xs font-mono font-medium">ACTIVE SESSION</p>
                  <p className="text-white text-sm font-display font-semibold">
                    Day {session.day_number} · Session {session.session_number}
                  </p>
                  {session.session_topic && (
                    <p className="text-slate-400 text-xs mt-0.5">{session.session_topic}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-amber-400/10 border border-amber-400/30 rounded-xl px-4 py-3 flex items-center gap-3">
                <span className="text-amber-400 text-lg flex-shrink-0">⏳</span>
                <div>
                  <p className="text-amber-400 text-xs font-mono font-medium">NO ACTIVE SESSION</p>
                  <p className="text-slate-300 text-sm">Please wait for instructions from the organizers.</p>
                </div>
              </div>
            )}
          </div>

          {/* Step: Input Roll Number */}
          {step === STEPS.INPUT && (
            <div className="bg-[#0F1220] border border-[#1E2440] rounded-2xl p-6">
              <h1 className="font-display font-bold text-white text-2xl mb-1">Mark Attendance</h1>
              <p className="text-slate-400 text-sm mb-6">Enter your Roll Number to get started</p>

              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <label className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-2 block">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    value={roll}
                    onChange={e => setRoll(e.target.value.toUpperCase())}
                    placeholder="e.g. T045"
                    autoFocus
                    className="w-full bg-[#161A2B] border border-[#2A3155] rounded-xl px-4 py-4 text-white text-xl font-mono font-medium placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all text-center tracking-widest uppercase"
                    disabled={!session || loading}
                  />
                </div>

                {error && (
                  <p className="text-rose-400 text-sm bg-rose-400/10 border border-rose-400/20 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!roll.trim() || !session || loading}
                  className="w-full bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 disabled:cursor-not-allowed text-[#0A0C12] font-display font-bold text-base py-4 rounded-xl transition-all active:scale-95"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-[#0A0C12]/40 border-t-[#0A0C12] rounded-full animate-spin-slow" />
                      Searching...
                    </span>
                  ) : 'Find My Record'}
                </button>
              </form>
            </div>
          )}

          {/* Step: Confirm */}
          {step === STEPS.CONFIRM && teacher && session && (
            <div className="bg-[#0F1220] border border-[#1E2440] rounded-2xl p-6 animate-fade-in-up">
              <div className="flex items-center gap-2 mb-5">
                <span className="text-emerald-400 text-lg">✓</span>
                <h2 className="font-display font-bold text-white text-xl">Teacher Found</h2>
              </div>

              <div className="bg-[#161A2B] rounded-xl p-4 mb-5 space-y-2.5">
                <div>
                  <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">Name</p>
                  <p className="text-white font-semibold text-lg leading-tight">{teacher.full_name}</p>
                </div>
                <div>
                  <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">School</p>
                  <p className="text-slate-200 text-sm">{teacher.school_name}</p>
                </div>
                <div>
                  <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">Roll Number</p>
                  <p className="text-cyan-400 font-mono font-medium">{teacher.roll_number}</p>
                </div>
              </div>

              <div className="bg-cyan-400/10 border border-cyan-400/30 rounded-xl px-4 py-3 mb-5">
                <p className="text-xs font-mono text-cyan-400/70 uppercase tracking-widest mb-0.5">Marking for</p>
                <p className="text-cyan-400 font-display font-bold text-base">
                  Day {session.day_number} · Session {session.session_number}
                </p>
                {session.session_topic && <p className="text-slate-400 text-xs mt-0.5">{session.session_topic}</p>}
              </div>

              {error && (
                <p className="text-rose-400 text-sm bg-rose-400/10 border border-rose-400/20 rounded-lg px-3 py-2 mb-4">
                  {error}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 bg-[#1E2440] hover:bg-[#2A3155] text-slate-300 font-semibold py-3.5 rounded-xl transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="flex-[2] bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 text-[#0A0C12] font-display font-bold py-3.5 rounded-xl transition-all active:scale-95"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-[#0A0C12]/40 border-t-[#0A0C12] rounded-full animate-spin-slow" />
                      Confirming...
                    </span>
                  ) : 'Confirm Attendance'}
                </button>
              </div>
            </div>
          )}

          {/* Step: Success */}
          {step === STEPS.SUCCESS && (
            <div className="bg-[#0F1220] border border-emerald-400/30 rounded-2xl p-6 text-center animate-fade-in-up">
              <div className="w-16 h-16 rounded-full bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-emerald-400 text-3xl">✓</span>
              </div>
              <h2 className="font-display font-bold text-white text-2xl mb-2">Attendance Recorded!</h2>
              <p className="text-slate-400 text-sm mb-1">Successfully marked for</p>
              <p className="text-emerald-400 font-display font-semibold mb-1">
                Day {session?.day_number} · Session {session?.session_number}
              </p>
              <p className="text-slate-500 text-xs font-mono mb-6">
                {new Date().toLocaleString('en-IN')}
              </p>
              <div className="bg-[#161A2B] rounded-xl p-3 mb-6 text-left">
                <p className="text-slate-400 text-xs font-mono">{teacher?.full_name}</p>
                <p className="text-cyan-400 text-xs font-mono">{teacher?.roll_number} · {teacher?.school_name}</p>
              </div>
              <button
                onClick={handleReset}
                className="w-full bg-[#1E2440] hover:bg-[#2A3155] text-slate-300 font-semibold py-3.5 rounded-xl transition-all"
              >
                Mark Another
              </button>
            </div>
          )}

          {/* Step: Error (duplicate etc.) */}
          {step === STEPS.ERROR && (
            <div className="bg-[#0F1220] border border-amber-400/30 rounded-2xl p-6 text-center animate-fade-in-up">
              <div className="w-16 h-16 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-amber-400 text-3xl">!</span>
              </div>
              <h2 className="font-display font-bold text-white text-xl mb-3">Already Submitted</h2>
              <p className="text-slate-300 text-sm mb-2">Attendance already submitted for this session.</p>
              <p className="text-slate-500 text-xs mb-6">Please contact the administrator if changes are required.</p>
              <button
                onClick={handleReset}
                className="w-full bg-[#1E2440] hover:bg-[#2A3155] text-slate-300 font-semibold py-3.5 rounded-xl transition-all"
              >
                Go Back
              </button>
            </div>
          )}
        </div>
      </div>

      <footer className="px-5 py-4 text-center">
        <p className="text-slate-600 text-xs font-mono">AI & Coding Workshop · Teacher Attendance System</p>
      </footer>
    </div>
  );
}
