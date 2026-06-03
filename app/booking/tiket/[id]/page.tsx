'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Train, MapPin, User, Download, CreditCard } from 'lucide-react';
import Layout from '../../../../components/layout';
import toast from 'react-hot-toast';

export default function TicketDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState<any>(null);
  const [keretaNama, setKeretaNama] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState('QRIS');

  useEffect(() => {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
    if (!token) { router.push('/auth/login'); return; }
    // Baca metode pembayaran dari localStorage
    const method = typeof window !== 'undefined' ? window.localStorage.getItem('paymentMethod') : null;
    if (method) setSelectedMethod(method);
    if (id) loadData();
  }, [id]);
  
  const loadData = async () => {
    setIsLoading(true);
    const token = window.localStorage.getItem('token') || '';
    try {
      // Load pembelian
      const res = await fetch('https://keretaapi-production.up.railway.app/pembelian/' + id, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (!res.ok) throw new Error('Failed');
      const pembelian = await res.json();
      console.log('TIKET DATA:', pembelian);
      setData(pembelian);

      // Load kereta nama
      const keretaId = pembelian.jadwal?.keretaId;
      if (keretaId) {
        try {
          const kr = await fetch('https://keretaapi-production.up.railway.app/kereta/' + keretaId, {
            headers: { 'Authorization': 'Bearer ' + token }
          });
          const kd = await kr.json();
          setKeretaNama(kd.nama || '');
        } catch {}
      }
    } catch {
      // Fallback localStorage
      try {
        const last = window.localStorage.getItem('lastPembelian');
        if (last) setData(JSON.parse(last));
        else toast.error('Tiket tidak ditemukan');
      } catch { toast.error('Gagal memuat tiket'); }
    } finally { setIsLoading(false); }
  };

  const fp = (p: any) => 'Rp ' + (parseInt(p) || 0).toLocaleString('id-ID');
  const fd = (s: string) => s ? new Date(s).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '-';
  const ft = (s: string) => s ? new Date(s).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-';

  const downloadPDF = () => {
    if (!data) return;
    const nama = keretaNama || data.jadwal?.kereta?.nama || '-';
    const detailHTML = (data.detail || []).map((d: any, i: number) =>
      `<div style="background:#f9fafb;padding:12px;border-radius:8px;margin-bottom:8px">
        <strong>${i + 1}. ${d.namaPenumpang || '-'}</strong>
        — Kursi <strong>${d.kursi?.label || '-'}</strong>
        (${d.gerbong?.nama || '-'}, ${d.gerbong?.kelas || '-'})
      </div>`
    ).join('');

    const w = window.open('', '_blank');
    if (!w) { toast.error('Popup diblokir'); return; }
    w.document.write(`<!DOCTYPE html><html><head><title>E-Tiket ${data.kodeBooking || ''}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;padding:40px;color:#111827;background:#fff}
.ticket{max-width:600px;margin:0 auto;border:2px solid #e5e7eb;border-radius:16px;overflow:hidden}
.hdr{background:linear-gradient(135deg,#2563eb,#4f46e5);color:#fff;padding:24px;text-align:center}
.hdr h1{font-size:22px}.hdr p{opacity:0.9;font-size:14px;margin-top:4px}
.body{padding:24px}.lbl{font-size:12px;color:#6b7280}.val{font-size:16px;font-weight:600;margin-top:2px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;padding:16px;background:#f9fafb;border-radius:12px;margin:16px 0}
.div{border-top:2px dashed #e5e7eb;margin:20px 0}
.price{text-align:center;padding:20px;background:#eff6ff;border-radius:12px;margin:16px 0}
.ftr{background:#f9fafb;padding:16px 24px;font-size:12px;color:#6b7280;text-align:center;border-top:1px solid #e5e7eb}
@media print{body{padding:0}.ticket{border:none}}</style></head><body>
<div class="ticket">
<div class="hdr"><h1>🚂 E-TIKET KERETA API</h1><p>Kode Booking: ${data.kodeBooking || '-'}</p></div>
<div class="body">
<div style="margin-bottom:16px"><div class="lbl">KERETA</div><div class="val" style="font-size:20px">${nama}</div></div>
<div class="grid">
<div><div class="lbl">Dari</div><div class="val">${data.jadwal?.asal || '-'}</div><div class="lbl" style="margin-top:4px">${data.jadwal?.tanggalBerangkat ? new Date(data.jadwal.tanggalBerangkat).toLocaleString('id-ID') : '-'}</div></div>
<div><div class="lbl">Ke</div><div class="val">${data.jadwal?.tujuan || '-'}</div><div class="lbl" style="margin-top:4px">${data.jadwal?.tanggalTiba ? new Date(data.jadwal.tanggalTiba).toLocaleString('id-ID') : '-'}</div></div>
</div>
<div class="div"></div>
<div><div class="lbl" style="text-transform:uppercase;letter-spacing:1px;margin-bottom:12px">PENUMPANG</div>${detailHTML || '<div>-</div>'}</div>
<div class="div"></div>
<div class="price"><div class="lbl">Total Pembayaran</div><div style="font-size:28px;font-weight:700;color:#2563eb">Rp ${(parseInt(data.total) || 0).toLocaleString('id-ID')}</div></div>
<div style="text-align:center"><div class="lbl">Status</div><div class="val" style="font-size:18px;color:${data.status === 'CONFIRMED' ? '#16a34a' : '#f59e0b'}">${data.status || '-'}</div></div>
<div style="text-align:center;margin-top:12px"><div class="lbl">Pembayaran</div><div class="val">${data.payment?.metode || '-'}</div></div>
</div>
<div class="ftr">Tunjukkan e-tiket ini kepada petugas di stasiun. Bawa KTP asli. Hadir min. 30 menit sebelum keberangkatan.</div>
</div><script>setTimeout(()=>window.print(),500)</script></body></html>`);
    w.document.close();
  };

  if (isLoading) return <Layout><div style={{ textAlign: 'center', padding: 64 }}><p style={{ color: '#6b7280' }}>Memuat tiket...</p></div></Layout>;
  if (!data) return <Layout><div style={{ maxWidth: 700, margin: '0 auto' }}><div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 48, textAlign: 'center' }}><h3 style={{ color: '#111827' }}>Tiket tidak ditemukan</h3><button onClick={() => router.push('/mybookings')} style={{ marginTop: 16, padding: '8px 24px', backgroundColor: '#2563eb', color: '#fff', borderRadius: 8, border: 'none', cursor: 'pointer' }}>Kembali</button></div></div></Layout>;

  const nama = keretaNama || data.jadwal?.kereta?.nama || '-';
  const detailList = data.detail || [];

  return (
    <Layout>
      <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => router.push('/mybookings')} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#2563eb', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontSize: 14 }}><ArrowLeft style={{ width: 16, height: 16 }} /> Kembali</button>
          <button onClick={downloadPDF} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 20px', backgroundColor: '#2563eb', color: '#fff', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: 14 }}><Download style={{ width: 16, height: 16 }} /> Download PDF</button>
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)', color: '#fff', padding: 24, textAlign: 'center' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700 }}>🚂 E-TIKET KERETA API</h2>
            <p style={{ opacity: 0.9, marginTop: 4, fontSize: 14 }}>Kode Booking: {data.kodeBooking || '-'}</p>
          </div>

          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Kereta */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Train style={{ width: 24, height: 24, color: '#2563eb' }} />
              <div><p style={{ fontSize: 12, color: '#6b7280' }}>Kereta</p><p style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>{nama}</p></div>
            </div>

            {/* Rute */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: 16, backgroundColor: '#f9fafb', borderRadius: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin style={{ width: 16, height: 16, color: '#2563eb' }} /><span style={{ fontSize: 12, color: '#6b7280' }}>Berangkat</span></div>
                <p style={{ fontSize: 18, fontWeight: 600, color: '#111827', marginTop: 4 }}>{data.jadwal?.asal || '-'}</p>
                <p style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{fd(data.jadwal?.tanggalBerangkat)}</p>
                <p style={{ fontSize: 13, color: '#6b7280' }}>{ft(data.jadwal?.tanggalBerangkat)}</p>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin style={{ width: 16, height: 16, color: '#dc2626' }} /><span style={{ fontSize: 12, color: '#6b7280' }}>Tiba</span></div>
                <p style={{ fontSize: 18, fontWeight: 600, color: '#111827', marginTop: 4 }}>{data.jadwal?.tujuan || '-'}</p>
                <p style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{fd(data.jadwal?.tanggalTiba)}</p>
                <p style={{ fontSize: 13, color: '#6b7280' }}>{ft(data.jadwal?.tanggalTiba)}</p>
              </div>
            </div>

            {/* Penumpang */}
            <div style={{ borderTop: '2px dashed #e5e7eb', paddingTop: 20 }}>
              <p style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Detail Penumpang</p>
              {detailList.map((d: any, i: number) => (
                <div key={d.id || i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, backgroundColor: '#f9fafb', borderRadius: 8, marginBottom: 8 }}>
                  <User style={{ width: 20, height: 20, color: '#2563eb' }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, color: '#111827' }}>{d.namaPenumpang || '-'}</p>
                    <p style={{ fontSize: 13, color: '#6b7280' }}>Kursi: {d.kursi?.label || '-'} • {d.gerbong?.nama || '-'} • {d.gerbong?.kelas || '-'}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pembayaran */}
             {/* Pembayaran */}
            {/* Pembayaran */}
            <div style={{ borderTop: '2px dashed #e5e7eb', paddingTop: 20 }}>
              <p style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Pembayaran</p>
              <div style={{ padding: 16, backgroundColor: '#eff6ff', borderRadius: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CreditCard style={{ width: 20, height: 20, color: '#2563eb' }} />
                    <div>
                      <p style={{ fontSize: 12, color: '#6b7280' }}>Metode</p>
                      <p style={{ fontWeight: 600, color: '#111827' }}>
                        {selectedMethod === 'QRIS' ? '📱 QRIS' : selectedMethod === 'EWALLET' ? '💳 E-Wallet' : selectedMethod === 'BANK' ? '🏦 Transfer Bank' : selectedMethod}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 12, color: '#6b7280' }}>Total</p>
                    <p style={{ fontSize: 24, fontWeight: 700, color: '#2563eb' }}>{fp(data.total)}</p>
                  </div>
                </div>
                {/* QRIS */}
                {selectedMethod === 'QRIS' && data.status === 'PENDING' && (
                  <div style={{ textAlign: 'center', padding: 20, backgroundColor: '#fff', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                    <p style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 16 }}>📱 Scan QR Code untuk Pembayaran</p>
                    <div style={{ display: 'inline-block', padding: 16, backgroundColor: '#fff', border: '2px solid #111827', borderRadius: 8 }}>
                      <svg width="160" height="160" viewBox="0 0 160 160">
                        <rect width="160" height="160" fill="white"/>
                        <rect x="10" y="10" width="40" height="40" fill="black"/><rect x="15" y="15" width="30" height="30" fill="white"/><rect x="20" y="20" width="20" height="20" fill="black"/>
                        <rect x="110" y="10" width="40" height="40" fill="black"/><rect x="115" y="15" width="30" height="30" fill="white"/><rect x="120" y="20" width="20" height="20" fill="black"/>
                        <rect x="10" y="110" width="40" height="40" fill="black"/><rect x="15" y="115" width="30" height="30" fill="white"/><rect x="20" y="120" width="20" height="20" fill="black"/>
                        <rect x="60" y="10" width="10" height="10" fill="black"/><rect x="80" y="10" width="10" height="10" fill="black"/><rect x="60" y="30" width="10" height="10" fill="black"/>
                        <rect x="70" y="20" width="10" height="10" fill="black"/><rect x="90" y="20" width="10" height="10" fill="black"/>
                        <rect x="10" y="60" width="10" height="10" fill="black"/><rect x="30" y="60" width="10" height="10" fill="black"/><rect x="60" y="60" width="10" height="10" fill="black"/>
                        <rect x="80" y="60" width="10" height="10" fill="black"/><rect x="100" y="60" width="10" height="10" fill="black"/><rect x="140" y="60" width="10" height="10" fill="black"/>
                        <rect x="20" y="70" width="10" height="10" fill="black"/><rect x="40" y="70" width="10" height="10" fill="black"/><rect x="70" y="70" width="10" height="10" fill="black"/>
                        <rect x="90" y="70" width="10" height="10" fill="black"/><rect x="120" y="70" width="10" height="10" fill="black"/>
                        <rect x="10" y="80" width="10" height="10" fill="black"/><rect x="50" y="80" width="10" height="10" fill="black"/><rect x="80" y="80" width="10" height="10" fill="black"/>
                        <rect x="110" y="80" width="10" height="10" fill="black"/><rect x="130" y="80" width="10" height="10" fill="black"/>
                        <rect x="60" y="90" width="10" height="10" fill="black"/><rect x="90" y="90" width="10" height="10" fill="black"/><rect x="120" y="90" width="10" height="10" fill="black"/>
                        <rect x="70" y="110" width="10" height="10" fill="black"/><rect x="90" y="110" width="10" height="10" fill="black"/><rect x="120" y="110" width="10" height="10" fill="black"/>
                        <rect x="60" y="120" width="10" height="10" fill="black"/><rect x="80" y="120" width="10" height="10" fill="black"/><rect x="110" y="120" width="10" height="10" fill="black"/><rect x="140" y="120" width="10" height="10" fill="black"/>
                        <rect x="70" y="130" width="10" height="10" fill="black"/><rect x="100" y="130" width="10" height="10" fill="black"/><rect x="130" y="130" width="10" height="10" fill="black"/>
                        <rect x="60" y="140" width="10" height="10" fill="black"/><rect x="80" y="140" width="10" height="10" fill="black"/><rect x="110" y="140" width="10" height="10" fill="black"/><rect x="140" y="140" width="10" height="10" fill="black"/>
                      </svg>
                    </div>
                    <p style={{ fontSize: 13, color: '#6b7280', marginTop: 12 }}>Gunakan aplikasi e-wallet atau mobile banking untuk scan</p>
                    <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Berlaku 30 menit • ID: {data.payment?.id?.slice(0, 12) || data.id?.slice(0, 12) || '-'}</p>
                  </div>
                )}
                {/* E-Wallet */}
                {selectedMethod === 'EWALLET' && data.status === 'PENDING' && (
                  <div style={{ padding: 20, backgroundColor: '#fff', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                    <p style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 16, textAlign: 'center' }}>💳 Bayar via E-Wallet</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 24 }}>1️⃣</span>
                        <div><p style={{ fontWeight: 500, color: '#111827', fontSize: 14 }}>Buka aplikasi E-Wallet</p><p style={{ fontSize: 13, color: '#6b7280' }}>GoPay, OVO, DANA, atau ShopeePay</p></div>
                      </div>
                      <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 24 }}>2️⃣</span>
                        <div><p style={{ fontWeight: 500, color: '#111827', fontSize: 14 }}>Pilih menu "Bayar" atau "Pay"</p><p style={{ fontSize: 13, color: '#6b7280' }}>Cari merchant "TrainBooking"</p></div>
                      </div>
                      <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 24 }}>3️⃣</span>
                        <div><p style={{ fontWeight: 500, color: '#111827', fontSize: 14 }}>Masukkan kode pembayaran</p>
                          <p style={{ fontSize: 20, fontWeight: 700, color: '#2563eb', letterSpacing: 2, marginTop: 4 }}>{data.kodeBooking || '-'}</p>
                        </div>
                      </div>
                      <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 24 }}>4️⃣</span>
                        <div><p style={{ fontWeight: 500, color: '#111827', fontSize: 14 }}>Konfirmasi & bayar</p><p style={{ fontSize: 13, color: '#6b7280' }}>Total: <strong style={{ color: '#2563eb' }}>{fp(data.total)}</strong></p></div>
                      </div>
                    </div>
                    <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 12, textAlign: 'center' }}>Pembayaran otomatis terkonfirmasi dalam 1-5 menit</p>
                  </div>
                )}
                {/* Bank Transfer */}
                {selectedMethod === 'BANK' && data.status === 'PENDING' && (
                  <div style={{ padding: 20, backgroundColor: '#fff', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                    <p style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 16, textAlign: 'center' }}>🏦 Transfer Virtual Account</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {[
                        { bank: 'BCA', color: '#003d79', va: '8888 0' + (data.id?.slice(0, 4) || '1234') + ' ' + (data.id?.slice(4, 8) || '5678') },
                        { bank: 'BNI', color: '#f15a22', va: '8899 0' + (data.id?.slice(0, 4) || '1234') + ' ' + (data.id?.slice(4, 8) || '5678') },
                        { bank: 'Mandiri', color: '#003066', va: '8900 0' + (data.id?.slice(0, 4) || '1234') + ' ' + (data.id?.slice(4, 8) || '5678') },
                      ].map(b => (
                        <div key={b.bank} style={{ padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <p style={{ fontWeight: 700, color: b.color, fontSize: 16 }}>{b.bank}</p>
                              <p style={{ fontSize: 12, color: '#6b7280' }}>Virtual Account</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <p style={{ fontSize: 18, fontWeight: 700, color: '#111827', letterSpacing: 1, fontFamily: 'monospace' }}>{b.va}</p>
                              <button onClick={() => { navigator.clipboard.writeText(b.va.replace(/\s/g, '')); toast.success('Nomor VA disalin!'); }} style={{ fontSize: 12, color: '#2563eb', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', marginTop: 2 }}>📋 Salin</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 16, padding: 12, backgroundColor: '#fefce8', borderRadius: 8 }}>
                      <p style={{ fontSize: 13, color: '#854d0e' }}>⏰ Transfer sebelum <strong>{new Date(Date.now() + 3600000).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</strong> (1 jam dari sekarang)</p>
                      <p style={{ fontSize: 12, color: '#a16207', marginTop: 4 }}>Transfer tepat <strong>{fp(data.total)}</strong> agar pembayaran otomatis terkonfirmasi</p>
                    </div>
                  </div>
                )}
                {data.status === 'CONFIRMED' && (
                  <div style={{ textAlign: 'center', padding: 12, backgroundColor: '#dcfce7', borderRadius: 8, marginTop: 8 }}>
                    <p style={{ color: '#166534', fontWeight: 500 }}>✅ Pembayaran telah dikonfirmasi</p>
                  </div>
                )}
              </div>
            </div>
        
            {/* Status */}
            <div style={{ textAlign: 'center' }}>
              <span style={{
                padding: '8px 24px', borderRadius: 9999, fontSize: 14, fontWeight: 600,
                backgroundColor: data.status === 'CONFIRMED' ? '#dcfce7' : data.status === 'PENDING' ? '#fef3c7' : '#fee2e2',
                color: data.status === 'CONFIRMED' ? '#166534' : data.status === 'PENDING' ? '#92400e' : '#991b1b',
              }}>{data.status || '-'}</span>
            </div>
          </div>

          <div style={{ backgroundColor: '#f9fafb', padding: '16px 24px', fontSize: 12, color: '#6b7280', textAlign: 'center', borderTop: '1px solid #e5e7eb' }}>
            Tunjukkan e-tiket ini kepada petugas di stasiun. Bawa KTP asli. Hadir min. 30 menit sebelum keberangkatan.
          </div>
        </div>
      </div>
    </Layout>
  );
}

