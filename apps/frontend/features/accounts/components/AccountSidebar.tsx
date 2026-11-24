"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Package, Settings, LogOut } from "lucide-react";
import { useLogout } from "../../auth/hooks/auth.hooks";
import { toast } from "sonner";

const navigation = [
  { name: "Dashboard", href: "/account", icon: User },
  { name: "Orders", href: "/account/orders", icon: Package },
  { name: "Settings", href: "/account/settings", icon: Settings },
];

export default function AccountSidebar() {
  const pathname = usePathname();

  const { mutateAsync: logout, isPending: isLoggingOut } = useLogout();

  const handleLogout = async () => {
    try {
      const res = await logout();
      toast.success(res.message);
      window.location.replace("/");
    } catch {
      toast.error("Failed to log out");
    }
  };

  return (
    <aside className="w-full md:w-64 shrink-0">
      <nav className="flex flex-col space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-black text-white"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-black"
              }`}
            >
              <item.icon className="size-5" />
              {item.name}
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogOut className="size-5" />
          {isLoggingOut ? "Logging out..." : "Logout"}
        </button>
      </nav>
    </aside>
  );
}
