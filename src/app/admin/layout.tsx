import type { Metadata } from "next";
import { DarkReaderBridge } from "@/components/theme/DarkReaderBridge";

export const metadata: Metadata = {
  title: "Admin",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <DarkReaderBridge />
      {children}
    </div>
  );
}
