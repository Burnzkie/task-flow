import { getProjects }  from "@/app/actions/projects";
import Sidebar          from "@/components/sidebar";
import ToastContainer   from "@/components/toast";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const projects = await getProjects();

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <Sidebar initialProjects={projects} />
      <main className="flex-1 overflow-hidden">{children}</main>
      <ToastContainer />
    </div>
  );
}