'use client';
// Disable static prerender
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Building, Smartphone, CheckCircle, Clock, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../../../components/layout';
const API = 'https://keretaapi-production.up.railway.app';
function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '';
  
  const [pembelian, setPembelian] = useState<any>(null);
  const [payment, setPayment] = useState<any>(null);
  const [selectedMethod, setSelectedMethod] = useState('bca');
  const [isConfirming, setIsConfirming] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';
  useEffect(() => {
    if (id) loadData();
  }, [id]);
  const loadData = async () => {
    try {
      const token = getToken();
      const headers = { 'Authorization': 'Bearer ' + token };
      
      const [pembelianRes, paymentRes] = await Promise.all([
        fetch(API + '/pembelian/' + id, { headers }),
        fetch(API + '/payment/' + id, { headers })
      ]);
      
      if (pembelianRes.ok) {
        const data = await pembelianRes.json();
        setPembelian(data);
      }
      if (paymentRes.ok) {
        const data = await paymentRes.json();
        setPayment(data);
      }
    } catch (err: any) {
      toast.error('Gagal memuat data');
    } finally {
      setIsLoading(false);
    }
  };
  const handleConfirm = async () => {
    if (!id) return;
    setIsConfirming(true);
    try {
      const token = getToken();
      const res = await fetch(API + '/payment/' + id + '/confirm', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (res.ok) {
        toast.success('Pembayaran berhasil dikonfirmasi!');
        router.push('/booking/tiket/' + id);
      } else {
        toast.error('Gagal konfirmasi pembayaran');
      }
    } catch (err: any) {
      toast.error('Gagal konfirmasi');
    } finally {
      setIsConfirming(false);
    }
  };
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Nomor disalin!');
  };
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price || 0);
  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: 64 }}><p>Memuat...</p></div>;
  }
  if (!pembelian) {
    return <div style={{ textAlign: 'center', padding: 64 }}><p>Data tidak ditemukan</p></div>;
  }
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => router.back()} style={{ border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#2563eb', padding: 8 }}>
          <ArrowLeft style={{ width: 24, height: 24 }} />
        </button>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>Pembayaran</h1>
          <p style={{ color: '#6b7280' }}>Kode Booking: {pembelian.kodeBooking}</p>
        </div>
      </div>
      <div style={{ backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Clock style={{ width: 24, height: 24, color: '#ea580c' }} />
          <div>
            <p style={{ fontWeight: 500, color: '#9a3412' }}>Selesaikan pembayaran dalam</p>
          </div>
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#ea580c' }}>00:59:45</div>
      </div>
      <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 24 }}>
        <h3 style={{ fontWeight: 600, color: '#111827', marginBottom: 16 }}>Ringkasan Pesanan</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#6b7280' }}>Kereta</span>
            <span style={{ fontWeight: 500 }}>{pembelian.jadwal?.kereta?.nama || '-'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#6b7280' }}>Rute</span>
            <span style={{ fontWeight: 500 }}>{pembelian.jadwal?.asal} → {pembelian.jadwal?.tujuan}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#6b7280' }}>Tanggal</span>
            <span style={{ fontWeight: 500 }}>
              {pembelian.jadwal?.tanggalBerangkat ? new Date(pembelian.jadwal.tanggalBerangkat).toLocaleDateString('id-ID') : '-'}
            </span>
          </div>
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600 }}>Total</span>
            <span style={{ fontWeight: 700, fontSize: 20, color: '#2563eb' }}>
              {formatPrice(pembelian.totalHarga || pembelian.total)}
            </span>
          </div>
        </div>
      </div>
      <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 24 }}>
        <h3 style={{ fontWeight: 600, color: '#111827', marginBottom: 16 }}>Pilih Metode Pembayaran</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { id: 'bca', name: 'BCA Virtual Account', icon: Building },
            { id: 'bni', name: 'BNI Virtual Account', icon: Building },
            { id: 'mandiri', name: 'Mandiri Virtual Account', icon: Building },
            { id: 'gopay', name: 'GoPay', icon: Smartphone },
            { id: 'ovo', name: 'OVO', icon: Smartphone },
            { id: 'dana', name: 'DANA', icon: Smartphone },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMethod(m.id)}
              style={{
                padding: 16,
                borderRadius: 12,
                border: selectedMethod === m.id ? '2px solid #2563eb' : '1px solid #e5e7eb',
                backgroundColor: selectedMethod === m.id ? '#eff6ff' : '#fff',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}
            >
              <div style={{ padding: 8, borderRadius: 8, backgroundColor: selectedMethod === m.id ? '#2563eb' : '#f3f4f6', color: selectedMethod === m.id ? '#fff' : '#6b7280' }}>
                <m.icon style={{ width: 20, height: 20 }} />
              </div>
              <p style={{ fontWeight: 500 }}>{m.name}</p>
            </button>
          ))}
        </div>
      </div>
      <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 24 }}>
        <h3 style={{ fontWeight: 600, color: '#111827', marginBottom: 16 }}>Instruksi Pembayaran</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ backgroundColor: '#f9fafb', borderRadius: 8, padding: 16 }}>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>Nomor Virtual Account:</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: 24, fontFamily: 'monospace', fontWeight: 700 }}>8888 0123 4567 8901</p>
              <button onClick={() => handleCopy('8888012345678901')} style={{ padding: 8, color: '#2563eb', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}>
                <Copy style={{ width: 20, height: 20 }} />
              </button>
            </div>
          </div>
          <button
            onClick={handleConfirm}
            disabled={isConfirming}
            style={{
              width: '100%',
              padding: 12,
              backgroundColor: isConfirming ? '#93c5fd' : '#2563eb',
              color: '#fff',
              borderRadius: 8,
              fontWeight: 600,
              border: 'none',
              cursor: isConfirming ? 'not-allowed' : 'pointer',
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            <CheckCircle style={{ width: 20, height: 20 }} />
            {isConfirming ? 'Memproses...' : 'Saya Sudah Membayar'}
          </button>
        </div>
      </div>
    </div>
  );
}
export default function PaymentPage() {
  return (
    <Layout>
      <Suspense fallback={<div style={{ textAlign: 'center', padding: 64 }}><p>Memuat...</p></div>}>
        <PaymentContent />
      </Suspense>
    </Layout>
  );
}
