import { Suspense } from 'react';
import BookingClient from './client';

export default function BookingPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '64px' }}>Loading...</div>}>
      <BookingClient />
    </Suspense>
  );
}
