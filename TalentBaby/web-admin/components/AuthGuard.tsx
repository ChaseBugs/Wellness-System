'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isLoggedIn } from '@/lib/auth';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const redirecting = useRef(false);

  useEffect(() => {
    if (isLoggedIn()) {
      setChecked(true);
      return;
    }

    if (!redirecting.current) {
      redirecting.current = true;
      router.replace('/login');
    }
  }, [router]);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-400 text-sm">Loading...</div>
      </div>
    );
  }
  return <>{children}</>;
}
