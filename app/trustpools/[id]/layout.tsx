import BottomNav from "@/components/bottom-nav-trust-pools";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background md:container">
      <div className="pb-16">{children}</div>
      {/* <BottomNav /> */}
    </div>
  );
}
