import DashboardNavbar from "@/components/Dashboard";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between">
      <Sidebar />  {/* Your sidebar component */}   {/* Top navbar */}
        <main className="grid w-full h-full pl-[300px]">
          <Header />
          {children}  {/* Dashboard pages render here */}
        </main>  {/* Optional footer */}
    </div>
  );
}