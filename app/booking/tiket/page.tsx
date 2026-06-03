'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode, Ticket, Calendar, Train, MapPin, Clock } from 'lucide-react';
import Layout from '../../../components/layout';
import apiService from '../../../services/api';
import { useAuthStore } from '../../../stores/authStore';
import toast from 'react-hot-toast';
import type { Pembelian } from '../../../types';
export default function MyTicketsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [pembelians, setPembelians] = useState<Pembelian[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    loadData();
  }, [authLoading, isAuthenticated, router]);
  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await apiService.getPembelians();
      if (res.success) {
        const confirmed = res.data.filter((p: any) => p.status === 'confirmed' || p.status === 'completed');
        setPembelians(confirmed);
      }
    } catch {
      toast.error('Gagal memuat tiket');
      setPembelians([]);
    } finally { setIsLoading(false); }
  };
  if (authLoading || isLoading) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ display: 'inline-block', width: '2rem', height: '2rem', borderRadius: '9999px', borderWidth: '4px', borderColor: '#2563eb', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ marginTop: '1rem', color: '#4b5563' }}>Memuat tiket...</p>
        </div>
      </Layout>
    );
  }
  return (
    <Layout>
      <div style={{ maxWidth: '1024px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>Tiket Saya</h1>
          <p style={{ color: '#6b7280', marginTop: '0.25rem' }}>Daftar tiket kereta yang sudah dikonfirmasi</p>
        </div>
        {pembelians.length === 0 ? (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', border: '1px solid #e5e7eb', padding: '3rem', textAlign: 'center' }}>
            <Ticket style={{ width: '4rem', height: '4rem', color: '#d1d5db', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 500, color: '#111827', marginBottom: '0.5rem' }}>Belum ada tiket</h3>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Pesan tiket kereta pertama Anda</p>
            <button onClick={() => router.push('/search')} style={{ padding: '0.5rem 1.25rem', backgroundColor: '#2563eb', color: '#ffffff', borderRadius: '0.5rem', fontWeight: 500, border: 'none', cursor: 'pointer' }}>Cari Tiket</button>
          </div>
        ) : (
          pembelians.map((p) => (
            <div key={p.id} onClick={() => router.push(`/mybookings/tiket/${p.id}`)} style={{
              backgroundColor: '#ffffff',
              borderRadius: '0.75rem',
              border: '1px solid #e5e7eb',
              padding: '1.5rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
            onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
            onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.boxShadow = 'none'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Kode Booking</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>{p.kodeBooking}</p>
                </div>
                <QrCode style={{ width: '3rem', height: '3rem', color: '#4b5563' }} />
              </div>
              <div style={{ borderTop: '1px dashed #e5e7eb', paddingTop: '1rem' }}></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Train style={{ width: '1.25rem', height: '1.25rem', color: '#2563eb' }} />
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Kereta</p>
                    <p style={{ fontWeight: 500, color: '#111827' }}>{p.jadwal?.kereta?.nama || '-'}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <MapPin style={{ width: '1.25rem', height: '1.25rem', color: '#2563eb' }} />
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Rute</p>
                    <p style={{ fontWeight: 500, color: '#111827' }}>{p.jadwal?.asal} → {p.jadwal?.tujuan}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Calendar style={{ width: '1.25rem', height: '1.25rem', color: '#2563eb' }} />
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Tanggal</p>
                    <p style={{ fontWeight: 500, color: '#111827' }}>{p.jadwal?.tanggal?.split('T')[0]}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Clock style={{ width: '1.25rem', height: '1.25rem', color: '#2563eb' }} />
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Waktu</p>
                    <p style={{ fontWeight: 500, color: '#111827' }}>{p.jadwal?.waktuBerangkat} - {p.jadwal?.waktuTiba}</p>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem' }}>
                <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500 }}>{p.status}</span>
                <span style={{ color: '#2563eb', fontSize: '0.875rem', fontWeight: 500 }}>Lihat Detail →</span>
              </div>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
}
