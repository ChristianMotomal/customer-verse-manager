
import { ReactNode } from "react";
import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 md:ml-64 overflow-hidden">
        <main className="p-4 md:p-6 max-w-7xl mx-auto overflow-x-hidden">
          <div className="w-full max-w-full overflow-hidden">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
