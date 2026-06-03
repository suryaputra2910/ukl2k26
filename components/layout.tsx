'use client';
import { Calendar, Home, LogOut, Menu, Ticket, Train, User, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { initializeAuth, useAuthStore } from '../stores/authStore';
export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, logout, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    initializeAuth();
    setMounted(true);
  }, []);
  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }
  const navigation = user?.role === 'admin'
    ? [
        { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
        { name: 'Kereta', href: '/admin/kereta', icon: Train },
        { name: 'Jadwal', href: '/admin/jadwal', icon: Calendar },
        { name: 'Users', href: '/admin/useradmin', icon: User },
      ]
    : [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Cari Tiket', href: '/search', icon: Ticket },
        { name: 'Pesanan', href: '/mybookings', icon: Calendar },
        { name: 'Profil', href: '/profile', icon: User },
      ];
  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                  <Train className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">TrainBooking</span>
              </Link>
            </div>
            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href) ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated && user ? (
                <>
                  <div className="flex items-center space-x-3 px-3 py-2 bg-gray-100 rounded-lg">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {user.nama.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">{user.nama}</p>
                      <p className="text-gray-500 capitalize text-xs">{user.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/auth/login" className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">Login</Link>
                  <Link href="/auth/register" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Register</Link>
                </div>
              )}
            </div>
            <div className="md:hidden flex items-center">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-lg text-gray-600 hover:bg-gray-100">
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium ${
                    isActive(item.href) ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
              {isAuthenticated ? (
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="flex items-center space-x-3 w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">Login</Link>
                  <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg text-center">Register</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Train className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-gray-600">© 2026 TrainBooking</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
