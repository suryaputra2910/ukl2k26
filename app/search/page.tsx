'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Train } from 'lucide-react';
import Layout from '../../components/layout';
import apiService from '../../services/api';
import toast from 'react-hot-toast';
export default function SearchPage() {
  const router = useRouter();
  const [asal, setAsal] = useState('');
  const [tujuan, setTujuan] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [allJadwals, setAllJadwals] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => { (async () => { try { const r = await apiService.getJadwals(); const d = r.data || r; const l = Array.isArray(d) ? d : []; setAllJadwals(l); setFiltered(l); } catch { toast.error('Gagal'); } finally { setIsLoading(false); } })(); }, []);
  const doSearch = (e: React.FormEvent) => { e.preventDefault(); let r = [...allJadwals]; if (asal.trim()) r = r.filter(j => j.asal?.toLowerCase().includes(asal.toLowerCase())); if (tujuan.trim()) r = r.filter(j => j.tujuan?.toLowerCase().includes(tujuan.toLowerCase())); if (tanggal) r = r.filter(j => (j.tanggalBerangkat||'').split('T')[0] === tanggal); setFiltered(r); if (!r.length) toast.error('Tidak ditemukan'); };
  const doReset = () => { setAsal(''); setTujuan(''); setTanggal(''); setFiltered(allJadwals); };
  const fp = (p:any) => new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',minimumFractionDigits:0}).format(parseInt(p)||0);
  const fd = (s:string) => s ? new Date(s).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'}) : '-';
  const ft = (s:string) => s ? new Date(s).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}) : '-';
  const si = {width:'100%',padding:'10px 12px',border:'1px solid #d1d5db',borderRadius:'8px',fontSize:'14px',color:'#111827',backgroundColor:'#fff',outline:'none',boxSizing:'border-box' as const};
  return (<Layout><div style={{display:'flex',flexDirection:'column',gap:24}}>
    <div style={{backgroundColor:'#fff',borderRadius:12,border:'1px solid #e5e7eb',padding:24}}>
      <form onSubmit={doSearch} style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:16,alignItems:'end'}}>
        <div><label style={{display:'block',fontSize:14,fontWeight:500,color:'#374151',marginBottom:6}}>Dari</label><input type="text" placeholder="Ketik kota asal" value={asal} onChange={e=>setAsal(e.target.value)} style={si}/></div>
        <div><label style={{display:'block',fontSize:14,fontWeight:500,color:'#374151',marginBottom:6}}>Ke</label><input type="text" placeholder="Ketik kota tujuan" value={tujuan} onChange={e=>setTujuan(e.target.value)} style={si}/></div>
        <div><label style={{display:'block',fontSize:14,fontWeight:500,color:'#374151',marginBottom:6}}>Tanggal</label><input type="date" value={tanggal} onChange={e=>setTanggal(e.target.value)} style={si}/></div>
        <div style={{display:'flex',gap:8}}>
          <button type="submit" style={{flex:1,padding:10,backgroundColor:'#2563eb',color:'#fff',borderRadius:8,fontWeight:600,border:'none',cursor:'pointer',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',gap:6}}><Search style={{width:16,height:16}}/>Cari</button>
          <button type="button" onClick={doReset} style={{padding:'10px 16px',backgroundColor:'#fff',border:'1px solid #d1d5db',color:'#374151',borderRadius:8,cursor:'pointer',fontSize:14}}>Reset</button>
        </div>
      </form>
    </div>
    {isLoading ? <div style={{textAlign:'center',padding:64,backgroundColor:'#fff',borderRadius:12,border:'1px solid #e5e7eb'}}><p style={{color:'#6b7280'}}>Memuat jadwal...</p></div>
    : filtered.length===0 ? <div style={{backgroundColor:'#fff',borderRadius:12,border:'1px solid #e5e7eb',padding:48,textAlign:'center'}}><Train style={{width:64,height:64,color:'#d1d5db',margin:'0 auto 16px'}}/><h3 style={{color:'#111827',fontWeight:500,fontSize:18}}>Tidak ada jadwal</h3><p style={{color:'#6b7280',marginTop:8}}>Ubah pencarian atau klik Reset</p></div>
    : <div style={{display:'flex',flexDirection:'column',gap:16}}>
        <p style={{fontSize:14,color:'#6b7280'}}>{filtered.length} jadwal ditemukan</p>
        {filtered.map(j => (
          <div key={j.id} style={{backgroundColor:'#fff',borderRadius:12,border:'1px solid #e5e7eb',padding:24}}>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
              <Train style={{width:20,height:20,color:'#2563eb'}}/>
              <span style={{fontWeight:600,color:'#111827',fontSize:18}}>{j.kereta?.nama || '-'}</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:16,alignItems:'center'}}>
              <div style={{display:'flex',alignItems:'center',gap:32}}>
                <div>
                  <div style={{display:'flex',alignItems:'center',gap:8}}><MapPin style={{width:16,height:16,color:'#2563eb'}}/><span style={{fontWeight:600,color:'#111827',fontSize:18}}>{j.asal}</span></div>
                  <p style={{fontSize:13,color:'#6b7280',marginTop:4}}>{fd(j.tanggalBerangkat)} • {ft(j.tanggalBerangkat)}</p>
                </div>
                <span style={{color:'#9ca3af',fontSize:20}}>→</span>
                <div>
                  <div style={{display:'flex',alignItems:'center',gap:8}}><MapPin style={{width:16,height:16,color:'#dc2626'}}/><span style={{fontWeight:600,color:'#111827',fontSize:18}}>{j.tujuan}</span></div>
                  <p style={{fontSize:13,color:'#6b7280',marginTop:4}}>{fd(j.tanggalTiba)} • {ft(j.tanggalTiba)}</p>
                </div>
              </div>
              <div style={{textAlign:'right'}}>
                <p style={{fontSize:24,fontWeight:700,color:'#2563eb'}}>{fp(j.harga)}</p>
                <button onClick={() => router.push('/booking?jadwalId=' + j.id)} style={{marginTop:12,padding:'8px 24px',backgroundColor:'#2563eb',color:'#fff',borderRadius:8,fontWeight:500,border:'none',cursor:'pointer',fontSize:14}}>Pilih & Pesan</button>
              </div>
            </div>
          </div>
        ))}
      </div>}
  </div></Layout>);
}