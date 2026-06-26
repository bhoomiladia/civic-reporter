"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { MapPin, AlertCircle, Droplets, Lightbulb, Wrench, CheckCircle2, Clock } from "lucide-react";

/* ------------------------------------------------------------------
   Types
   ------------------------------------------------------------------ */
interface CityPin {
  id: string;
  x: number; // percentage
  y: number; // percentage
  label: string;
  category: string;
  status: "reported" | "in_progress" | "resolved";
  color: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  address: string;
  time: string;
}

/* ------------------------------------------------------------------
   Data – pre-positioned pins for the city scene
   ------------------------------------------------------------------ */
const CITY_PINS: CityPin[] = [
  { id: "p1", x: 28, y: 38, label: "Pothole on Main St", category: "Pothole", status: "in_progress", color: "#dc2626", icon: AlertCircle, address: "142 Main Street", time: "2h ago" },
  { id: "p2", x: 62, y: 24, label: "Broken street light", category: "Street Light", status: "reported", color: "#d97706", icon: Lightbulb, address: "78 Elm Avenue", time: "5h ago" },
  { id: "p3", x: 45, y: 65, label: "Water leak near park", category: "Water Leak", status: "in_progress", color: "#2563eb", icon: Droplets, address: "Central Park North", time: "1d ago" },
  { id: "p4", x: 78, y: 52, label: "Sidewalk repair", category: "Sidewalk", status: "resolved", color: "#16a34a", icon: Wrench, address: "230 Washington Blvd", time: "3d ago" },
  { id: "p5", x: 18, y: 62, label: "Fallen tree branch", category: "Park", status: "reported", color: "#15803d", icon: AlertCircle, address: "Lincoln Park", time: "4h ago" },
  { id: "p6", x: 72, y: 78, label: "Noise complaint", category: "Noise", status: "reported", color: "#ea580c", icon: AlertCircle, address: "450 Cedar Lane", time: "8h ago" },
];

/* ------------------------------------------------------------------
   Floating card data – simulated live operations
   ------------------------------------------------------------------ */
interface FloatingCard {
  id: string;
  title: string;
  subtitle: string;
  status: "in_progress" | "resolved" | "reported";
  x: number;
  y: number;
  delay: number;
}

const FLOATING_CARDS: FloatingCard[] = [
  { id: "fc1", title: "Crew dispatched", subtitle: "Main St pothole", status: "in_progress", x: 5, y: 8, delay: 0 },
  { id: "fc2", title: "Resolved", subtitle: "Sidewalk repair", status: "resolved", x: 58, y: 72, delay: 1.5 },
];

/* ------------------------------------------------------------------
   Status badge micro-component
   ------------------------------------------------------------------ */
function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    reported: "bg-blue-500",
    in_progress: "bg-amber-500",
    resolved: "bg-green-500",
  };
  return (
    <span className="relative flex h-2 w-2">
      <span className={cn("absolute inline-flex h-full w-full rounded-full opacity-40 animate-ping", colors[status])} />
      <span className={cn("relative inline-flex rounded-full h-2 w-2", colors[status])} />
    </span>
  );
}

/* ------------------------------------------------------------------
   Main component
   ------------------------------------------------------------------ */
