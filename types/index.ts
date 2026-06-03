export interface RegisterDto {
  username: string;
  nama: string;
  telp: string;
  nik: string;
  alamat: string;
  password: string;
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: any;
  pelanggan: any;
  token: string;
  user: User;
}
// User Types
export interface User {
  email: string;
  id: string;
  noTelepon: string;
  nama: string;
  role: 'admin' | 'pelanggan';
  createdAt: string;
  updatedAt: string;
}
export interface CreateUserDto {
  email: string;
  password: string;
  nama: string;
  role: 'admin' | 'pelanggan';
}
export interface UpdateUserDto {
  email?: string;
  nama?: string;
  role?: 'admin' | 'pelanggan';
}
// Pelanggan Types
export interface Pelanggan {
  nik: string;
  telp: string | undefined;
  username: string;
  id: string;
  userId: string;
  nama: string;
  email: string;
  noTelepon?: string;
  alamat?: string;
  createdAt: string;
  updatedAt: string;
}
export interface UpdatePelangganDto {
  nama?: string;
  email?: string;
  noTelepon?: string;
  alamat?: string;
}
// Kereta Types
export interface Kereta {
  id: string;
  nama: string;
  kode: string;
  tipe: string;
  kapasitas: number;
  gerbongs: Gerbong[];
  createdAt: string;
  updatedAt: string;
}
export interface CreateKeretaDto {
  nama: string;
}
export interface UpdateKeretaDto {
  nama?: string;
}

// Gerbong Types
export interface Gerbong {
  id: string;
  keretaId: string;
  nomor: number;
  tipe: string;
  kapasitas: number;
  kursis: Kursi[];
  createdAt: string;
  updatedAt: string;
}
// Kursi Types
export interface Kursi {
  id: string;
  gerbongId: string;
  nomor: string;
  tipe: string;
  status: 'tersedia' | 'dipesan' | 'terisi';
  harga: number;
  createdAt: string;
  updatedAt: string;
}
// Jadwal Types
export interface Jadwal {
  id: string;
  keretaId: string;
  kereta: Kereta;
  asal: string;
  tujuan: string;
  tanggal: string;
  waktuBerangkat: string;
  waktuTiba: string;
  harga: number;
  status: 'tersedia' | 'penuh' | 'batal';
  createdAt: string;
  updatedAt: string;
}
export interface CreateJadwalDto {
  keretaId: string;
  asal: string;
  tujuan: string;
  tanggalBerangkat: string;
  tanggalTiba: string;
  harga: number;
}
export interface UpdateJadwalDto {
  asal?: string;
  tujuan?: string;
  tanggalBerangkat?: string;
  tanggalTiba?: string;
  harga?: number;
}
export interface SearchJadwalDto {
  asal: string;
  tujuan: string;
  start: string;
  end: string;
}

// Pembelian Types
export interface Pembelian {
  pembelianId: string;
  id: string;
  pelangganId: string;
  jadwalId: string;
  jadwal: Jadwal;
  kursis: Kursi[];
  totalHarga: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  kodeBooking: string;
  createdAt: string;
  updatedAt: string;
}
export interface CreatePembelianDto {
  jadwalId: string;
  kursiIds: string[];
  namaPenumpang: string;
  noTelepon: string;
}
// Payment Types
export interface PaymentInfo {
  id: string;
  pembelianId: string;
  metode: string;
  jumlah: number;
  status: 'pending' | 'paid' | 'failed';
  expiredAt: string;
  paymentUrl?: string;
  createdAt: string;
}
// Tiket Types
export interface Tiket {
  id: string;
  pembelianId: string;
  kodeTiket: string;
  namaPenumpang: string;
  kursi: Kursi;
  jadwal: Jadwal;
  qrCode?: string;
}
export interface ApiResponse<T> {
  pelanggan: any;
  user: any;
  token: any;
  access_token: any;
  success: boolean;
  data: T;
  message?: string;
}