'use client';
import { Eye, EyeOff, Lock, Train, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import apiService from '../../../services/api';
import { initializeAuth, useAuthStore } from '../../../stores/authStore';
export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [username, setUsername] = useState('');
  const [nama, setNama] = useState('');
  const [telp, setTelp] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [ready, setReady] = useState(false);
  useEffect(() => {
    initializeAuth();
    const token = window.localStorage.getItem('token');
    const userStr = window.localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        router.push(user.role === 'admin' ? '/admin/dashboard' : '/');
        return;
      } catch {}
    }
    setReady(true);
  }, [router]);
  const validate = () => {
    const newErrors: { username?: string; password?: string } = {};
    if (!username) newErrors.username = 'Username wajib diisi';
    if (!password) newErrors.password = 'Password wajib diisi';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const response = await apiService.login({ username, password });
      // Backend return: { message, access_token }
      const token = response.access_token || '';
      if (!token) {
        toast.error('Login gagal: token tidak ditemukan');
        return;
      }
      // Decode JWT untuk ambil user info (sub, username, role)
      let userData: any = { username };
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userData = {
          id: payload.sub || '',
          username: payload.username || username,
          nama: payload.nama || payload.username || username,
          role: (payload.role || 'pelanggan').toLowerCase(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      } catch {
        userData = {
          id: '',
          username,
          nama: username,
          role: 'pelanggan',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      login(userData, token);
      toast.success('Login berhasil!');
      router.push(userData.role === 'admin' ? '/admin/dashboard' : '/');
    } catch (error: any) {
      const msg = error.response?.data?.message;
      if (Array.isArray(msg)) {
        toast.error(msg.join(', '));
      } else {
        toast.error(msg || 'Login gagal. Periksa username dan password.');
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
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #eef2ff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '28rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/" style={{ display: 'inline-flex' }}>
            <div style={{ background: 'linear-gradient(to right, #2563eb, #4f46e5)', padding: '0.75rem', borderRadius: '0.75rem', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }}>
              <Train style={{ width: '2rem', height: '2rem', color: '#ffffff' }} />
            </div>
          </Link>
          <h1 style={{ marginTop: '1rem', fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>Selamat Datang</h1>
          <p style={{ marginTop: '0.5rem', color: '#6b7280' }}>Masuk dengan username Anda</p>
        </div>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '1rem', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #f3f4f6', padding: '2rem' }}>
          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.375rem' }}>Username</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
                  <User style={{ width: '1.25rem', height: '1.25rem' }} />
                </div>
                <input
                  type="text"
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                   style={{
                    width: '100%', padding: '0.625rem 0.75rem 0.625rem 2.75rem',
                    border: `1px solid ${errors.username ? '#fca5a5' : '#d1d5db'}`,
                    borderRadius: '0.5rem', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
                    color: '#111827', backgroundColor: '#ffffff',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                  onBlur={(e) => e.target.style.borderColor = errors.username ? '#fca5a5' : '#d1d5db'}
                />
              </div>
              {errors.username && <p style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#dc2626' }}>{errors.username}</p>}
            </div>
            {/* Password */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.375rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
                  <Lock style={{ width: '1.25rem', height: '1.25rem' }} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%', padding: '0.625rem 2.75rem 0.625rem 2.75rem',
                    border: `1px solid ${errors.password ? '#fca5a5' : '#d1d5db'}`,
                    borderRadius: '0.5rem', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
                    color: '#111827', backgroundColor: '#ffffff',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                  onBlur={(e) => e.target.style.borderColor = errors.password ? '#fca5a5' : '#d1d5db'}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0 }}>
                  {showPassword ? <EyeOff style={{ width: '1.25rem', height: '1.25rem' }} /> : <Eye style={{ width: '1.25rem', height: '1.25rem' }} />}
                </button>
              </div>
              {errors.password && <p style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#dc2626' }}>{errors.password}</p>}
            </div>
            <button type="submit" disabled={submitting}
              style={{
                width: '100%', padding: '0.75rem', backgroundColor: submitting ? '#93c5fd' : '#2563eb',
                color: '#ffffff', borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.875rem',
                border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => { if (!submitting) (e.target as HTMLElement).style.backgroundColor = '#1d4ed8'; }}
              onMouseLeave={(e) => { if (!submitting) (e.target as HTMLElement).style.backgroundColor = '#2563eb'; }}
            >
              {submitting ? 'Masuk...' : 'Masuk'}
            </button>
          </form>
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Belum punya akun?{' '}
              <Link href="/auth/register" style={{ color: '#2563eb', fontWeight: 500, textDecoration: 'none' }}>Daftar sekarang</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}