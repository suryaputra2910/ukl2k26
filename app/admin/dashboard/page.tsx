'use client';

import { Train, Calendar, Users, DollarSign } from 'lucide-react';
import Layout from '../../../components/layout';
import Card from '../../../components/ui/Card';
const stats = [
  { name: 'Total Kereta', value: '12', icon: Train, color: 'blue' },
  { name: 'Jadwal Aktif', value: '48', icon: Calendar, color: 'green' },
  { name: 'Total Penumpang', value: '1,234', icon: Users, color: 'purple' },
  { name: 'Pendapatan', value: 'Rp 125jt', icon: DollarSign, color: 'yellow' },
];
export default function AdminDashboardPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-black">Dashboard</h1><p className="text-black">Ringkasan sistem pemesanan tiket</p></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s) => (
            <Card key={s.name}><div className="flex items-center justify-between"><div><p className="text-sm" style={{ color: '#111827' }}>{s.name}</p><p className="text-2xl font-bold mt-1" style={{ color: '#111827' }}>{s.value}</p><p className="text-sm mt-1 text-green-600">+2 dari bulan lalu</p></div><div className="p-3 rounded-xl bg-blue-100 text-blue-600"><s.icon className="h-6 w-6" /></div></div></Card>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card><h3 className="text-lg font-semibold text-black mb-4">Kelola Kereta</h3><p className="text-black mb-4">Tambah, edit, atau hapus data kereta api</p><a href="/admin/kereta" className="text-blue-600 hover:text-blue-700 font-medium">Kelola Kereta →</a></Card>
          <Card><h3 className="text-lg font-semibold text-black mb-4">Kelola Jadwal</h3><p className="text-black mb-4">Atur jadwal keberangkatan</p><a href="/admin/jadwal" className="text-blue-600 hover:text-blue-700 font-medium">Kelola Jadwal →</a></Card>
          <Card><h3 className="text-lg font-semibold text-black mb-4">Kelola Users</h3><p className="text-black mb-4">Manage user dan pelanggan</p><a href="/admin/useradmin" className="text-blue-600 hover:text-blue-700 font-medium">Kelola Users →</a></Card>
        </div>
      </div>
    </Layout>
  );
}