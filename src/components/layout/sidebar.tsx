"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, APP_NAME } from "@/lib/constants";
import {
  Map,
  List,
  PlusCircle,
  Users,
  User,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";

const iconComponents: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  map: Map,
  list: List,
  "plus-circle": PlusCircle,
  users: Users,
  user: User,
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col",
        "w-[220px] h-screen",
        "bg-white border-r border-gray-200",
        "fixed left-0 top-0 z-30"
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-gray-100">
        <Logo size={42} />
        <span className="font-semibold text-gray-900 text-[15px] tracking-tight">
          {APP_NAME}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-3">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(item.href as string);
            const Icon = iconComponents[item.icon];

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 h-10 rounded-lg",
                    "text-small font-medium",
                    "transition-all duration-fast ease-out",
                    "group",
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {Icon && (
                    <Icon
                      size={18}
                      className={cn(
                        "transition-colors",
                        isActive
                          ? "text-blue-700"
                          : "text-gray-400 group-hover:text-gray-600"
                      )}
                    />
                  )}
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-gray-100">
        <p className="text-[11px] text-gray-400 leading-relaxed">
          Making communities better,
          <br />
          one report at a time.
        </p>
      </div>
    </aside>
  );
}
