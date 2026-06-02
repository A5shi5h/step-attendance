import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

// ─── Icons ─────────────────────────────────────────────────────────────────
const Icon = ({ name, className = 'w-4 h-4' }) => {
  const icons = {
    dashboard: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    teachers: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    sessions: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    attendance: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
    certificate: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>,
    logout: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
    upload: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
    download: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
    plus: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
    edit: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
    trash: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
    search: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    menu: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>,
    x: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  };
  return icons[name] || null;
};

// ─── Status Badge ────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const colors = {
    Present: 'bg-emerald-400/15 text-emerald-400 border-emerald-400/30',
    Late: 'bg-amber-400/15 text-amber-400 border-amber-400/30',
    Absent: 'bg-rose-400/15 text-rose-400 border-rose-400/30',
    Active: 'bg-cyan-400/15 text-cyan-400 border-cyan-400/30',
    Pending: 'bg-slate-400/15 text-slate-400 border-slate-400/30',
    Closed: 'bg-slate-600/15 text-slate-500 border-slate-600/30',
  };
  return (
    <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${colors[status] || colors.Pending}`}>
      {status}
    </span>
  );
}

// ─── Modal ───────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0F1220] border border-[#1E2440] rounded-2xl w-full max-w-md animate-fade-in-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2440]">
          <h3 className="font-display font-bold text-white text-lg">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <Icon name="x" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Teacher Form ─────────────────────────────────────────────────────────────
function TeacherForm({ initial = {}, onSubmit, onClose, loading }) {
  const [form, setForm] = useState({
    roll_number: initial.roll_number || '',
    full_name: initial.full_name || '',
    phone_number: initial.phone_number || '',
    school_name: initial.school_name || '',
  });
  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  return (
    <div className="space-y-4">
      {[
        { name: 'roll_number', label: 'Roll Number', placeholder: 'T001', mono: true },
        { name: 'full_name', label: 'Full Name', placeholder: 'John Doe' },
        { name: 'phone_number', label: 'Phone Number', placeholder: '9876543210' },
        { name: 'school_name', label: 'School Name', placeholder: 'ABC Higher Secondary School' },
      ].map(f => (
        <div key={f.name}>
          <label className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-1 block">{f.label}</label>
          <input
            name={f.name}
            value={form[f.name]}
            onChange={handle}
            placeholder={f.placeholder}
            className={`w-full bg-[#161A2B] border border-[#2A3155] rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 text-sm transition-all ${f.mono ? 'font-mono' : ''}`}
          />
        </div>
      ))}
      <div className="flex gap-3 pt-2">
        <button onClick={onClose} className="flex-1 bg-[#1E2440] hover:bg-[#2A3155] text-slate-300 font-semibold py-2.5 rounded-xl text-sm transition-all">Cancel</button>
        <button
          onClick={() => onSubmit(form)}
          disabled={loading || !form.roll_number || !form.full_name || !form.phone_number || !form.school_name}
          className="flex-[2] bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 text-[#0A0C12] font-display font-bold py-2.5 rounded-xl text-sm transition-all"
        >
          {loading ? 'Saving...' : 'Save Teacher'}
        </button>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data states
  const [analytics, setAnalytics] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [eligibility, setEligibility] = useState(null);

  // UI states
  const [teacherSearch, setTeacherSearch] = useState('');
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [attendanceSession, setAttendanceSession] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null); // { type: 'addTeacher' | 'editTeacher' | 'deleteTeacher' | 'deleteAttendance', data }

  const username = localStorage.getItem('admin_username') || 'Admin';

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  function logout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_username');
    navigate('/admin/login');
  }

  // ── Fetch helpers ──────────────────────────────────────────────────────────
  async function fetchAnalytics() {
    try { const r = await api.get('/attendance/analytics'); setAnalytics(r.data); } catch {}
  }
  async function fetchTeachers() {
    try { const r = await api.get(`/teachers?search=${teacherSearch}`); setTeachers(r.data); } catch {}
  }
  async function fetchSessions() {
    try { const r = await api.get('/sessions'); setSessions(r.data); } catch {}
  }
  async function fetchAttendance() {
    try {
      const params = new URLSearchParams();
      if (attendanceSearch) params.append('search', attendanceSearch);
      if (attendanceSession) params.append('session_id', attendanceSession);
      const r = await api.get(`/attendance?${params}`);
      setAttendance(r.data);
    } catch {}
  }
  async function fetchEligibility() {
    try { const r = await api.get('/attendance/eligibility'); setEligibility(r.data); } catch {}
  }

  useEffect(() => { fetchAnalytics(); }, []);
  useEffect(() => { if (tab === 'teachers') fetchTeachers(); }, [tab, teacherSearch]);
  useEffect(() => { if (tab === 'sessions') fetchSessions(); }, [tab]);
  useEffect(() => { if (tab === 'attendance') fetchAttendance(); }, [tab, attendanceSearch, attendanceSession]);
  useEffect(() => { if (tab === 'certificates') fetchEligibility(); }, [tab]);

  // ── Teacher CRUD ───────────────────────────────────────────────────────────
  async function handleAddTeacher(form) {
    setLoading(true);
    try {
      await api.post('/teachers', form);
      showToast('Teacher added successfully');
      setModal(null);
      fetchTeachers();
      fetchAnalytics();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to add teacher', 'error');
    } finally { setLoading(false); }
  }

  async function handleEditTeacher(form) {
    setLoading(true);
    try {
      await api.put(`/teachers/${modal.data.id}`, form);
      showToast('Teacher updated');
      setModal(null);
      fetchTeachers();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update teacher', 'error');
    } finally { setLoading(false); }
  }

  async function handleDeleteTeacher() {
    setLoading(true);
    try {
      await api.delete(`/teachers/${modal.data.id}`);
      showToast('Teacher deleted');
      setModal(null);
      fetchTeachers();
      fetchAnalytics();
    } catch {
      showToast('Failed to delete teacher', 'error');
    } finally { setLoading(false); }
  }

  // ── Excel upload ───────────────────────────────────────────────────────────
  const fileInputRef = useRef();
  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    setLoading(true);
    try {
      const res = await api.post('/teachers/upload', fd);
      showToast(`Imported ${res.data.inserted} teachers. Skipped: ${res.data.skipped}`);
      fetchTeachers(); fetchAnalytics();
    } catch (err) {
      showToast(err.response?.data?.error || 'Upload failed', 'error');
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  }

  // ── Session controls ───────────────────────────────────────────────────────
  async function handleActivate(id) {
    try {
      await api.put(`/sessions/${id}/activate`);
      showToast('Session activated');
      fetchSessions(); fetchAnalytics();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to activate', 'error');
    }
  }
  async function handleClose(id) {
    try {
      await api.put(`/sessions/${id}/close`);
      showToast('Session closed');
      fetchSessions(); fetchAnalytics();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to close', 'error');
    }
  }
  async function handleTopicEdit(sess) {
    const topic = prompt(`Edit topic for Day ${sess.day_number} Session ${sess.session_number}:`, sess.session_topic);
    if (topic === null) return;
    try {
      await api.put(`/sessions/${sess.id}/topic`, { session_topic: topic });
      showToast('Topic updated');
      fetchSessions();
    } catch { showToast('Failed to update topic', 'error'); }
  }

  // ── Attendance status change ───────────────────────────────────────────────
  async function handleStatusChange(id, status) {
    try {
      await api.put(`/attendance/${id}/status`, { status });
      showToast(`Status changed to ${status}`);
      fetchAttendance();
    } catch { showToast('Failed to update status', 'error'); }
  }

  async function handleDeleteAttendance() {
    setLoading(true);
    try {
      await api.delete(`/attendance/${modal.data.id}`);
      showToast('Attendance record deleted');
      setModal(null);
      fetchAttendance();
      fetchAnalytics();
      if (tab === 'certificates') fetchEligibility();
    } catch {
      showToast('Failed to delete attendance record', 'error');
    } finally {
      setLoading(false);
    }
  }

  // ── Export ─────────────────────────────────────────────────────────────────
  function exportAttendance() { window.open(`/api/attendance/export?token=${localStorage.getItem('admin_token')}`, '_blank'); }
  function exportEligibility() { window.open(`/api/attendance/export/eligibility?token=${localStorage.getItem('admin_token')}`, '_blank'); }
  // Proper export with auth header
  async function handleExport(type) {
    try {
      const url = type === 'eligibility' ? '/attendance/export/eligibility' : '/attendance/export';
      const res = await api.get(url, { responseType: 'blob' });
      const blob = new Blob([res.data]);
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = type === 'eligibility' ? 'certificate_eligibility.xlsx' : 'attendance_records.xlsx';
      link.click();
    } catch { showToast('Export failed', 'error'); }
  }

  // ─── Nav items ──────────────────────────────────────────────────────────────
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'teachers', label: 'Teachers', icon: 'teachers' },
    { id: 'sessions', label: 'Sessions', icon: 'sessions' },
    { id: 'attendance', label: 'Attendance', icon: 'attendance' },
    { id: 'certificates', label: 'Certificates', icon: 'certificate' },
  ];

  function NavItem({ item }) {
    return (
      <button
        onClick={() => { setTab(item.id); setSidebarOpen(false); }}
        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
          tab === item.id
            ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20'
            : 'text-slate-400 hover:text-white hover:bg-[#1E2440]'
        }`}
      >
        <Icon name={item.icon} />
        {item.label}
      </button>
    );
  }

  // ─── Sidebar ────────────────────────────────────────────────────────────────
  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-[#0F1220] border-r border-[#1E2440]">
      <div className="px-5 py-5 border-b border-[#1E2440]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center">
            <span className="text-cyan-400 font-display font-bold">✦</span>
          </div>
          <div>
            <p className="font-display font-bold text-white text-sm">Workshop Admin</p>
            <p className="text-slate-500 text-xs font-mono">{username}</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(item => <NavItem key={item.id} item={item} />)}
      </nav>
      <div className="p-3 border-t border-[#1E2440]">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-400/5 transition-all"
        >
          <Icon name="logout" />
          Sign Out
        </button>
      </div>
    </aside>
  );

  // ─── Dashboard Tab ──────────────────────────────────────────────────────────
  const DashboardTab = () => {
    const cards = [
      { label: 'Total Teachers', value: analytics?.total_teachers ?? '–', color: 'cyan', icon: 'teachers' },
      { label: 'Active Session', value: analytics?.active_session ? `Day ${analytics.active_session.day_number} · S${analytics.active_session.session_number}` : 'None', color: 'emerald', icon: 'sessions' },
      { label: 'Attendance Submitted', value: analytics?.attendance_submitted ?? '–', color: 'amber', icon: 'attendance' },
      { label: 'Attendance Pending', value: analytics?.attendance_pending ?? '–', color: 'rose', icon: 'attendance' },
      { label: 'Attendance %', value: analytics ? `${analytics.attendance_percentage}%` : '–', color: 'cyan', icon: 'certificate' },
    ];
    const colorMap = {
      cyan: 'bg-cyan-400/10 border-cyan-400/20 text-cyan-400',
      emerald: 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400',
      amber: 'bg-amber-400/10 border-amber-400/20 text-amber-400',
      rose: 'bg-rose-400/10 border-rose-400/20 text-rose-400',
    };
    return (
      <div>
        <h2 className="font-display font-bold text-white text-2xl mb-6">Overview</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {cards.map(c => (
            <div key={c.label} className={`bg-[#0F1220] border rounded-2xl p-5 ${colorMap[c.color].split(' ').slice(1).join(' ')}`}>
              <div className={`w-8 h-8 rounded-lg ${colorMap[c.color].split(' ')[0]} border ${colorMap[c.color].split(' ')[1]} flex items-center justify-center mb-3`}>
                <Icon name={c.icon} className={`w-4 h-4 ${colorMap[c.color].split(' ')[2]}`} />
              </div>
              <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-1">{c.label}</p>
              <p className={`font-display font-bold text-2xl ${colorMap[c.color].split(' ')[2]}`}>{c.value}</p>
            </div>
          ))}
        </div>
        <div className="bg-[#0F1220] border border-[#1E2440] rounded-2xl p-5">
          <h3 className="font-display font-semibold text-white mb-1">Active Session</h3>
          {analytics?.active_session ? (
            <div>
              <p className="text-slate-400 text-sm">Day {analytics.active_session.day_number} · Session {analytics.active_session.session_number}</p>
              {analytics.active_session.session_topic && <p className="text-cyan-400 text-sm mt-1">{analytics.active_session.session_topic}</p>}
              <p className="text-slate-500 text-xs mt-2 font-mono">
                Activated: {analytics.active_session.activated_at ? new Date(analytics.active_session.activated_at).toLocaleString('en-IN') : '–'}
              </p>
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No session currently active.</p>
          )}
        </div>
      </div>
    );
  };

  // ─── Teachers Tab ───────────────────────────────────────────────────────────
  const TeachersTab = () => (
    <div>
      <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
        <h2 className="font-display font-bold text-white text-2xl">Teachers</h2>
        <div className="flex flex-wrap gap-2">
          <input
            value={teacherSearch}
            onChange={e => setTeacherSearch(e.target.value)}
            placeholder="Search..."
            className="bg-[#161A2B] border border-[#2A3155] rounded-xl px-3 py-2 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-400 w-48"
          />
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleUpload} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 bg-[#1E2440] hover:bg-[#2A3155] text-slate-300 px-4 py-2 rounded-xl text-sm font-medium transition-all">
            <Icon name="upload" /> Import Excel
          </button>
          <button onClick={() => setModal({ type: 'addTeacher' })} className="flex items-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-[#0A0C12] px-4 py-2 rounded-xl text-sm font-display font-bold transition-all">
            <Icon name="plus" /> Add Teacher
          </button>
        </div>
      </div>
      <div className="bg-[#0F1220] border border-[#1E2440] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1E2440]">
                {['Roll No', 'Name', 'Phone', 'School', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-mono text-slate-500 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teachers.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No teachers found</td></tr>
              ) : teachers.map(t => (
                <tr key={t.id} className="border-b border-[#161A2B] hover:bg-[#161A2B] transition-colors">
                  <td className="px-4 py-3 font-mono text-cyan-400 font-medium">{t.roll_number}</td>
                  <td className="px-4 py-3 text-white font-medium">{t.full_name}</td>
                  <td className="px-4 py-3 text-slate-400 font-mono">{t.phone_number}</td>
                  <td className="px-4 py-3 text-slate-400 max-w-[200px] truncate">{t.school_name}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setModal({ type: 'editTeacher', data: t })} className="text-slate-400 hover:text-cyan-400 transition-colors">
                        <Icon name="edit" />
                      </button>
                      <button onClick={() => setModal({ type: 'deleteTeacher', data: t })} className="text-slate-400 hover:text-rose-400 transition-colors">
                        <Icon name="trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-slate-600 text-xs mt-3 font-mono">{teachers.length} teacher(s) found</p>
    </div>
  );

  // ─── Sessions Tab ────────────────────────────────────────────────────────────
  const SessionsTab = () => {
    const days = [1, 2, 3, 4];
    return (
      <div>
        <h2 className="font-display font-bold text-white text-2xl mb-6">Sessions</h2>
        <div className="space-y-6">
          {days.map(d => (
            <div key={d} className="bg-[#0F1220] border border-[#1E2440] rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-[#1E2440] bg-[#161A2B]">
                <h3 className="font-display font-bold text-white">Day {d}</h3>
              </div>
              <div className="divide-y divide-[#161A2B]">
                {sessions.filter(s => s.day_number === d).map(s => (
                  <div key={s.id} className="px-5 py-4 flex flex-wrap items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono text-slate-400 text-xs">S{s.session_number}</span>
                        <StatusBadge status={s.status} />
                      </div>
                      <p className="text-white text-sm font-medium truncate">
                        {s.session_topic || <span className="text-slate-500 italic">No topic set</span>}
                      </p>
                      {s.activated_at && <p className="text-slate-600 text-xs font-mono mt-0.5">Activated: {new Date(s.activated_at).toLocaleString('en-IN')}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleTopicEdit(s)} className="text-xs bg-[#1E2440] hover:bg-[#2A3155] text-slate-300 px-3 py-1.5 rounded-lg transition-all">
                        Edit Topic
                      </button>
                      {(s.status === 'Pending' || s.status === 'Closed') && (
                        <button onClick={() => handleActivate(s.id)} className="text-xs bg-cyan-400 hover:bg-cyan-300 text-[#0A0C12] font-bold px-3 py-1.5 rounded-lg transition-all">
                          {s.status === 'Closed' ? 'Reactivate' : 'Activate'}
                        </button>
                      )}
                      {s.status === 'Active' && (
                        <button onClick={() => handleClose(s.id)} className="text-xs bg-rose-400/20 hover:bg-rose-400/30 text-rose-400 font-bold px-3 py-1.5 rounded-lg transition-all">
                          Close
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ─── Attendance Tab ──────────────────────────────────────────────────────────
  const AttendanceTab = () => (
    <div>
      <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
        <h2 className="font-display font-bold text-white text-2xl">Attendance</h2>
        <div className="flex flex-wrap gap-2">
          <input
            value={attendanceSearch}
            onChange={e => setAttendanceSearch(e.target.value)}
            placeholder="Search teacher..."
            className="bg-[#161A2B] border border-[#2A3155] rounded-xl px-3 py-2 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-400 w-44"
          />
          <select
            value={attendanceSession}
            onChange={e => setAttendanceSession(e.target.value)}
            className="bg-[#161A2B] border border-[#2A3155] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-400"
          >
            <option value="">All Sessions</option>
            {sessions.map(s => (
              <option key={s.id} value={s.id}>Day {s.day_number} · S{s.session_number}</option>
            ))}
          </select>
          <button onClick={() => handleExport('attendance')} className="flex items-center gap-2 bg-emerald-400/10 hover:bg-emerald-400/20 border border-emerald-400/30 text-emerald-400 px-4 py-2 rounded-xl text-sm font-medium transition-all">
            <Icon name="download" /> Export
          </button>
        </div>
      </div>
      <div className="bg-[#0F1220] border border-[#1E2440] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1E2440]">
                {['Roll No', 'Name', 'School', 'Day', 'Session', 'Status', 'Timestamp', 'Change', 'Delete'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-mono text-slate-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {attendance.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-500">No records found</td></tr>
              ) : attendance.map(a => (
                <tr key={a.id} className="border-b border-[#161A2B] hover:bg-[#161A2B] transition-colors">
                  <td className="px-4 py-3 font-mono text-cyan-400 font-medium">{a.roll_number}</td>
                  <td className="px-4 py-3 text-white">{a.full_name}</td>
                  <td className="px-4 py-3 text-slate-400 max-w-[160px] truncate">{a.school_name}</td>
                  <td className="px-4 py-3 text-slate-400 text-center">{a.day_number}</td>
                  <td className="px-4 py-3 text-slate-400 text-center">{a.session_number}</td>
                  <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs whitespace-nowrap">
                    {a.timestamp ? new Date(a.timestamp).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : '–'}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={a.status}
                      onChange={e => handleStatusChange(a.id, e.target.value)}
                      className="bg-[#1E2440] border border-[#2A3155] rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:border-cyan-400"
                    >
                      <option>Present</option>
                      <option>Late</option>
                      <option>Absent</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setModal({ type: 'deleteAttendance', data: a })}
                      className="text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete attendance record"
                    >
                      <Icon name="trash" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-slate-600 text-xs mt-3 font-mono">{attendance.length} record(s)</p>
    </div>
  );

  // ─── Certificates Tab ─────────────────────────────────────────────────────────
  const CertificatesTab = () => (
    <div>
      <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
        <div>
          <h2 className="font-display font-bold text-white text-2xl">Certificate Eligibility</h2>
          <p className="text-slate-500 text-sm mt-0.5">Attendance ≥ 75% → Eligible · Total Sessions: {eligibility?.total_sessions ?? '–'}</p>
        </div>
        <button onClick={() => handleExport('eligibility')} className="flex items-center gap-2 bg-emerald-400/10 hover:bg-emerald-400/20 border border-emerald-400/30 text-emerald-400 px-4 py-2 rounded-xl text-sm font-medium transition-all">
          <Icon name="download" /> Export Report
        </button>
      </div>
      <div className="bg-[#0F1220] border border-[#1E2440] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1E2440]">
                {['Roll No', 'Name', 'School', 'Attended', 'Percentage', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-mono text-slate-500 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {eligibility?.teachers?.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No teacher data yet</td></tr>
              ) : eligibility?.teachers?.map(t => (
                <tr key={t.id} className="border-b border-[#161A2B] hover:bg-[#161A2B] transition-colors">
                  <td className="px-4 py-3 font-mono text-cyan-400 font-medium">{t.roll_number}</td>
                  <td className="px-4 py-3 text-white">{t.full_name}</td>
                  <td className="px-4 py-3 text-slate-400 max-w-[180px] truncate">{t.school_name}</td>
                  <td className="px-4 py-3 text-slate-300 text-center">{t.attended_sessions}/{eligibility.total_sessions}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-[#1E2440] rounded-full h-1.5 min-w-[60px]">
                        <div
                          className={`h-1.5 rounded-full ${t.eligible ? 'bg-emerald-400' : 'bg-rose-400'}`}
                          style={{ width: `${Math.min(100, t.attendance_percentage)}%` }}
                        />
                      </div>
                      <span className="text-slate-300 font-mono text-xs w-10">{t.attendance_percentage}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${t.eligible ? 'bg-emerald-400/15 text-emerald-400 border-emerald-400/30' : 'bg-rose-400/15 text-rose-400 border-rose-400/30'}`}>
                      {t.eligible ? 'Eligible' : 'Not Eligible'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const tabComponents = {
    dashboard: <DashboardTab />,
    teachers: <TeachersTab />,
    sessions: <SessionsTab />,
    attendance: <AttendanceTab />,
    certificates: <CertificatesTab />,
  };

  return (
    <div className="flex h-screen bg-[#0A0C12] overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex w-60 flex-shrink-0 flex-col">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 z-50">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-[#1E2440] bg-[#0F1220]">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-400 hover:text-white">
            <Icon name="menu" className="w-6 h-6" />
          </button>
          <p className="font-display font-bold text-white text-sm capitalize">{tab}</p>
          <div className="w-6" />
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5 md:p-8">
          <div className="max-w-6xl mx-auto">
            {tabComponents[tab]}
          </div>
        </main>
      </div>

      {/* Modals */}
      {modal?.type === 'addTeacher' && (
        <Modal title="Add Teacher" onClose={() => setModal(null)}>
          <TeacherForm onSubmit={handleAddTeacher} onClose={() => setModal(null)} loading={loading} />
        </Modal>
      )}
      {modal?.type === 'editTeacher' && (
        <Modal title="Edit Teacher" onClose={() => setModal(null)}>
          <TeacherForm initial={modal.data} onSubmit={handleEditTeacher} onClose={() => setModal(null)} loading={loading} />
        </Modal>
      )}
      {modal?.type === 'deleteTeacher' && (
        <Modal title="Delete Teacher" onClose={() => setModal(null)}>
          <p className="text-slate-300 mb-2">Delete <span className="text-white font-semibold">{modal.data.full_name}</span>?</p>
          <p className="text-slate-500 text-sm mb-5">This will also remove all their attendance records. This cannot be undone.</p>
          <div className="flex gap-3">
            <button onClick={() => setModal(null)} className="flex-1 bg-[#1E2440] hover:bg-[#2A3155] text-slate-300 font-semibold py-2.5 rounded-xl text-sm">Cancel</button>
            <button onClick={handleDeleteTeacher} disabled={loading} className="flex-[2] bg-rose-400 hover:bg-rose-300 disabled:opacity-40 text-white font-display font-bold py-2.5 rounded-xl text-sm">
              {loading ? 'Deleting...' : 'Yes, Delete'}
            </button>
          </div>
        </Modal>
      )}
      {modal?.type === 'deleteAttendance' && (
        <Modal title="Delete Attendance" onClose={() => setModal(null)}>
          <p className="text-slate-300 mb-2">
            Delete attendance for <span className="text-white font-semibold">{modal.data.full_name}</span>?
          </p>
          <p className="text-slate-500 text-sm mb-5">
            Day {modal.data.day_number}, Session {modal.data.session_number}. This cannot be undone.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setModal(null)} className="flex-1 bg-[#1E2440] hover:bg-[#2A3155] text-slate-300 font-semibold py-2.5 rounded-xl text-sm">
              Cancel
            </button>
            <button onClick={handleDeleteAttendance} disabled={loading} className="flex-[2] bg-rose-400 hover:bg-rose-300 disabled:opacity-40 text-white font-display font-bold py-2.5 rounded-xl text-sm">
              {loading ? 'Deleting...' : 'Yes, Delete'}
            </button>
          </div>
        </Modal>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl font-medium text-sm shadow-2xl animate-fade-in-up ${
          toast.type === 'error' ? 'bg-rose-400 text-white' : 'bg-emerald-400 text-[#0A0C12]'
        }`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
