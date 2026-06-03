'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Building, Smartphone, CheckCircle, Clock, Copy } from 'lucide-react';
import apiService from '../../../services/api';
import type { Pembelian, PaymentInfo } from '../../../types';
import Layout from '../../../components/layout';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import toast from 'react-hot-toast';

const paymentMethods = [
  { id: 'bca', name: 'BCA Virtual Account', icon: Building },
  { id: 'bni', name: 'BNI Virtual Account', icon: Building },
  { id: 'mandiri', name: 'Mandiri Virtual Account', icon: Building },
  { id: 'gopay', name: 'GoPay', icon: Smartphone },
  { id: 'ovo', name: 'OVO', icon: Smartphone },
  { id: 'dana', name: 'DANA', icon: Smartphone },
];

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '';
  const [pembelian, setPembelian] = useState<Pembelian | null>(null);
  const [payment, setPayment] = useState<PaymentInfo | null>(null);
  const [selectedMethod, setSelectedMethod] = useState('bca');
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => { if (id) loadData(); }, [id]);

  const loadData = async () => {
    try {
      const [pembelianRes, paymentRes] = await Promise.all([apiService.getPembelian(id), apiService.getPayment(id)]);
      if (pembelianRes.success) setPembelian(pembelianRes.data);
      if (paymentRes.success) setPayment(paymentRes.data);
    } catch (err: any) { toast.error('Gagal memuat data'); }
  };

  const handleConfirm = async () => {
    if (!id) return;
    setIsConfirming(true);
    try {
      await apiService.confirmPayment(id);
      toast.success('Pembayaran berhasil dikonfirmasi!');
      router.push(`/mybookings/ticket?id=${id}`);
    } catch (err: any) { toast.error(err.response?.data?.message || 'Gagal konfirmasi'); }
    finally { setIsConfirming(false); }
  };

  const handleCopy = (text: string) => { navigator.clipboard.writeText(text); toast.success('Nomor disalin!'); };
  const formatPrice = (price: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  if (!pembelian) return <Layout><div className="text-center py-12"><div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div></div></Layout>;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button>
          <div><h1 className="text-2xl font-bold">Pembayaran</h1><p className="text-gray-600">Kode Booking: {pembelian.kodeBooking}</p></div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3"><Clock className="h-6 w-6 text-orange-600" /><div><p className="font-medium text-orange-900">Selesaikan pembayaran dalam</p></div></div>
          <div className="text-2xl font-bold text-orange-600">00:59:45</div>
        </div>
        <Card title="Ringkasan Pesanan">
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-gray-600">Kereta</span><span className="font-medium">{pembelian.jadwal.kereta.nama}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Rute</span><span className="font-medium">{pembelian.jadwal.asal} → {pembelian.jadwal.tujuan}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Tanggal</span><span className="font-medium">{new Date(pembelian.jadwal.tanggal).toLocaleDateString('id-ID')}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Kursi</span><span className="font-medium">{pembelian.kursis?.map(k => k.nomor).join(', ') || '-'}</span></div>
            <div className="border-t pt-3 flex justify-between"><span className="font-semibold">Total</span><span className="font-bold text-xl text-blue-600">{formatPrice(pembelian.totalHarga)}</span></div>
          </div>
        </Card>
        <Card title="Pilih Metode Pembayaran">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {paymentMethods.map((m) => (
              <button key={m.id} onClick={() => setSelectedMethod(m.id)} className={`p-4 rounded-xl border-2 text-left transition-all ${selectedMethod === m.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className="flex items-center space-x-3"><div className={`p-2 rounded-lg ${selectedMethod === m.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}><m.icon className="h-5 w-5" /></div><p className="font-medium">{m.name}</p></div>
              </button>
            ))}
          </div>
        </Card>
        <Card title="Instruksi Pembayaran">
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Nomor Virtual Account:</p>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-mono font-bold">8888 0123 4567 8901</p>
                <button onClick={() => handleCopy('8888012345678901')} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Copy className="h-5 w-5" /></button>
              </div>
            </div>
            <Button onClick={handleConfirm} isLoading={isConfirming} className="w-full" size="lg"><CheckCircle className="h-5 w-5 mr-2" />Saya Sudah Membayar</Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
}