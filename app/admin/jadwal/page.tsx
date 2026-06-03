'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, Clock, MapPin } from 'lucide-react';
import apiService from '../../../services/api';
import type { Kereta } from '../../../types';
import Layout from '../../../components/layout';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import toast from 'react-hot-toast';
export default function AdminJadwalPage() {
  const [jadwals, setJadwals] = useState<any[]>([]);
  const [keretas, setKeretas] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingJadwal, setEditingJadwal] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    keretaId: '',
    asal: '',
    tujuan: '',
    tanggalBerangkat: '',
    waktuBerangkat: '',
    tanggalTiba: '',
    waktuTiba: '',
    harga: 0,
  });
  useEffect(() => { loadData(); }, []);
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [jadwalRes, keretaRes] = await Promise.all([apiService.getJadwals(), apiService.getKeretas()]);
      const jData = jadwalRes.data || jadwalRes;
      const kData = keretaRes.data || keretaRes;
      setJadwals(Array.isArray(jData) ? jData : []);
      setKeretas(Array.isArray(kData) ? kData : []);
    } catch (err: any) { toast.error('Gagal memuat data'); }
    finally { setIsLoading(false); }
  };
  const handleDelete = async (id: string) => {
    if (!confirm('Hapus jadwal ini?')) return;
    try { await apiService.deleteJadwal(id); setJadwals(jadwals.filter(j => j.id !== id)); toast.success('Jadwal dihapus'); }
    catch (err) { toast.error('Gagal'); }
  };
  const handleSubmit = async () => {
    if (!formData.keretaId) { toast.error('Pilih kereta'); return; }
    if (!formData.asal) { toast.error('Kota asal wajib diisi'); return; }
    if (!formData.tujuan) { toast.error('Kota tujuan wajib diisi'); return; }
    if (!formData.tanggalBerangkat || !formData.waktuBerangkat) { toast.error('Tanggal & waktu berangkat wajib diisi'); return; }
    if (!formData.tanggalTiba || !formData.waktuTiba) { toast.error('Tanggal & waktu tiba wajib diisi'); return; }
    if (!formData.harga) { toast.error('Harga wajib diisi'); return; }
    // Gabung tanggal + waktu jadi ISO 8601 string
    const payload = {
      keretaId: formData.keretaId,
      asal: formData.asal,
      tujuan: formData.tujuan,
      tanggalBerangkat: new Date(`${formData.tanggalBerangkat}T${formData.waktuBerangkat}:00`).toISOString(),
      tanggalTiba: new Date(`${formData.tanggalTiba}T${formData.waktuTiba}:00`).toISOString(),
      harga: formData.harga,
    };
    try {
      if (editingJadwal) {
        await apiService.updateJadwal(editingJadwal.id, payload);
        toast.success('Jadwal diperbarui');
      } else {
        await apiService.createJadwal(payload);
        toast.success('Jadwal ditambahkan');
      }
      setShowModal(false); setEditingJadwal(null);
      setFormData({ keretaId: '', asal: '', tujuan: '', tanggalBerangkat: '', waktuBerangkat: '', tanggalTiba: '', waktuTiba: '', harga: 0 });
      loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      if (Array.isArray(msg)) toast.error(msg.join(', '));
      else toast.error(msg || 'Gagal');
    }
  };
  const openEdit = (j: any) => {
    setEditingJadwal(j);
    // Parse ISO date back to date + time
    const berangkat = j.tanggalBerangkat ? new Date(j.tanggalBerangkat) : null;
    const tiba = j.tanggalTiba ? new Date(j.tanggalTiba) : null;
    setFormData({
      keretaId: j.keretaId || j.kereta?.id || '',
      asal: j.asal || '',
      tujuan: j.tujuan || '',
      tanggalBerangkat: berangkat ? berangkat.toISOString().split('T')[0] : '',
      waktuBerangkat: berangkat ? berangkat.toTimeString().slice(0, 5) : '',
      tanggalTiba: tiba ? tiba.toISOString().split('T')[0] : '',
      waktuTiba: tiba ? tiba.toTimeString().slice(0, 5) : '',
      harga: j.harga || 0,
    });
    setShowModal(true);
  };
  const formatPrice = (price: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  const formatDate = (iso: string) => {
    if (!iso) return '-';
    const d = new Date(iso);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  const formatTime = (iso: string) => {
    if (!iso) return '-';
    const d = new Date(iso);
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between"><div><h1 className="text-2xl text-black font-bold">Kelola Jadwal</h1><p className="text-black">Jadwal keberangkatan kereta</p></div><Button onClick={() => setShowModal(true)}><Plus className="h-5 w-5 mr-2" />Tambah Jadwal</Button></div>
        {isLoading ? <Card><div className="text-center py-12"><div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div></div></Card> :
        jadwals.length === 0 ? <Card><div className="text-center py-12"><Calendar className="h-16 w-16 mx-auto mb-4" style={{ color: '#d1d5db' }} /><h3 className="text-lg font-medium" style={{ color: '#111827' }}>Belum ada jadwal</h3><p style={{ color: '#6b7280' }}>Tambahkan jadwal pertama</p></div></Card> :
          <Card>
            <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-gray-200"><th className="text-left py-3 px-4 text-sm font-medium text-black">Kereta</th><th className="text-left py-3 px-4 text-sm font-medium text-black">Rute</th><th className="text-left py-3 px-4 text-sm font-medium text-black">Berangkat</th><th className="text-left py-3 px-4 text-sm font-medium text-black">Tiba</th><th className="text-left py-3 px-4 text-sm font-medium text-black">Harga</th><th className="text-right py-3 px-4 text-sm font-medium text-black">Aksi</th></tr></thead><tbody>
              {jadwals.map((j) => (
                <tr key={j.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium" style={{ color: '#111827' }}>{j.kereta?.nama || '-'}</td>
                  <td className="py-3 px-4"><div className="flex items-center space-x-2 text-sm" style={{ color: '#111827' }}><MapPin className="h-4 w-4" /><span>{j.asal} → {j.tujuan}</span></div></td>
                  <td className="py-3 px-4"><div className="text-sm" style={{ color: '#111827' }}><div className="flex items-center space-x-1"><Calendar className="h-3 w-3" /><span>{formatDate(j.tanggalBerangkat)}</span></div><div className="flex items-center space-x-1 mt-0.5"><Clock className="h-3 w-3" /><span>{formatTime(j.tanggalBerangkat)}</span></div></div></td>
                  <td className="py-3 px-4"><div className="text-sm" style={{ color: '#111827' }}><div className="flex items-center space-x-1"><Calendar className="h-3 w-3" /><span>{formatDate(j.tanggalTiba)}</span></div><div className="flex items-center space-x-1 mt-0.5"><Clock className="h-3 w-3" /><span>{formatTime(j.tanggalTiba)}</span></div></div></td>
                  <td className="py-3 px-4 text-sm font-medium" style={{ color: '#111827' }}>{formatPrice(j.harga)}</td>
                  <td className="py-3 px-4"><div className="flex justify-end space-x-2"><button onClick={() => openEdit(j)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit className="h-4 w-4" /></button><button onClick={() => handleDelete(j.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button></div></td>
                </tr>
              ))}
            </tbody></table></div>
          </Card>}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-6" style={{ color: '#111827' }}>{editingJadwal ? 'Edit Jadwal' : 'Tambah Jadwal'}</h2>
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                <Select label="Kereta" options={keretas.map(k => ({ value: k.id, label: k.nama }))} value={formData.keretaId} onChange={(e) => setFormData({ ...formData, keretaId: e.target.value })} style={{ color: '#111827' }} placeholder="Pilih kereta" />
                <div className="grid grid-cols-2 gap-4"><Input label="Kota Asal" placeholder="Jakarta" value={formData.asal} onChange={(e) => setFormData({ ...formData, asal: e.target.value })} required /><Input label="Kota Tujuan" placeholder="Bandung" value={formData.tujuan} onChange={(e) => setFormData({ ...formData, tujuan: e.target.value })} required /></div>
                <div className="grid grid-cols-2 gap-4"><Input label="Tanggal Berangkat" type="date" value={formData.tanggalBerangkat} onChange={(e) => setFormData({ ...formData, tanggalBerangkat: e.target.value })} required /><Input label="Waktu Berangkat" type="time" value={formData.waktuBerangkat} onChange={(e) => setFormData({ ...formData, waktuBerangkat: e.target.value })} required /></div>
                <div className="grid grid-cols-2 gap-4"><Input label="Tanggal Tiba" type="date" value={formData.tanggalTiba} onChange={(e) => setFormData({ ...formData, tanggalTiba: e.target.value })} required /><Input label="Waktu Tiba" type="time" value={formData.waktuTiba} onChange={(e) => setFormData({ ...formData, waktuTiba: e.target.value })} required /></div>
                <Input label="Harga" type="number" placeholder="150000" value={formData.harga} onChange={(e) => setFormData({ ...formData, harga: parseInt(e.target.value) || 0 })} required />
                <div className="flex justify-end space-x-3 pt-4"><Button type="button" variant="ghost" onClick={() => { setShowModal(false); setEditingJadwal(null); }}>Batal</Button><Button type="submit">{editingJadwal ? 'Update' : 'Simpan'}</Button></div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}