export function HeroCityMap({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredPin, setHoveredPin] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  /* Mouse tracking for parallax */
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  /* Spring-smoothed values */
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  /* Parallax transforms (subtle, layered) */
  const bgX = useTransform(smoothX, [0, 1], [6, -6]);
  const bgY = useTransform(smoothY, [0, 1], [4, -4]);
  const midX = useTransform(smoothX, [0, 1], [10, -10]);
  const midY = useTransform(smoothY, [0, 1], [8, -8]);
  const fgX = useTransform(smoothX, [0, 1], [16, -16]);
  const fgY = useTransform(smoothY, [0, 1], [12, -12]);

  useEffect(() => {
    setMounted(true);
    setPrefersReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (prefersReducedMotion) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouseX.set((e.clientX - rect.left) / rect.width);
      mouseY.set((e.clientY - rect.top) / rect.height);
    },
    [mouseX, mouseY, prefersReducedMotion]
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  }, [mouseX, mouseY]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-full overflow-hidden rounded-2xl",
        "bg-[#f0ece4]",
        "cursor-default select-none",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      role="img"
      aria-label="Interactive city map showing civic issues being reported and resolved in real time"
    >
      {/* === LAYER 0: Background terrain === */}
      <motion.div
        className="absolute inset-[-20px]"
        style={!prefersReducedMotion ? { x: bgX, y: bgY } : undefined}
      >
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            {/* Minor grid */}
            <pattern id="hero-grid-sm" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#e4e0d8" strokeWidth="0.5" />
            </pattern>
            {/* Major grid */}
            <pattern id="hero-grid-lg" width="128" height="128" patternUnits="userSpaceOnUse">
              <path d="M 128 0 L 0 0 0 128" fill="none" stroke="#ddd9d0" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid-sm)" />
          <rect width="100%" height="100%" fill="url(#hero-grid-lg)" />
        </svg>
      </motion.div>

      {/* === LAYER 1: Roads and terrain features === */}
      <motion.div
        className="absolute inset-[-20px]"
        style={!prefersReducedMotion ? { x: midX, y: midY } : undefined}
      >
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          {/* Main roads */}
          <line x1="0%" y1="32%" x2="100%" y2="30%" stroke="#fff" strokeWidth="10" opacity="0.8" strokeLinecap="round" />
          <line x1="0%" y1="62%" x2="100%" y2="64%" stroke="#fff" strokeWidth="8" opacity="0.7" strokeLinecap="round" />
          <line x1="38%" y1="0%" x2="40%" y2="100%" stroke="#fff" strokeWidth="10" opacity="0.8" strokeLinecap="round" />
          <line x1="72%" y1="0%" x2="74%" y2="100%" stroke="#fff" strokeWidth="7" opacity="0.65" strokeLinecap="round" />

          {/* Secondary roads */}
          <line x1="0%" y1="48%" x2="40%" y2="47%" stroke="#fff" strokeWidth="4" opacity="0.5" strokeLinecap="round" />
          <line x1="55%" y1="0%" x2="54%" y2="40%" stroke="#fff" strokeWidth="4" opacity="0.5" strokeLinecap="round" />
          <line x1="40%" y1="80%" x2="100%" y2="82%" stroke="#fff" strokeWidth="5" opacity="0.5" strokeLinecap="round" />
          <line x1="15%" y1="0%" x2="16%" y2="50%" stroke="#fff" strokeWidth="3" opacity="0.4" strokeLinecap="round" />
          <line x1="85%" y1="30%" x2="86%" y2="100%" stroke="#fff" strokeWidth="3" opacity="0.4" strokeLinecap="round" />

          {/* Parks */}
          <rect x="56%" y="12%" width="14%" height="16%" rx="10" fill="#dce8d4" opacity="0.7" />
          <rect x="4%" y="50%" width="10%" height="14%" rx="8" fill="#dce8d4" opacity="0.6" />
          <circle cx="80%" cy="42%" r="4%" fill="#dce8d4" opacity="0.5" />

          {/* Water */}
          <ellipse cx="88%" cy="88%" rx="14%" ry="10%" fill="#cddce8" opacity="0.4" />
          <ellipse cx="5%" cy="85%" rx="8%" ry="6%" fill="#cddce8" opacity="0.3" />

          {/* Building blocks (subtle rectangles) */}
          <rect x="42%" y="34%" width="8%" height="10%" rx="3" fill="#e8e4dd" opacity="0.5" />
          <rect x="20%" y="18%" width="12%" height="8%" rx="3" fill="#e8e4dd" opacity="0.5" />
          <rect x="60%" y="50%" width="10%" height="12%" rx="3" fill="#e8e4dd" opacity="0.4" />
          <rect x="8%" y="32%" width="6%" height="6%" rx="2" fill="#e8e4dd" opacity="0.4" />
          <rect x="76%" y="16%" width="8%" height="6%" rx="2" fill="#e8e4dd" opacity="0.4" />
          <rect x="44%" y="72%" width="14%" height="8%" rx="3" fill="#e8e4dd" opacity="0.4" />
          <rect x="24%" y="68%" width="6%" height="8%" rx="2" fill="#e8e4dd" opacity="0.35" />
        </svg>

        {/* Neighborhood labels */}
        <div className="absolute top-[20%] left-[22%] text-[9px] sm:text-[10px] tracking-[0.15em] uppercase text-gray-400/50 font-medium pointer-events-none">
          Downtown
        </div>
        <div className="absolute top-[44%] left-[55%] text-[9px] sm:text-[10px] tracking-[0.15em] uppercase text-gray-400/50 font-medium pointer-events-none">
          Midtown
        </div>
        <div className="absolute top-[70%] left-[20%] text-[9px] sm:text-[10px] tracking-[0.15em] uppercase text-gray-400/50 font-medium pointer-events-none">
          West End
        </div>
        <div className="absolute top-[10%] left-[58%] text-[8px] sm:text-[9px] tracking-[0.12em] uppercase text-green-700/25 font-medium pointer-events-none">
          Park District
        </div>
        <div className="absolute top-[78%] left-[68%] text-[8px] sm:text-[9px] tracking-[0.12em] uppercase text-gray-400/40 font-medium pointer-events-none">
          Harbor
        </div>
      </motion.div>

      {/* === LAYER 2: Animated route line === */}
      {mounted && !prefersReducedMotion && (
        <motion.div
          className="absolute inset-[-20px]"
          style={{ x: midX, y: midY }}
        >
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <motion.path
              d="M 28% 38% Q 35% 35%, 40% 32% Q 48% 28%, 55% 28% Q 58% 28%, 62% 24%"
              fill="none"
              stroke="#2563eb"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="4 6"
              opacity="0.35"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 3, ease: "easeInOut", delay: 1 }}
            />
          </svg>
        </motion.div>
      )}

      {/* === LAYER 3: Issue pins (foreground parallax) === */}
      <motion.div
        className="absolute inset-[-20px]"
        style={!prefersReducedMotion ? { x: fgX, y: fgY } : undefined}
      >
        {CITY_PINS.map((pin, i) => {
          const Icon = pin.icon;
          const isHovered = hoveredPin === pin.id;

          return (
            <motion.div
              key={pin.id}
              className="absolute"
              style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
              initial={mounted ? { scale: 0, opacity: 0, y: 10 } : { scale: 1, opacity: 1, y: 0 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.3 + i * 0.15,
              }}
            >
              {/* Pulse ring */}
              {pin.status !== "resolved" && !prefersReducedMotion && (
                <motion.div
                  className="absolute rounded-full -translate-x-1/2 -translate-y-1/2"
                  style={{
                    width: 32,
                    height: 32,
                    left: "50%",
                    top: "50%",
                    backgroundColor: pin.color,
                  }}
                  animate={{ scale: [1, 2.2], opacity: [0.25, 0] }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    repeatDelay: 1 + i * 0.5,
                    ease: "easeOut",
                  }}
                />
              )}

              {/* Pin body */}
              <motion.button
                className={cn(
                  "relative flex items-center justify-center",
                  "w-8 h-8 -ml-4 -mt-4 rounded-full",
                  "shadow-md border-[2.5px] border-white",
                  "cursor-pointer z-10",
                  "transition-shadow duration-200",
                  isHovered && "shadow-lg z-20"
                )}
                style={{ backgroundColor: pin.color }}
                onMouseEnter={() => setHoveredPin(pin.id)}
                onMouseLeave={() => setHoveredPin(null)}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                aria-label={pin.label}
              >
                <Icon size={14} className="text-white" />
              </motion.button>

              {/* Tooltip */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    className={cn(
                      "absolute z-30 pointer-events-none",
                      "bg-white rounded-xl shadow-xl border border-gray-200/80",
                      "px-3.5 py-2.5 whitespace-nowrap",
                      "-translate-x-1/2 left-0 bottom-full mb-3"
                    )}
                    initial={{ opacity: 0, y: 4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <StatusDot status={pin.status} />
                      <span className="text-[13px] font-semibold text-gray-900">{pin.label}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-gray-400">
                      <span>{pin.address}</span>
                      <span>·</span>
                      <span>{pin.time}</span>
                    </div>
                    {/* Tooltip arrow */}
                    <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-white border-b border-r border-gray-200/80 rotate-45" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>

      {/* === LAYER 4: Floating operations cards === */}
      {mounted && (
        <motion.div
          className="absolute inset-0"
          style={!prefersReducedMotion ? { x: fgX, y: fgY } : undefined}
        >
          {FLOATING_CARDS.map((card) => (
            <motion.div
              key={card.id}
              className="absolute hidden sm:block"
              style={{ left: `${card.x}%`, top: `${card.y}%` }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 1.2 + card.delay,
                ease: "easeOut",
              }}
            >
              <div className={cn(
                "bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/60",
                "px-3 py-2 flex items-center gap-2.5",
                "pointer-events-none"
              )}>
                <div className={cn(
                  "w-6 h-6 rounded-md flex items-center justify-center shrink-0",
                  card.status === "resolved" ? "bg-green-50 text-green-600" :
                  card.status === "in_progress" ? "bg-amber-50 text-amber-600" :
                  "bg-blue-50 text-blue-600"
                )}>
                  {card.status === "resolved" ? <CheckCircle2 size={14} /> :
                   card.status === "in_progress" ? <Clock size={14} /> :
                   <MapPin size={14} />}
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-gray-900 leading-tight">{card.title}</div>
                  <div className="text-[10px] text-gray-400 leading-tight">{card.subtitle}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* === Subtle vignette overlay === */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 50%, rgba(240,236,228,0.6) 100%)",
        }}
        aria-hidden="true"
      />
    </div>
  );
}
