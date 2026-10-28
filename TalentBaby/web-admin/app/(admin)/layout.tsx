import AuthGuard from '@/components/AuthGuard';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import ToastContainer from '@/components/Toast';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-auto">
          <TopBar />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
      <ToastContainer />
    </AuthGuard>
  );
}
