import { AdminTopbar } from '@/components/layout/admin-topbar';
import { AdminSubnav } from '@/components/layout/admin-subnav';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AdminTopbar />
      <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto space-y-6">
        <AdminSubnav />
        {children}
      </main>
    </div>
  );
}
