import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'TrainBooking - Pesan Tiket Kereta Api',
  description: 'Sistem pemesanan tiket kereta api',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#fff', color: '#363636', borderRadius: '12px', padding: '16px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}} />
        {children}
      </body>
    </html>
  )
}