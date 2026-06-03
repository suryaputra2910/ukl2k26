'use client';
import { useState, useEffect } from 'react';
import { User, Shield, Trash2, Plus } from 'lucide-react';
import Layout from '../../../components/layout';
import toast from 'react-hot-toast';
const API = 'https://keretaapi-production.up.railway.app';
export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [pelangganList, setPelangganList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ username: '', nama: '', telp: '', nik: '', alamat: '', password: '' });
  const getToken = () => typeof window !== 'undefined' ? window.localStorage.getItem('token') || '' : '';
  useEffect(() => { loadData(); }, []);
  const loadData = async () => {
    setIsLoading(true);
    const token = getToken();
    try {
      // Load users
      const uRes = await fetch(API + '/users', { headers: { 'Authorization': 'Bearer ' + token } });
      if (uRes.ok) { const ud = await uRes.json(); setUsers(Array.isArray(ud) ? ud : (ud.data || [])); }
      // Load pelanggan
      try {
        const pRes = await fetch(API + '/pelanggan', { headers: { 'Authorization': 'Bearer ' + token } });
        if (pRes.ok) { const pd = await pRes.json(); setPelangganList(Array.isArray(pd) ? pd : (pd.data || [])); }
      } catch {}
    } catch { toast.error('Gagal memuat data'); }
    finally { setIsLoading(false); }
  };
  const getPelanggan = (userId: string) => pelangganList.find((p: any) => p.userId === userId);
  const deleteUser = async (id: string) => {
    if (!confirm('Hapus user ini?')) return;
    try {
      const res = await fetch(API + '/users/' + id, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + getToken() } });
      if (res.ok) { toast.success('User dihapus'); loadData(); }
      else { const d = await res.json(); toast.error(d.message || 'Gagal'); }
    } catch { toast.error('Gagal'); }
  };
  const addUser = async () => {
    if (!formData.username || !formData.nama || !formData.password) { toast.error('Username, nama, dan password wajib diisi'); return; }
    setSubmitting(true);
    try {
      // Register user baru
      const res = await fetch(API + '/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formData.username, nama: formData.nama, telp: formData.telp || '000', nik: formData.nik || '0000000000000000', alamat: formData.alamat || '-', password: formData.password })
      });
      const d = await res.json();
      if (res.ok) { toast.success('User ditambahkan'); setShowModal(false); setFormData({ username: '', nama: '', telp: '', nik: '', alamat: '', password: '' }); loadData(); }
      else { const m = d.message; toast.error(Array.isArray(m) ? m.join(', ') : m || 'Gagal'); }
    } catch { toast.error('Gagal'); }
    finally { setSubmitting(false); }
  };
  const inp = { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, color: '#111827', backgroundColor: '#fff', outline: 'none', boxSizing: 'border-box' as const };
  const lbl = { display: 'block' as const, fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 };
  if (isLoading) return <Layout><div style={{ textAlign: 'center', padding: 64 }}><p style={{ color: '#6b7280' }}>Memuat users...</p></div></Layout>;
  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>Kelola Users</h1><p style={{ color: '#6b7280' }}>{users.length} user terdaftar</p></div>
          <button onClick={() => setShowModal(true)} style={{ padding: '8px 20px', backgroundColor: '#2563eb', color: '#fff', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}><Plus style={{ width: 16, height: 16 }} /> Tambah User</button>
        </div>
        <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 14, fontWeight: 500, color: '#6b7280' }}>User</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 14, fontWeight: 500, color: '#6b7280' }}>Nama</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 14, fontWeight: 500, color: '#6b7280' }}>Telepon</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 14, fontWeight: 500, color: '#6b7280' }}>Role</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 14, fontWeight: 500, color: '#6b7280' }}>Terdaftar</th>
                <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: 14, fontWeight: 500, color: '#6b7280' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 48, textAlign: 'center', color: '#6b7280' }}>Belum ada user</td></tr>
              ) : users.map((u: any) => {
                const p = getPelanggan(u.id);
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 9999, backgroundColor: u.role === 'ADMIN' ? '#f3e8ff' : '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <User style={{ width: 18, height: 18, color: u.role === 'ADMIN' ? '#7c3aed' : '#2563eb' }} />
                        </div>
                        <span style={{ fontWeight: 500, color: '#111827' }}>{u.username}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#111827', fontSize: 14 }}>{p?.nama || u.nama || '-'}</td>
                    <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: 14 }}>{p?.telp || '-'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500, backgroundColor: u.role === 'ADMIN' ? '#f3e8ff' : '#eff6ff', color: u.role === 'ADMIN' ? '#7c3aed' : '#2563eb' }}>
                        <Shield style={{ width: 12, height: 12 }} />{u.role}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: 13 }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('id-ID') : '-'}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button onClick={() => deleteUser(u.id)} style={{ color: '#dc2626', fontSize: 13, border: 'none', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
                        <Trash2 style={{ width: 14, height: 14 }} /> Hapus
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '100%', maxWidth: 450, maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Tambah User</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div><label style={lbl}>Username *</label><input type="text" placeholder="username" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} style={inp} /></div>
              <div><label style={lbl}>Nama Lengkap *</label><input type="text" placeholder="Nama" value={formData.nama} onChange={e => setFormData({ ...formData, nama: e.target.value })} style={inp} /></div>
              <div><label style={lbl}>Telepon</label><input type="tel" placeholder="08xx" value={formData.telp} onChange={e => setFormData({ ...formData, telp: e.target.value })} style={inp} /></div>
              <div><label style={lbl}>NIK</label><input type="text" placeholder="16 digit" value={formData.nik} onChange={e => setFormData({ ...formData, nik: e.target.value })} style={inp} /></div>
              <div><label style={lbl}>Alamat</label><input type="text" placeholder="Alamat" value={formData.alamat} onChange={e => setFormData({ ...formData, alamat: e.target.value })} style={inp} /></div>
              <div><label style={lbl}>Password *</label><input type="password" placeholder="Min 6 karakter" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} style={inp} /></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '8px 20px', border: '1px solid #d1d5db', borderRadius: 8, backgroundColor: '#fff', cursor: 'pointer' }}>Batal</button>
              <button onClick={addUser} disabled={submitting} style={{ padding: '8px 20px', backgroundColor: '#2563eb', color: '#fff', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 500 }}>{submitting ? 'Menyimpan...' : 'Simpan'}</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}