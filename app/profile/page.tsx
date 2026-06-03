'use client';
import { CreditCard, Edit2, MapPin, Phone, Save, User, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Layout from '../../components/layout';
import apiService from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [formData, setFormData] = useState({
    nama: '',
    telp: '',
    nik: '',
    alamat: '',
  });
  useEffect(() => {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
    if (!token) { router.push('/auth/login'); return; }
    loadProfile();
  }, [router]);
  const loadProfile = async () => {
    setIsFetching(true);
    try {
      const response = await apiService.getMyPelanggan();
      const data = response.data || response;
      setProfileData(data);
      setFormData({
        nama: data.nama || data.username || '',
        telp: data.telp || data.noTelepon || '',
        nik: data.nik || '',
        alamat: data.alamat || '',
      });
    } catch (err: any) {
      // Fallback: ambil dari localStorage
      try {
        const userStr = window.localStorage.getItem('user');
        if (userStr) {
          const u = JSON.parse(userStr);
          setProfileData(u);
          setFormData({
            nama: u.nama || u.username || '',
            telp: u.telp || '',
            nik: u.nik || '',
            alamat: u.alamat || '',
          });
        }
      } catch {}
    } finally {
      setIsFetching(false);
    }
  };
  const handleSave = async () => {
    if (!formData.nama) { toast.error('Nama wajib diisi'); return; }
    setIsSubmitting(true);
    try {
      // Kirim HANYA field yang backend terima: nama, telp, nik, alamat
      const response = await apiService.updateMyPelanggan({
        nama: formData.nama,
        alamat: formData.alamat,
      });
      const data = response.data || response;
      setProfileData(data);
      setIsEditing(false);
      toast.success('Profil berhasil diperbarui');
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      if (Array.isArray(msg)) {
        toast.error(msg.join(', '));
      } else {
        toast.error(msg || 'Gagal memperbarui profil');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleCancel = () => {
    if (profileData) {
      setFormData({
        nama: profileData.nama || profileData.username || '',
        telp: profileData.telp || profileData.noTelepon || '',
        nik: profileData.nik || '',
        alamat: profileData.alamat || '',
      });
    }
    setIsEditing(false);
  };
  if (isFetching) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ display: 'inline-block', width: '2.5rem', height: '2.5rem', borderRadius: '9999px', border: '4px solid #2563eb', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
          <style jsx>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          <p style={{ marginTop: '1rem', color: '#4b5563' }}>Memuat profil...</p>
        </div>
      </Layout>
    );
  }
  const displayName = formData.nama || user?.nama || profileData?.nama || '-';
  const labelStyle = { display: 'block' as const, fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.375rem' };
  const inputStyle = (disabled: boolean) => ({
    width: '100%', padding: '0.625rem 0.75rem 0.625rem 2.75rem',
    border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.875rem',
    outline: 'none', boxSizing: 'border-box' as const,
    backgroundColor: disabled ? '#f9fafb' : '#ffffff',
    color: disabled ? '#6b7280' : '#111827',
  });
  const iconWrap = { position: 'absolute' as const, left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' };
  return (
    <Layout>
      <div style={{ maxWidth: '48rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>Profil Saya</h1>
          <p style={{ color: '#6b7280' }}>Kelola informasi pribadi Anda</p>
        </div>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '5rem', height: '5rem', borderRadius: '9999px',
                background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#ffffff', fontSize: '2rem', fontWeight: 700,
              }}>
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827' }}>{displayName}</h2>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{profileData?.nama || user?.nama || '-'}</p>
                <span style={{
                  marginTop: '0.25rem', display: 'inline-block',
                  padding: '0.125rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem',
                  backgroundColor: (user?.role || '').toLowerCase() === 'admin' ? '#f3e8ff' : '#eff6ff',
                  color: (user?.role || '').toLowerCase() === 'admin' ? '#7c3aed' : '#2563eb',
                }}>
                  {user?.role || 'pelanggan'}
                </span>
              </div>
            </div>
            {isEditing ? (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={handleCancel} style={{ padding: '0.5rem 1rem', border: '1px solid #000000', borderRadius: '0.5rem', color: '#040507', cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <X style={{ width: '1rem', height: '1rem', backgroundColor: '#ffffff', color: '#040507' }} /> Batal
                </button>
                <button onClick={handleSave} disabled={isSubmitting} style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem', backgroundColor: '#2563eb', color: '#ffffff', cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Save style={{ width: '1rem', height: '1rem' }} /> {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            ) : (
              <button
            onClick={() => setIsEditing(true)}
           style={{
            padding: '0.5rem 1rem',
             border: '1px solid #040507',
             borderRadius: '0.5rem',
             backgroundColor: '#ffffff',
             color: '#040507', 
             cursor: 'pointer',
             fontSize: '0.875rem',
             display: 'flex',
             alignItems: 'center',
             gap: '0.25rem'}}>
  <Edit2 style={{ width: '1rem', height: '1rem', color: '#040507' }} />
  Edit Profil
</button>
            )}
          </div>
          {/* Form */}
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Nama */}
            <div>
              <label style={labelStyle}>Nama Lengkap</label>
              <div style={{ position: 'relative' }}>
                <div style={iconWrap}><User style={{ width: '1.25rem', height: '1.25rem' }} /></div>
                <input type="text" value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} disabled={!isEditing}
                  style={inputStyle(!isEditing)}
                  onFocus={(e) => { if (isEditing) e.target.style.borderColor = '#2563eb'; }}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'} />
              </div>
            </div>
            {/* Telepon */}
            <div>
              <label style={labelStyle}>Nomor Telepon</label>
              <div style={{ position: 'relative' }}>
                <div style={iconWrap}><Phone style={{ width: '1.25rem', height: '1.25rem' }} /></div>
                <input type="tel" placeholder="08xxxxxxxxxx" value={formData.telp} disabled
                  style={inputStyle(true)} />
              </div>
              <p style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#9ca3af' }}>Nomor telepon tidak bisa diubah</p>
            </div>
            {/* NIK */}
            <div>
              <label style={labelStyle}>NIK</label>
              <div style={{ position: 'relative' }}>
                <div style={iconWrap}><CreditCard style={{ width: '1.25rem', height: '1.25rem' }} /></div>
                <input type="text" value={formData.nik} disabled
                  style={inputStyle(true)} />
              </div>
              <p style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#9ca3af' }}>NIK tidak bisa diubah</p>
            </div>
            {/* Alamat */}
            <div>
              <label style={labelStyle}>Alamat</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '0.75rem', top: '0.75rem', color: '#9ca3af' }}>
                  <MapPin style={{ width: '1.25rem', height: '1.25rem' }} />
                </div>
                <textarea rows={3} placeholder="Alamat lengkap" value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })} disabled={!isEditing}
                  style={{
                    width: '100%', padding: '0.625rem 0.75rem 0.625rem 2.75rem',
                    border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.875rem',
                    outline: 'none', resize: 'none', boxSizing: 'border-box',
                    backgroundColor: !isEditing ? '#f9fafb' : '#ffffff',
                    color: !isEditing ? '#6b7280' : '#111827',
                  }}
                  onFocus={(e) => { if (isEditing) e.target.style.borderColor = '#2563eb'; }}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}