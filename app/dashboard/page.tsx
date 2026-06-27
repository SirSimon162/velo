import { DashboardApp } from "@/components/dashboard/DashboardApp";
import { VeloStorageProvider } from "@/lib/velo-storage";

export const metadata = {
  title: "Dashboard — Velo",
  description: "Track routines, sets, reps and weights locally",
};

export default function DashboardPage() {
  return (
    <VeloStorageProvider>
      <DashboardApp />
    </VeloStorageProvider>
  );
}
