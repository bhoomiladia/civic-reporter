"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";
import {
  Map,
  List,
  PlusCircle,
  Users,
  User,
  Home,
  Clock,
} from "lucide-react";

const iconComponents: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  home: Home,
  map: Map,
  "plus-circle": PlusCircle,
  clock: Clock,
  users: Users,
  user: User,
};

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-30",
        "bg-white/95 backdrop-blur-md",
        "border-t border-gray-200",
        "pb-[env(safe-area-inset-bottom)]",
        "lg:hidden"
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around h-14 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            pathname.startsWith(item.href as string);
          const Icon = iconComponents[item.icon];
          const isReport = item.icon === "plus-circle";

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5",
                "w-16 h-full",
                "transition-colors duration-fast",
                "select-none",
                isReport
                  ? "text-blue-700"
                  : isActive
                  ? "text-blue-700"
                  : "text-gray-400 hover:text-gray-600"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {Icon && (
                <Icon
                  size={isReport ? 26 : 22}
                  className={cn(
                    "transition-transform duration-fast",
                    isActive && "scale-110"
                  )}
                />
              )}
              <span
                className={cn(
                  "text-[10px] leading-none font-medium",
                  isActive ? "text-blue-700" : "text-gray-400"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
