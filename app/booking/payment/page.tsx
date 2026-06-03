import { Suspense } from 'react';
import PaymentClient from './PaymentClient';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PaymentClient />
    </Suspense>
  );
}