'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Train, Eye, EyeOff, User, Phone, CreditCard, MapPin, Lock } from 'lucide-react';
import apiService from '../../../services/api';
import { useAuthStore, initializeAuth } from '../../../stores/authStore';
import toast from 'react-hot-toast';
export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [username, setUsername] = useState('');
  const [nama, setNama] = useState('');
  const [telp, setTelp] = useState('');
  const [nik, setNik] = useState('');
  const [alamat, setAlamat] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    initializeAuth();
    const token = window.localStorage.getItem('token');
    if (token) { router.push('/'); return; }
    setReady(true);
  }, [router]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) { toast.error('Username wajib diisi'); return; }
    if (!nama.trim()) { toast.error('Nama lengkap wajib diisi'); return; }
    if (!telp.trim()) { toast.error('Nomor telepon wajib diisi'); return; }
    if (!nik.trim()) { toast.error('NIK wajib diisi'); return; }
    if (nik.length !== 16) { toast.error('NIK harus 16 digit'); return; }
    if (!alamat.trim()) { toast.error('Alamat wajib diisi'); return; }
    if (!password) { toast.error('Password wajib diisi'); return; }
    if (password.length < 6) { toast.error('Password minimal 6 karakter'); return; }
    if (password !== confirmPassword) { toast.error('Konfirmasi password tidak cocok'); return; }
    setSubmitting(true);
    try {
      // Step 1: Register
      await apiService.register({ username, nama, telp, nik, alamat, password });
      // Step 2: Auto login setelah register
      const loginResponse = await apiService.login({ username, password });
      const token = loginResponse.access_token || '';
      if (!token) {
        toast.success('Registrasi berhasil! Silakan login.');
        router.push('/auth/login');
        return;
      }
      // Decode JWT
      let userData: any = { username, nama };
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userData = {
          id: payload.sub || '',
          username: payload.username || username,
          nama: nama || payload.username || username,
          role: (payload.role || 'pelanggan').toLowerCase(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      } catch {
        userData = { id: '', username, nama, role: 'pelanggan', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      }
      login(userData, token);
      toast.success('Registrasi & login berhasil!');
      router.push('/');
    } catch (error: any) {
      const msg = error.response?.data?.message;
      if (Array.isArray(msg)) {
        toast.error(msg.join(', '));
      } else {
        toast.error(msg || 'Registrasi gagal.');
      }
    } finally {
      setSubmitting(false);
    }
  };
  if (!ready) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f4ff' }}>
        <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '9999px', border: '4px solid #2563eb', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
        <style jsx>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }
   const inputStyle = {
    width: '100%', padding: '0.625rem 0.75rem 0.625rem 2.75rem',
    border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.875rem',
    outline: 'none', boxSizing: 'border-box' as const,
    color: '#111827', backgroundColor: '#ffffff',
  };
  const labelStyle = { display: 'block' as const, fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.375rem' };
  const iconWrap = { position: 'absolute' as const, left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' };
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #eef2ff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '28rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/" style={{ display: 'inline-flex' }}>
            <div style={{ background: 'linear-gradient(to right, #2563eb, #4f46e5)', padding: '0.75rem', borderRadius: '0.75rem', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }}>
              <Train style={{ width: '2rem', height: '2rem', color: '#ffffff' }} />
            </div>
          </Link>
          <h1 style={{ marginTop: '1rem', fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>Buat Akun</h1>
          <p style={{ marginTop: '0.5rem', color: '#6b7280' }}>Daftar untuk mulai memesan tiket kereta</p>
        </div>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '1rem', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #f3f4f6', padding: '2rem' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Username</label>
              <div style={{ position: 'relative' }}>
                <div style={iconWrap}><User style={{ width: '1.25rem', height: '1.25rem' }} /></div>
                <input type="text" placeholder="Masukkan username" value={username} onChange={(e) => setUsername(e.target.value)} style={inputStyle} required
                  onFocus={(e) => e.target.style.borderColor = '#2563eb'} onBlur={(e) => e.target.style.borderColor = '#d1d5db'} />
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Nama Lengkap</label>
              <div style={{ position: 'relative' }}>
                <div style={iconWrap}><User style={{ width: '1.25rem', height: '1.25rem' }} /></div>
                <input type="text" placeholder="Nama lengkap sesuai KTP" value={nama} onChange={(e) => setNama(e.target.value)} style={inputStyle} required
                  onFocus={(e) => e.target.style.borderColor = '#2563eb'} onBlur={(e) => e.target.style.borderColor = '#d1d5db'} />
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Nomor Telepon</label>
              <div style={{ position: 'relative' }}>
                <div style={iconWrap}><Phone style={{ width: '1.25rem', height: '1.25rem' }} /></div>
                <input type="tel" placeholder="08xxxxxxxxxx" value={telp} onChange={(e) => setTelp(e.target.value)} style={inputStyle} required
                  onFocus={(e) => e.target.style.borderColor = '#2563eb'} onBlur={(e) => e.target.style.borderColor = '#d1d5db'} />
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>NIK (Nomor Induk Kependudukan)</label>
              <div style={{ position: 'relative' }}>
                <div style={iconWrap}><CreditCard style={{ width: '1.25rem', height: '1.25rem' }} /></div>
                <input type="text" placeholder="16 digit NIK" value={nik}
                  onChange={(e) => { if (/^\d*$/.test(e.target.value) && e.target.value.length <= 16) setNik(e.target.value); }}
                  style={inputStyle} required maxLength={16}
                  onFocus={(e) => e.target.style.borderColor = '#2563eb'} onBlur={(e) => e.target.style.borderColor = '#d1d5db'} />
              </div>
              <p style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#9ca3af' }}>{nik.length}/16 digit</p>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Alamat</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '0.75rem', top: '0.75rem', color: '#9ca3af' }}>
                  <MapPin style={{ width: '1.25rem', height: '1.25rem' }} />
                </div>
                <textarea placeholder="Alamat lengkap sesuai KTP" value={alamat} onChange={(e) => setAlamat(e.target.value)} rows={3} required
                style={{ width: '100%', padding: '0.625rem 0.75rem 0.625rem 2.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.875rem', outline: 'none', resize: 'none', boxSizing: 'border-box', color: '#111827', backgroundColor: '#ffffff' }}
                onFocus={(e) => e.target.style.borderColor = '#2563eb'} onBlur={(e) => e.target.style.borderColor = '#d1d5db'} />
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <div style={iconWrap}><Lock style={{ width: '1.25rem', height: '1.25rem' }} /></div>
                <input type={showPassword ? 'text' : 'password'} placeholder="Minimal 6 karakter" value={password} onChange={(e) => setPassword(e.target.value)}
                  style={{ ...inputStyle, paddingRight: '2.75rem' }} required
                  onFocus={(e) => e.target.style.borderColor = '#2563eb'} onBlur={(e) => e.target.style.borderColor = '#d1d5db'} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0 }}>
                  {showPassword ? <EyeOff style={{ width: '1.25rem', height: '1.25rem' }} /> : <Eye style={{ width: '1.25rem', height: '1.25rem' }} />}
                </button>
              </div>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Konfirmasi Password</label>
              <div style={{ position: 'relative' }}>
                <div style={iconWrap}><Lock style={{ width: '1.25rem', height: '1.25rem' }} /></div>
                <input type={showPassword ? 'text' : 'password'} placeholder="Ulangi password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  style={inputStyle} required
                  onFocus={(e) => e.target.style.borderColor = '#2563eb'} onBlur={(e) => e.target.style.borderColor = '#d1d5db'} />
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#dc2626' }}>Password tidak cocok</p>
              )}
            </div>
            <button type="submit" disabled={submitting}
              style={{ width: '100%', padding: '0.75rem', backgroundColor: submitting ? '#93c5fd' : '#2563eb', color: '#ffffff', borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.875rem', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer' }}
              onMouseEnter={(e) => { if (!submitting) (e.target as HTMLElement).style.backgroundColor = '#1d4ed8'; }}
              onMouseLeave={(e) => { if (!submitting) (e.target as HTMLElement).style.backgroundColor = '#2563eb'; }}
            >
              {submitting ? 'Mendaftar...' : 'Daftar'}
            </button>
          </form>
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Sudah punya akun?{' '}
              <Link href="/auth/login" style={{ color: '#2563eb', fontWeight: 500, textDecoration: 'none' }}>Masuk sekarang</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}