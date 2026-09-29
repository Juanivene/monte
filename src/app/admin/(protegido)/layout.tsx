import { Toaster } from "sonner";
import { getSession } from "@/lib/session";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div>
      {/* En mobile los toasts salen arriba de la barra de pestañas, no tapados por ella. */}
      <Toaster
        position="bottom-right"
        richColors
        closeButton
        mobileOffset={{ bottom: "calc(env(safe-area-inset-bottom) + 76px)" }}
      />
      <AdminNav email={session?.email} />
      <main className="mx-auto max-w-6xl px-4 pt-5 pb-[calc(env(safe-area-inset-bottom)+6.5rem)] sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
