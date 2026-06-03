'use client';
import { ArrowLeft, Calendar, Clock, MapPin, Train, User, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Layout from '../../components/layout';
const API = 'https://keretaapi-production.up.railway.app';
export default function BookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jadwalId = searchParams.get('jadwalId') || '';
  const [jadwal, setJadwal] = useState<any>(null);
  const [gerbongs, setGerbongs] = useState<any[]>([]);
  const [selectedGerbong, setSelectedGerbong] = useState('');
  const [kursis, setKursis] = useState<any[]>([]);
  const [penumpangList, setPenumpangList] = useState([{ namaPenumpang: '', kursiId: '' }]);
  const [selectedPassenger, setSelectedPassenger] = useState(0);
  const [isBooking, setIsBooking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('QRIS');
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token') || '';
    }
    return '';
  };
  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/auth/login');
      return;
    }
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      setPenumpangList([{ namaPenumpang: u.nama || u.username || '', kursiId: '' }]);
    } catch {}
    if (jadwalId) loadJadwal();
    else { toast.error('Jadwal tidak dipilih'); router.push('/search'); }
  }, []);
  const loadJadwal = async () => {
  setIsLoading(true);
  
  try {
    
    const token = getToken();

    const jadwalRes = await fetch(`${API}/jadwal/${jadwalId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const jadwalData = await jadwalRes.json();

    console.log('JADWAL:', jadwalData);

    setJadwal(jadwalData);

    const keretaId = jadwalData.kereta?.id || jadwalData.keretaId;

    if (keretaId) {
      const keretaRes = await fetch(`${API}/kereta/${keretaId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const keretaData = await keretaRes.json();

      console.log('KERETA:', keretaData);

      const gb = keretaData.gerbong || keretaData.gerbongs || [];

      setGerbongs(gb);

      if (gb.length > 0) {
        setSelectedGerbong(gb[0].id);

        const kursiList = [...(gb[0].kursi || gb[0].kursis || [])];

        kursiList.sort((a: any, b: any) => {
          if (a.row !== b.row) {
            return (a.row || 0) - (b.row || 0);
          }

          return (a.seat || '').localeCompare(b.seat || '');
        });

        setKursis(kursiList);
      }
    }
  } catch (err) {
    console.error('LOAD ERROR:', err);
    toast.error('Gagal memuat jadwal');
    router.push('/search');
  } finally {
    setIsLoading(false);
  }
};
  const loadKursi = (gerbong: any) => {
  const list = [...(gerbong.kursi || gerbong.kursis || [])];

  list.sort((a: any, b: any) => {
    if (a.row !== b.row) {
      return (a.row || 0) - (b.row || 0);
    }

    return (a.seat || '').localeCompare(b.seat || '');
  });

  setKursis(list);
};
  const selectGerbong = (id: string) => {
    setSelectedGerbong(id);
    const gb = gerbongs.find((g: any) => g.id === id);
    if (gb) {
      loadKursi(gb);
    } else {
      setKursis([]);
    }
    setPenumpangList(penumpangList.map(p => ({ ...p, kursiId: '' })));
  };
  const handleKursiClick = (kursi: any) => {
    const isTaken = kursi.status === 'terisi' || kursi.status === 'dipesan' || kursi.status === 'TERISI' || kursi.status === 'DIPESAN';
    if (isTaken) {
      toast.error('Kursi sudah terisi');
      return;
    }
    const isSelectedByCurrent = penumpangList[selectedPassenger]?.kursiId === kursi.id;
    const isSelectedByOther = penumpangList.some((p, i) => i !== selectedPassenger && p.kursiId === kursi.id);
    if (isSelectedByCurrent) {
      // Batal pilih
      const updated = [...penumpangList];
      updated[selectedPassenger].kursiId = '';
      setPenumpangList(updated);
      return;
    }
    if (isSelectedByOther) {
      toast.error('Kursi sudah dipilih penumpang lain');
      return;
    }
    // Pilih kursi
    const updated = [...penumpangList];
    updated[selectedPassenger].kursiId = kursi.id;
    setPenumpangList(updated);
  };
  const addPenumpang = () => {
    setPenumpangList([...penumpangList, { namaPenumpang: '', kursiId: '' }]);
    setSelectedPassenger(penumpangList.length);
  };
  const removePenumpang = (index: number) => {
    if (penumpangList.length <= 1) return;
    const newList = penumpangList.filter((_, i) => i !== index);
    setPenumpangList(newList);
    if (selectedPassenger >= newList.length) {
      setSelectedPassenger(newList.length - 1);
    }
  };
  const handleBooking = async () => {
    for (let i = 0; i < penumpangList.length; i++) {
      if (!penumpangList[i].namaPenumpang.trim()) {
        toast.error(`Nama penumpang ${i + 1} wajib diisi`);
        setSelectedPassenger(i);
        return;
      }
      if (!penumpangList[i].kursiId) {
        toast.error(`Pilih kursi untuk penumpang ${i + 1}`);
        setSelectedPassenger(i);
        return;
      }
    }
    setIsBooking(true);
    try {
      const token = getToken();
      const payload = {
        jadwalId: jadwal.id,
        penumpang: penumpangList.map(p => ({
          namaPenumpang: p.namaPenumpang,
          kursiId: p.kursiId,
        })),
      };
      console.log('BOOKING PAYLOAD:', payload);

const res = await fetch(`${API}/pembelian`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      console.log('BOOKING RESPONSE:', data);
      if (!res.ok) {
        const msg = data.message;
        if (Array.isArray(msg)) toast.error(msg.join(', '));
        else toast.error(msg || 'Gagal membuat pemesanan');
        return;
      }
      toast.success('Pemesanan berhasil!');
      localStorage.setItem('lastPembelian', JSON.stringify(data));
      localStorage.setItem('paymentMethod', paymentMethod);
      const pembelianId = data.id || data.pembelianId || data.data?.id || '';
      router.push('/booking/tiket/' + pembelianId);
    } catch (err: any) {
      console.error('BOOKING ERROR:', err);
      toast.error('Gagal membuat pemesanan');
    } finally { setIsBooking(false); }
  };
  const formatPrice = (p: any) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(parseInt(p) || 0);
  const formatDate = (s: string) => s ? new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
  const formatTime = (s: string) => s ? new Date(s).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-';
  const getKursiById = (id: string) =>
  kursis.find((k: any) => k.id === id);
  if (isLoading) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: 64 }}>
          <p style={{ color: '#6b7280' }}>Memuat data...</p>
        </div>
      </Layout>
    );
  }
  if (!jadwal) return null;
  const totalHarga = (parseInt(jadwal.harga) || 0) * penumpangList.length;
  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => router.back()} style={{ border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#2563eb', padding: 8 }}>
            <ArrowLeft style={{ width: 24, height: 24 }} />
          </button>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>Pesan Tiket</h1>
            <p style={{ color: '#6b7280' }}>{jadwal.kereta?.nama || '-'} — {jadwal.asal} ke {jadwal.tujuan}</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
          {/* LEFT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Detail Jadwal */}
            <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 24 }}>
              <h3 style={{ fontWeight: 600, color: '#111827', marginBottom: 16 }}>Detail Perjalanan</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Train style={{ width: 20, height: 20, color: '#2563eb' }} />
                  <div>
                    <p style={{ fontSize: 12, color: '#6b7280' }}>Kereta</p>
                    <p style={{ fontWeight: 600, color: '#111827' }}>{jadwal.kereta?.nama || '-'}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <MapPin style={{ width: 20, height: 20, color: '#2563eb' }} />
                  <div>
                    <p style={{ fontSize: 12, color: '#6b7280' }}>Rute</p>
                    <p style={{ fontWeight: 600, color: '#111827' }}>{jadwal.asal} → {jadwal.tujuan}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Calendar style={{ width: 20, height: 20, color: '#2563eb' }} />
                  <div>
                    <p style={{ fontSize: 12, color: '#6b7280' }}>Berangkat</p>
                    <p style={{ fontWeight: 600, color: '#111827' }}>{formatDate(jadwal.tanggalBerangkat)} · {formatTime(jadwal.tanggalBerangkat)}</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Pilih Gerbong */}
            {gerbongs.length > 0 && (
              <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 24 }}>
                <h3 style={{ fontWeight: 600, color: '#111827', marginBottom: 12 }}>Pilih Gerbong</h3>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {gerbongs.map((g: any) => (
                    <button
                      key={g.id}
                      onClick={() => selectGerbong(g.id)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 8,
                        border: selectedGerbong === g.id ? '2px solid #2563eb' : '1px solid #d1d5db',
                        backgroundColor: selectedGerbong === g.id ? '#eff6ff' : '#fff',
                        color: selectedGerbong === g.id ? '#2563eb' : '#374151',
                        cursor: 'pointer',
                        fontWeight: 500,
                        fontSize: 14
                      }}
                    >
                      {g.namaGerbong || g.nama || `Gerbong ${g.nomor || ''}`}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* Denah Kursi */}
            {kursis.length > 0 && (
              <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 24 }}>
                <h3 style={{ fontWeight: 600, color: '#111827', marginBottom: 12 }}>
                  Pilih Kursi untuk: <span style={{ color: '#2563eb' }}>Penumpang {selectedPassenger + 1}</span>
                </h3>
                {/* Legend */}
                <div style={{ display: 'flex', gap: 24, marginBottom: 16, fontSize: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 24, height: 24, border: '2px solid #d1d5db', borderRadius: 4, backgroundColor: '#fff' }}></div>
                    <span>Tersedia</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 24, height: 24, backgroundColor: '#2563eb', borderRadius: 4 }}></div>
                    <span>Dipilih</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 24, height: 24, backgroundColor: '#9ca3af', borderRadius: 4 }}></div>
                    <span>Terisi</span>
                  </div>
                </div>
                {/* Grid Kursi */}
                <div style={{ backgroundColor: '#f3f4f6', borderRadius: 12, padding: 20 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, maxWidth: 280, margin: '0 auto' }}>
                    {kursis.map((k: any) => {
                      const isTaken = k.status === 'terisi' || k.status === 'dipesan' || k.status === 'TERISI' || k.status === 'DIPESAN';
                      const isSelected = penumpangList[selectedPassenger]?.kursiId === k.id;
                      const isSelectedByOther = penumpangList.some((p, i) => i !== selectedPassenger && p.kursiId === k.id);
                      let bgColor = '#ffffff';
                      let textColor = '#374151';
                      let borderColor = '#d1d5db';
                      let cursor = 'pointer';
                      if (isTaken) {
                        bgColor = '#9ca3af';
                        textColor = '#ffffff';
                        borderColor = '#9ca3af';
                        cursor = 'not-allowed';
                      } else if (isSelected) {
                        bgColor = '#2563eb';
                        textColor = '#ffffff';
                        borderColor = '#2563eb';
                      } else if (isSelectedByOther) {
                        bgColor = '#93c5fd';
                        textColor = '#1e40af';
                        borderColor = '#2563eb';
                        cursor = 'not-allowed';
                      }
                      return (
                        <button
                          key={k.id}
                          onClick={() => handleKursiClick(k)}
                          disabled={isTaken}
                          style={{
                            height: 48,
                            borderRadius: 6,
                            fontWeight: 500,
                            fontSize: 13,
                            border: `2px solid ${borderColor}`,
                            backgroundColor: bgColor,
                            color: textColor,
                            cursor: isTaken ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {k.label || k.nomor || k.nomorKursi || `${k.row || ''}${k.seat || ''}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {/* Info penumpang lain */}
                {penumpangList.some(p => p.kursiId) && (
                  <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f0fdf4', borderRadius: 8 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: '#166534', marginBottom: 8 }}>Kursi terpilih:</p>
                    {penumpangList.map((p, i) => p.kursiId && (
                      <p key={i} style={{ fontSize: 13, color: '#166534' }}>
                        Penumpang {i + 1}: {getKursiById(p.kursiId)?.nomor || getKursiById(p.kursiId)?.label || '-'}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
            {kursis.length === 0 && gerbongs.length > 0 && (
              <div style={{ backgroundColor: '#fef2f2', borderRadius: 12, border: '1px solid #fecaca', padding: 24, textAlign: 'center' }}>
                <p style={{ color: '#991b1b' }}>Gerbong ini tidak memiliki kursi</p>
              </div>
            )}
          </div>
          {/* RIGHT - Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 80 }}>
            {/* Data Penumpang */}
            <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontWeight: 600, color: '#111827' }}>Data Penumpang</h3>
                <button
                  onClick={addPenumpang}
                  style={{ padding: '4px 12px', backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}
                >
                  + Tambah
                </button>
              </div>
              {penumpangList.map((p, i) => (
                <div
  key={i}
  onClick={() => setSelectedPassenger(i)}
  style={{
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    cursor: 'pointer',
    backgroundColor:
      selectedPassenger === i ? '#eff6ff' : '#f9fafb',
    border:
      selectedPassenger === i
        ? '2px solid #2563eb'
        : '1px solid transparent',
  }}
>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: selectedPassenger === i ? '#2563eb' : '#6b7280' }}>
                      Penumpang {i + 1} {selectedPassenger === i && '(Pilih Kursi)'}
                    </span>
                    {penumpangList.length > 1 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); removePenumpang(i); }}
                        style={{ fontSize: 12, color: '#dc2626', border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}
                      >
                        <X style={{ width: 14, height: 14 }} />
                      </button>
                    )}
                  </div>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
                      <User style={{ width: 16, height: 16 }} />
                    </div>
                    <input
                      type="text"
                      placeholder="Nama lengkap"
                      value={p.namaPenumpang}
                      onChange={e => {
                        const u = [...penumpangList];
                        u[i].namaPenumpang = e.target.value;
                        setPenumpangList(u);
                      }}
                      style={{ width: '100%', padding: '8px 12px 8px 36px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, color: '#111827', backgroundColor: '#fff', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                  {p.kursiId && (
                    <p style={{ fontSize: 12, color: '#2563eb', marginTop: 4 }}>
                      Kursi: <strong>{getKursiById(p.kursiId)?.nomor || getKursiById(p.kursiId)?.label || '-'}</strong>
                    </p>
                  )}
                </div>
              ))}
            </div>
            {/* Metode Pembayaran */}
            <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 24 }}>
              <h3 style={{ fontWeight: 600, color: '#111827', marginBottom: 16 }}>Metode Pembayaran</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { id: 'QRIS', label: 'QRIS', desc: 'Scan QR untuk bayar' },
                  { id: 'EWALLET', label: 'E-Wallet', desc: 'GoPay, OVO, DANA' },
                  { id: 'BANK', label: 'Transfer Bank', desc: 'BCA, BNI, Mandiri' },
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: 12,
                      borderRadius: 8,
                      border: paymentMethod === m.id ? '2px solid #2563eb' : '1px solid #d1d5db',
                      backgroundColor: paymentMethod === m.id ? '#eff6ff' : '#fff',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 500, color: '#111827', fontSize: 14 }}>{m.label}</p>
                      <p style={{ fontSize: 12, color: '#6b7280' }}>{m.desc}</p>
                    </div>
                    {paymentMethod === m.id && <span style={{ color: '#2563eb', fontWeight: 700 }}>✓</span>}
                  </button>
                ))}
              </div>
            </div>
            {/* Ringkasan */}
            <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 24 }}>
              <h3 style={{ fontWeight: 600, color: '#111827', marginBottom: 16 }}>Ringkasan</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>Jumlah penumpang</span>
                  <span style={{ fontWeight: 500, color: '#111827' }}>{penumpangList.length} orang</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>Harga per orang</span>
                  <span style={{ fontWeight: 500, color: '#111827' }}>{formatPrice(jadwal.harga)}</span>
                </div>
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 12, marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600, color: '#111827' }}>Total</span>
                  <span style={{ fontWeight: 700, fontSize: 20, color: '#2563eb' }}>{formatPrice(totalHarga)}</span>
                </div>
              </div>
              <button
                onClick={handleBooking}
                disabled={isBooking || penumpangList.some(p => !p.namaPenumpang.trim() || !p.kursiId)}
                style={{
                  width: '100%',
                  marginTop: 16,
                  padding: 12,
                  backgroundColor: (isBooking || penumpangList.some(p => !p.namaPenumpang.trim() || !p.kursiId)) ? '#93c5fd' : '#2563eb',
                  color: '#fff',
                  borderRadius: 8,
                  fontWeight: 600,
                  border: 'none',
                  cursor: (isBooking || penumpangList.some(p => !p.namaPenumpang.trim() || !p.kursiId)) ? 'not-allowed' : 'pointer',
                  fontSize: 14
                }}
              >
                {isBooking ? 'Memproses...' : 'Bayar Sekarang'}
              </button>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
  <Clock style={{ width: 20, height: 20, color: '#2563eb' }} />
  <div>
    <p style={{ fontSize: 12, color: '#6b7280' }}>Tiba</p>
    <p style={{ fontWeight: 600, color: '#111827' }}>
      {formatDate(jadwal.tanggalTiba)} · {formatTime(jadwal.tanggalTiba)}
    </p>
  </div>
</div>

            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}