'use client';

import { useRouter } from 'next/navigation';
import { clearAuth, getUser } from '@/lib/auth';

export default function TopBar() {
  const router = useRouter();
  const user = getUser();

  function logout() {
    clearAuth();
    router.push('/login');
  }

  return (
    <div className="h-14 bg-white border-b border-slate-100 px-6 flex items-center justify-end gap-4 flex-shrink-0">
      {user && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs">
            {user.full_name?.[0]?.toUpperCase() || 'A'}
          </div>
          <span className="hidden sm:inline">{user.full_name || user.email}</span>
        </div>
      )}
      <button
        onClick={logout}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Sign out
      </button>
    </div>
  );
}
