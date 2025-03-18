import Strings from "@/utils/strings";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex">
      <aside className="w-64 h-screen bg-gray-200 p-4">
        <h2 className="text-xl font-semibold">{Strings.dashboardMenu}</h2>
        <ul>
          <li><a href="/dashboard">{Strings.home}</a></li>
          <li><a href="/dashboard/settings">{Strings.settings}</a></li>
        </ul>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}