"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Home,
  Map,
  MapPin,
  Users,
  Clock,
  User,
  Shield,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { useAuth } from "@/contexts/auth-context";

const sidebarItems = [
  { id: "home", label: "Home", href: "/", icon: Home },
  { id: "map", label: "Explore Map", href: "/map", icon: Map },
  { id: "report", label: "Report", href: "/report", icon: MapPin },
  { id: "issues", label: "Track", href: "/issues", icon: Clock },
  { id: "community", label: "Community", href: "/community", icon: Users },
  { id: "profile", label: "Profile", href: "/profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { user } = useAuth();

  const items = [
    ...sidebarItems,
    ...(user?.role === 'admin' ? [{ id: "admin", label: "Admin", href: "/admin", icon: Shield }] : [])
  ];

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col items-center justify-between",
        "w-[80px] h-[calc(100vh-3rem)] max-h-[580px]",
        "bg-white/75 backdrop-blur-xl border border-white/20",
        "fixed left-6 top-1/2 -translate-y-1/2 z-30",
        "rounded-[28px] shadow-[0_12px_40px_-12px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.02)] py-5"
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo Section */}
      <Link href="/" className="group flex items-center justify-center p-2 mb-2">
        <Logo size={42} className="transition-transform duration-300 group-hover:scale-105" />
      </Link>

      {/* Navigation Icons Dock */}
      <nav className="flex-1 flex flex-col items-center justify-center gap-2 w-full px-2">
        {items.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <div
              key={item.id}
              className="relative group flex items-center justify-center"
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <Link
                href={item.href}
                className={cn(
                  "relative w-12 h-12 rounded-2xl flex items-center justify-center",
                  "transition-all duration-300",
                  isActive
                    ? "bg-slate-50 shadow-[0_4px_12px_rgba(0,0,0,0.03)]"
                    : "hover:bg-slate-50/50"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {/* Active Indicators */}
                {isActive && (
                  <>
                    {/* Active Glow background */}
                    <motion.div
                      layoutId="sidebarActiveGlow"
                      className="absolute inset-0 rounded-2xl bg-blue-50/30 -z-10 shadow-[0_0_20px_rgba(37,99,235,0.08)]"
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                    {/* Active vertical line on left */}
                    <motion.div
                      layoutId="sidebarActiveLine"
                      className="absolute left-1.5 top-3.5 bottom-3.5 w-[3px] rounded-full bg-blue-600"
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    />
                  </>
                )}

                <motion.div
                  animate={{
                    scale: isActive ? 1.08 : hoveredId === item.id ? 1.05 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="flex items-center justify-center"
                >
                  <Icon
                    size={20}
                    className={cn(
                      "transition-colors duration-300",
                      isActive
                        ? "text-blue-600 stroke-[2.2px]"
                        : "text-slate-500 group-hover:text-slate-900 stroke-[1.8px]"
                    )}
                  />
                </motion.div>
              </Link>

              {/* Tooltip */}
              <AnimatePresence>
                {hoveredId === item.id && (
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute left-16 bg-slate-900 text-white text-[11px] font-medium px-3 py-1.5 rounded-lg shadow-md pointer-events-none whitespace-nowrap z-55"
                  >
                    {item.label}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* Footer Info / Placeholder spacing */}
      <div className="mt-2 text-center">
        <span className="text-[9px] text-slate-300 font-semibold tracking-wider">CR</span>
      </div>
    </aside>
  );
}
