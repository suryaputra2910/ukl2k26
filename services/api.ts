import axios from 'axios';
import type {
  RegisterDto, LoginDto, AuthResponse, User, CreateUserDto, UpdateUserDto,
  Pelanggan, UpdatePelangganDto, Kereta, CreateKeretaDto, UpdateKeretaDto,
  Gerbong, Kursi, Jadwal, CreateJadwalDto, UpdateJadwalDto, SearchJadwalDto,
  Pembelian, CreatePembelianDto, PaymentInfo, Tiket, ApiResponse,
} from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'https://keretaapi-production.up.railway.app';

class ApiService {
      getKereta(id: string) {
            throw new Error('Method not implemented.');
      }
  private api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
  });

  constructor() {
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
           window.location.href = '/auth/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async register(data: RegisterDto) {
    const r = await this.api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return r.data;
  }
  async login(data: LoginDto) {
    const r = await this.api.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return r.data;
  }
  async getUsers() {
    const r = await this.api.get<ApiResponse<User[]>>('/users');
    return r.data;
  }
  async createUser(data: CreateUserDto) {
    const r = await this.api.post<ApiResponse<User>>('/users', data);
    return r.data;
  }
  async updateUser(id: string, data: UpdateUserDto) {
    const r = await this.api.patch<ApiResponse<User>>(`/users/${id}`, data);
    return r.data;
  }
  async deleteUser(id: string) {
    const r = await this.api.delete<ApiResponse<void>>(`/users/${id}`);
    return r.data;
  }
  async getMyPelanggan(): Promise<any> {
    const response = await this.api.get('/pelanggan/me');
    return response.data;
  }
  async updateMyPelanggan(data: UpdatePelangganDto): Promise<any> {
    const response = await this.api.patch('/pelanggan/me', data);
    return response.data;
  }
  async getKeretas() {
    const r = await this.api.get<ApiResponse<Kereta[]>>('/kereta');
    return r.data;
  }
  async createKereta(data: CreateKeretaDto) {
    const r = await this.api.post<ApiResponse<Kereta>>('/kereta', data);
    return r.data;
  }
  async updateKereta(id: string, data: UpdateKeretaDto) {
    const r = await this.api.patch<ApiResponse<Kereta>>(`/kereta/${id}`, data);
    return r.data;
  }
  async deleteKereta(id: string) {
    const r = await this.api.delete<ApiResponse<void>>(`/kereta/${id}`);
    return r.data;
  }
  async getKursiByGerbong(gerbongId: string) {
    const r = await this.api.get<ApiResponse<Kursi[]>>(`/kereta/kursi/${gerbongId}`);
    return r.data;
  }
  async getJadwals() {
    const r = await this.api.get<ApiResponse<Jadwal[]>>('/jadwal');
    return r.data;
  }
  async searchJadwal(params: SearchJadwalDto) {
    const r = await this.api.get<ApiResponse<Jadwal[]>>('/jadwal/search', { params });
    return r.data;
  }
  async getJadwal(id: string) {
    const r = await this.api.get<ApiResponse<Jadwal>>(`/jadwal/${id}`);
    return r.data;
  }
  async createJadwal(data: CreateJadwalDto) {
    const r = await this.api.post<ApiResponse<Jadwal>>('/jadwal', data);
    return r.data;
  }
  async updateJadwal(id: string, data: UpdateJadwalDto) {
    const r = await this.api.patch<ApiResponse<Jadwal>>(`/jadwal/${id}`, data);
    return r.data;
  }
  async deleteJadwal(id: string) {
    const r = await this.api.delete<ApiResponse<void>>(`/jadwal/${id}`);
    return r.data;
  }
    async getPembelians(): Promise<any> {
    // Cek role dari localStorage
    let role = 'pelanggan';
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const u = JSON.parse(userStr);
        role = (u.role || 'pelanggan').toLowerCase();
      }
    } catch {}
    if (role === 'admin') {
      const response = await this.api.get('/pembelian');
      return response.data;
    }
    // Pelanggan: langsung ke /pembelian/me
    try {
      const response = await this.api.get('/pembelian/me');
      return response.data;
    } catch (err: any) {
      // 404 = belum ada pembelian — return kosong (BUKAN error)
      if (err.response?.status === 404) {
        return [];
      }
      throw err;
    }
  }
  async getPembelian(id: string) {
    const r = await this.api.get<ApiResponse<Pembelian>>(`/pembelian/${id}`);
    return r.data;
  }
  async createPembelian(data: CreatePembelianDto) {
    const r = await this.api.post<ApiResponse<Pembelian>>('/pembelian', data);
    return r.data;
  }
  async getTiket(pembelianId: string) {
    const r = await this.api.get<ApiResponse<Tiket[]>>(`/pembelian/${pembelianId}/tiket`);
    return r.data;
  }
  async getPayment(pembelianId: string) {
    const r = await this.api.get<ApiResponse<PaymentInfo>>(`/payment/${pembelianId}`);
    return r.data;
  }
  async confirmPayment(pembelianId: string) {
    const r = await this.api.post<ApiResponse<PaymentInfo>>(`/payment/${pembelianId}/confirm`);
    return r.data;
  }
}

export const apiService = new ApiService();
export default apiService;