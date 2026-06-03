'use client';
import { ArrowRight, Clock, MapPin, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import Layout from '../components/layout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

const cities = [
  { value: 'Jakarta', label: 'Jakarta' },
  { value: 'Bandung', label: 'Bandung' },
  { value: 'Yogyakarta', label: 'Yogyakarta' },
  { value: 'Surabaya', label: 'Surabaya' },
  { value: 'Semarang', label: 'Semarang' },
  { value: 'Medan', label: 'Medan' },
  { value: 'Makassar', label: 'Makassar' },
  { value: 'Malang', label: 'Malang' },
  { value: 'Surakarta', label: 'Surakarta' },
  { value: 'Cirebon', label: 'Cirebon' },
];

export default function HomePage() {
  const router = useRouter();
  const [asal, setAsal] = useState('');
  const [tujuan, setTujuan] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [penumpang, setPenumpang] = useState('1');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!asal || !tujuan || !tanggal) { toast.error('Lengkapi data pencarian'); return; }
    router.push(`/search?asal=${asal}&tujuan=${tujuan}&tanggal=${tanggal}&penumpang=${penumpang}`);
  };

  return (
    <Layout>
      <div className="space-y-16">
        <section className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-3xl overflow-hidden">
          <div className="relative px-6 py-16 md:py-24">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">Pesan Tiket Kereta<br />Dengan Mudah</h1>
              <p className="text-xl text-blue-100 mb-10">Nikmati perjalanan nyaman dengan kereta api. Pesan sekarang, berangkat dengan tenang.</p>
            </div>
          </div>
        </section>

        <section>
          <div className="text-center mb-8"><h2 className="text-3xl font-bold text-gray-900">Rute Populer</h2><p className="mt-2 text-gray-600">Pilihan perjalanan favorit pelanggan kami</p></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { from: 'Jakarta', to: 'Bandung', price: 'Rp 150.000', duration: '3 jam' },
              { from: 'Jakarta', to: 'Yogyakarta', price: 'Rp 350.000', duration: '8 jam' },
              { from: 'Surabaya', to: 'Yogyakarta', price: 'Rp 250.000', duration: '6 jam' },
              { from: 'Bandung', to: 'Yogyakarta', price: 'Rp 200.000', duration: '5 jam' },
            ].map((r, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2"><MapPin className="h-5 w-5 text-blue-600" /><span className="font-medium text-gray-900">{r.from}</span></div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                  <div className="flex items-center space-x-2"><MapPin className="h-5 w-5 text-blue-600" /><span className="font-medium text-gray-900">{r.to}</span></div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span className="flex items-center"><Clock className="h-4 w-4 mr-1" />{r.duration}</span>
                  <span className="font-semibold text-blue-600">{r.price}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}