import { auth } from '@/lib/auth/config';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { AdminTopbar } from '@/components/layout/admin-topbar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen flex bg-background">
      {session ? (
        <>
          <AdminSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <AdminTopbar />
            <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto">
              {children}
            </main>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      )}
    </div>
  );
}
