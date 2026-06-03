'use client';
import { useState, useEffect } from 'react';
import { Train, Plus, Trash2, Settings } from 'lucide-react';
import Layout from '../../../components/layout';
import toast from 'react-hot-toast';
const API = 'https://keretaapi-production.up.railway.app';
export default function AdminKeretaPage() {
  const [keretas, setKeretas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddKereta, setShowAddKereta] = useState(false);
  const [namaKereta, setNamaKereta] = useState('');
  const [selectedKereta, setSelectedKereta] = useState<any>(null);
  const [showGerbongModal, setShowGerbongModal] = useState(false);
  const [gerbongForm, setGerbongForm] = useState({ nama: '', kuota: 20, kelas: 'EKSEKUTIF' });
  const [submitting, setSubmitting] = useState(false);
  const getToken = () => typeof window !== 'undefined' ? window.localStorage.getItem('token') || '' : '';
  useEffect(() => { loadKeretas(); }, []);
  const loadKeretas = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(API + '/kereta', { headers: { 'Authorization': 'Bearer ' + getToken() } });
      const data = await res.json();
      // Load detail setiap kereta (untuk dapat gerbong + kursi)
      const detailed = await Promise.all((Array.isArray(data) ? data : []).map(async (k: any) => {
        try {
          const r = await fetch(API + '/kereta/' + k.id, { headers: { 'Authorization': 'Bearer ' + getToken() } });
          return await r.json();
        } catch { return k; }
      }));
      setKeretas(detailed);
    } catch { toast.error('Gagal memuat'); }
    finally { setIsLoading(false); }
  };
  const addKereta = async () => {
    if (!namaKereta.trim()) { toast.error('Nama wajib diisi'); return; }
    setSubmitting(true);
    try {
      const res = await fetch(API + '/kereta', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() }, body: JSON.stringify({ nama: namaKereta }) });
      if (!res.ok) { const d = await res.json(); toast.error(d.message || 'Gagal'); return; }
      toast.success('Kereta ditambahkan');
      setNamaKereta(''); setShowAddKereta(false); loadKeretas();
    } catch { toast.error('Gagal'); }
    finally { setSubmitting(false); }
  };
  const deleteKereta = async (id: string) => {
  if (!confirm('Hapus kereta ini? Semua gerbong & kursi juga akan terhapus.')) return;

  try {
    const res = await fetch(`${API}/kereta/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      toast.error(data.message || 'Gagal menghapus kereta');
      return;
    }

    toast.success('Kereta dihapus');
    await loadKeretas();
  } catch (err) {
    console.error(err);
    toast.error('Terjadi kesalahan');
  }
};
  const addGerbong = async () => {
    if (!selectedKereta || !gerbongForm.nama.trim()) { toast.error('Nama gerbong wajib'); return; }
    setSubmitting(true);
    try {
      const res = await fetch(API + '/kereta/gerbong', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() },
        body: JSON.stringify({ keretaId: selectedKereta.id, nama: gerbongForm.nama, kuota: gerbongForm.kuota, kelas: gerbongForm.kelas })
      });
      if (!res.ok) { const d = await res.json(); const m = d.message; toast.error(Array.isArray(m) ? m.join(', ') : m || 'Gagal'); return; }
      const gerbong = await res.json();
      toast.success('Gerbong ditambahkan!');
      // Auto generate kursi
      try {
        const gr = await fetch(API + '/kereta/generate-kursi/' + gerbong.id, { method: 'POST', headers: { 'Authorization': 'Bearer ' + getToken() } });
        const gd = await gr.json();
        toast.success(`${gd.count || 0} kursi di-generate otomatis!`);
      } catch { toast.error('Gerbong dibuat tapi gagal generate kursi'); }
      setGerbongForm({ nama: '', kuota: 20, kelas: 'EKSEKUTIF' }); setShowGerbongModal(false); loadKeretas();
    } catch { toast.error('Gagal'); }
    finally { setSubmitting(false); }
  };
  const generateKursi = async (gerbongId: string) => {
    try {
      const res = await fetch(API + '/kereta/generate-kursi/' + gerbongId, { method: 'POST', headers: { 'Authorization': 'Bearer ' + getToken() } });
      const d = await res.json();
      if (res.ok) { toast.success(`${d.count || 0} kursi di-generate!`); loadKeretas(); }
      else toast.error(d.message || 'Gagal');
    } catch { toast.error('Gagal generate kursi'); }
  };
  const inp = { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, color: '#111827', backgroundColor: '#fff', outline: 'none', boxSizing: 'border-box' as const };
  const lbl = { display: 'block' as const, fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 };
  if (isLoading) return <Layout><div style={{ textAlign: 'center', padding: 64 }}><p style={{ color: '#6b7280' }}>Memuat kereta...</p></div></Layout>;
  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>Kelola Kereta</h1><p style={{ color: '#6b7280' }}>Kereta, gerbong, dan kursi</p></div>
          <button onClick={() => setShowAddKereta(true)} style={{ padding: '8px 20px', backgroundColor: '#2563eb', color: '#fff', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}><Plus style={{ width: 16, height: 16 }} /> Tambah Kereta</button>
        </div>
        {keretas.length === 0 ? (
          <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 48, textAlign: 'center' }}>
            <Train style={{ width: 64, height: 64, color: '#d1d5db', margin: '0 auto 16px' }} />
            <h3 style={{ color: '#111827', fontWeight: 500 }}>Belum ada kereta</h3>
          </div>
        ) : (
          keretas.map(k => {
            const gerbongs = k.gerbong || k.gerbongs || [];
            const totalKursi = gerbongs.reduce((sum: number, g: any) => sum + (g.kursi?.length || 0), 0);
            return (
              <div key={k.id} style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                {/* Kereta Header */}
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Train style={{ width: 24, height: 24, color: '#2563eb' }} />
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 600, color: '#111827' }}>{k.nama}</h3>
                      <p style={{ fontSize: 13, color: '#6b7280' }}>{gerbongs.length} gerbong • {totalKursi} kursi</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => { setSelectedKereta(k); setShowGerbongModal(true); }} style={{ padding: '6px 14px', backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Plus style={{ width: 14, height: 14 }} /> Tambah Gerbong
                    </button>
                    <button onClick={() => deleteKereta(k.id)} style={{ padding: '6px 14px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Trash2 style={{ width: 14, height: 14 }} /> Hapus
                    </button>
                  </div>
                </div>
                {/* Gerbong List */}
                {gerbongs.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280', fontSize: 14 }}>
                    ⚠️ Belum ada gerbong. Klik "Tambah Gerbong" untuk menambahkan.
                  </div>
                ) : (
                  <div style={{ padding: '16px 24px' }}>q
                    {gerbongs.map((g: any, gi: number) => {
                      const kursiCount = g.kursi?.length || 0;
                      return (
                        <div key={g.id} style={{ padding: 12, backgroundColor: gi % 2 === 0 ? '#f9fafb' : '#fff', borderRadius: 8, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <p style={{ fontWeight: 500, color: '#111827' }}>{g.nama || 'Gerbong ' + (gi + 1)}</p>
                            <p style={{ fontSize: 13, color: '#6b7280' }}>Kelas: {g.kelas} • Kuota: {g.kuota} • Kursi: {kursiCount}</p>
                          </div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {kursiCount === 0 && (
                              <button onClick={() => generateKursi(g.id)} style={{ padding: '4px 12px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>
                                Generate Kursi
                              </button>
                            )}
                            {kursiCount > 0 && (
                              <span style={{ padding: '4px 12px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: 6, fontSize: 12, fontWeight: 500 }}>
                                ✅ {kursiCount} kursi
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      {/* Modal: Tambah Kereta */}
      {showAddKereta && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '100%', maxWidth: 400 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Tambah Kereta</h2>
            <div style={{ marginBottom: 16 }}><label style={lbl}>Nama Kereta</label><input type="text" placeholder="Contoh: Argo Parahyangan" value={namaKereta} onChange={e => setNamaKereta(e.target.value)} style={inp} /></div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setShowAddKereta(false)} style={{ padding: '8px 20px', border: '1px solid #d1d5db', borderRadius: 8, backgroundColor: '#fff', cursor: 'pointer' }}>Batal</button>
              <button onClick={addKereta} disabled={submitting} style={{ padding: '8px 20px', backgroundColor: '#2563eb', color: '#fff', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 500 }}>{submitting ? 'Menyimpan...' : 'Simpan'}</button>
            </div>
          </div>
        </div>
      )}
      {/* Modal: Tambah Gerbong */}
      {showGerbongModal && selectedKereta && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '100%', maxWidth: 450 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Tambah Gerbong</h2>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 16 }}>Kereta: {selectedKereta.nama}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div><label style={lbl}>Nama Gerbong</label><input type="text" placeholder="Contoh: Gerbong 1" value={gerbongForm.nama} onChange={e => setGerbongForm({ ...gerbongForm, nama: e.target.value })} style={inp} /></div>
              <div><label style={lbl}>Kelas</label>
                <select value={gerbongForm.kelas} onChange={e => setGerbongForm({ ...gerbongForm, kelas: e.target.value })} style={inp}>
                  <option value="EKSEKUTIF">Eksekutif</option>
                  <option value="EKONOMI">Ekonomi</option>
                </select>
              </div>
              <div><label style={lbl}>Kuota Kursi</label><input type="number" value={gerbongForm.kuota} onChange={e => setGerbongForm({ ...gerbongForm, kuota: parseInt(e.target.value) || 0 })} style={inp} /></div>
              <p style={{ fontSize: 12, color: '#6b7280', backgroundColor: '#f0fdf4', padding: 8, borderRadius: 6 }}>💡 Setelah gerbong dibuat, kursi akan di-generate otomatis sesuai kuota.</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button onClick={() => { setShowGerbongModal(false); setSelectedKereta(null); }} style={{ padding: '8px 20px', border: '1px solid #d1d5db', borderRadius: 8, backgroundColor: '#fff', cursor: 'pointer' }}>Batal</button>
              <button onClick={addGerbong} disabled={submitting} style={{ padding: '8px 20px', backgroundColor: '#2563eb', color: '#fff', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 500 }}>{submitting ? 'Membuat...' : 'Buat Gerbong + Kursi'}</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}