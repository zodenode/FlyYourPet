"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Plane,
  HandHeart,
  PawPrint,
  ArrowLeft,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/documents", label: "Documents", icon: FileText },
  { href: "/admin/relocations", label: "Relocations", icon: PawPrint },
  { href: "/admin/flights", label: "Flights", icon: Plane },
  { href: "/admin/volunteers", label: "Volunteers", icon: HandHeart },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-slate-900 text-white shrink-0">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-2 font-bold text-lg">
            <span className="text-xl">{"\u{1F43E}"}</span>
            <span>
              FlyMy<span className="text-sky-400">.Pet</span>
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-slate-800 text-white font-medium"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-700">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-500 text-sm hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Website
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between lg:justify-end shrink-0">
          <div className="lg:hidden flex items-center gap-2 font-bold text-slate-900">
            <span>{"\u{1F43E}"}</span> Admin
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">Admin</span>
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
              A
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
