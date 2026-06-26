"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StorytellingMap } from "./storytelling-map";
import { ArrowRight, Shield } from "lucide-react";

const SCENES = [
  {
    id: 1,
    title: "Every city has a heartbeat.",
    description: "Beneath the surface of every neighborhood lies a complex web of infrastructure, waiting to be maintained.",
    badge: "Scene 01 — The City"
  },
  {
    id: 2,
    title: "Until something breaks.",
    description: "A single pothole forms on Main Street. If ignored, a small hazard grows into a costly community disruption.",
    badge: "Scene 02 — The Problem"
  },
  {
    id: 3,
    title: "Someone decided not to ignore it.",
    description: "A citizen pauses, captures a photo, and routes it directly to the city database.",
    badge: "Scene 03 — The Citizen"
  },
  {
    id: 4,
    title: "One report becomes many voices.",
    description: "Neighbors verify the hazard directly on the map, building local verification and trust.",
    badge: "Scene 04 — The Community"
  },
  {
    id: 5,
    title: "The city starts listening.",
    description: "The report is accepted by the local department and scheduled for immediate dispatch.",
    badge: "Scene 05 — The Authority"
  },
  {
    id: 6,
    title: "Change begins with action.",
    description: "Crews arrive at the scene. The road is repaired, making the neighborhood safe again.",
    badge: "Scene 06 — The Repair"
  },
  {
    id: 7,
    title: "A better city starts with one report.",
    description: "Dozens of issues resolved. Better neighborhoods built by citizens caring for their streets.",
    badge: "Scene 07 — The Impact"
  },
  {
    id: 8,
    title: "Every better city starts with one report.",
    description: "Take the first step. Start mapping your neighborhood's path to resolution today.",
    badge: "Scene 08 — The Future"
  }
];

export function ScrollStory() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track scroll position of the entire container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Smooth out the scroll value to prevent jumps and snap-feeling transitions
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 85,
    damping: 24,
    restDelta: 0.001
  });

  // Solid white overlay that fades out to reveal the map in Scene 2
  const introBgOpacity = useTransform(smoothProgress, [0.11, 0.18], [1, 0]);
  const introBgPointerEvents = useTransform(smoothProgress, (v) => v >= 0.18 ? "none" : "auto");

  // Cinematic autohide navbar transforms - slides out and fades out as soon as scroll starts
  const headerY = useTransform(smoothProgress, [0, 0.015], [0, -70]);
  const headerOpacity = useTransform(smoothProgress, [0, 0.015], [1, 0]);

  return (
    <div ref={containerRef} className="relative w-full min-h-[800vh] bg-white">
      {/* Cinematic Autohiding Navbar Header */}
      <motion.header
        style={{ y: headerY, opacity: headerOpacity }}
        className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100"
      >
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8 h-[60px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-blue-900 flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
              <Shield size={15} className="text-white" />
            </div>
            <span className="font-semibold text-gray-900 text-[15px] tracking-[-0.02em]">
              CIVC Reporter
            </span>
          </Link>
          <nav className="hidden sm:flex items-center gap-1">
            <Link href="/map" className="px-3 py-1.5 text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors rounded-md hover:bg-gray-50">
              Map
            </Link>
            <Link href="/issues" className="px-3 py-1.5 text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors rounded-md hover:bg-gray-50">
              Issues
            </Link>
            <Link href="/community" className="px-3 py-1.5 text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors rounded-md hover:bg-gray-50">
              Community
            </Link>
          </nav>
          <div className="flex items-center gap-2.5">
            <Link href="/map" className="hidden sm:block">
              <Button variant="ghost" size="sm">
                Open Map
              </Button>
            </Link>
            <Link href="/report">
              <Button size="sm">
                Report Issue
              </Button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Sticky container that locks the viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#fafafa]">
        
        {/* Full-screen Vector City Map Canvas */}
        <div className="absolute inset-0 w-full h-full z-10">
          <StorytellingMap progress={smoothProgress} />
        </div>

        {/* Scene 1 Solid White Intro Mask Cover */}
        <motion.div
          style={{
            opacity: introBgOpacity,
            pointerEvents: introBgPointerEvents as any
          }}
          className="absolute inset-0 bg-white z-15"
        />

        {/* ────────────────── TYPOGRAPHY LAYERING OVERLAY ────────────────── */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          {SCENES.map((scene, idx) => {
            const start = idx / SCENES.length;
            const end = (idx + 1) / SCENES.length;
            
            const isIntro = scene.id === 1;
            const isOutro = scene.id === SCENES.length;

            return (
              <SceneText
                key={scene.id}
                title={scene.title}
                description={scene.description}
                badge={scene.badge}
                id={scene.id}
                progress={smoothProgress}
                start={start}
                end={end}
                isIntro={isIntro}
                isOutro={isOutro}
              />
            );
          })}
        </div>

        {/* Minimal scroll indicator helper in bottom left corner */}
        <div className="absolute bottom-6 right-6 z-25 flex items-center gap-2.5 text-xs text-gray-400 font-medium pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-900 animate-pulse" />
          <span>Scroll to progress the story</span>
        </div>
      </div>
    </div>
  );
}

interface SceneTextProps {
  title: string;
  description: string;
  badge: string;
  id: number;
  progress: any;
  start: number;
  end: number;
  isIntro: boolean;
  isOutro: boolean;
}

function SceneText({ title, description, badge, id, progress, start, end, isIntro, isOutro }: SceneTextProps) {
  // Coordinated fade-in, display, fade-out with clear gaps to prevent overlaps
  const opacity = useTransform(
    progress,
    isIntro 
      ? [0, 0.08, 0.105] 
      : isOutro 
        ? [start + 0.02, start + 0.05, 1.0] 
        : [start + 0.02, start + 0.05, end - 0.05, end - 0.02],
    isIntro
      ? [1, 1, 0]
      : isOutro
        ? [0, 1, 1]
        : [0, 1, 1, 0]
  );

  const y = useTransform(
    progress,
    isIntro 
      ? [0, 0.08, 0.105] 
      : isOutro 
        ? [start + 0.02, start + 0.05, 1.0] 
        : [start + 0.02, start + 0.05, end - 0.05, end - 0.02],
    isIntro
      ? [0, 0, -30]
      : isOutro
        ? [30, 0, 0]
        : [20, 0, 0, -20]
  );

  const pointerEvents = useTransform(
    progress,
    (v: number) => (v >= start && v < end) ? "auto" : "none"
  );

  const isDimmed = id === 3 || id === 4 || id === 8;

  // Layout container classes: Center for Intro/Outro, Left Bottom alignment for intermediate stages
  if (isIntro || isOutro) {
    return (
      <motion.div
        style={{
          opacity,
          y,
          pointerEvents: pointerEvents as any,
        }}
        className="absolute inset-x-6 sm:inset-x-12 md:inset-x-16 top-1/2 -translate-y-1/2 text-center max-w-4xl mx-auto flex flex-col items-center justify-center pointer-events-auto"
      >
        <h1 className={`text-cinematic-hero leading-[0.95] mb-6 font-serif max-w-3xl ${isDimmed ? "text-white" : "text-gray-900"}`}>
          {title}
        </h1>
        <p className={`text-base sm:text-lg font-sans leading-relaxed max-w-[420px] mb-8 ${isDimmed ? "text-gray-200" : "text-gray-500"}`}>
          {description}
        </p>
        {isOutro && (
          <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/map">
              <Button size="lg" className="shadow-lg bg-blue-900 hover:bg-blue-950 font-medium px-8 h-12 flex items-center gap-2 rounded-xl transition-all duration-300">
                Open Live Map
                <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/report">
              <Button size="lg" className="font-medium px-8 h-12 rounded-xl border border-slate-200 bg-white text-black hover:bg-slate-50 hover:text-black shadow-xs transition-all duration-300">
                File a Report
              </Button>
            </Link>
          </motion.div>
        )}
      </motion.div>
    );
  }

  // Intermediate Narrative Scenes: Positioned in the bottom-left corner.
  // Shifted upwards during Scene 7 (id === 7) to avoid overlapping the statistics overlay card.
  return (
    <motion.div
      style={{
        opacity,
        y,
        pointerEvents: pointerEvents as any,
      }}
      className={`absolute left-6 md:left-16 md:w-[585px] w-full max-w-full px-4 md:px-0 pointer-events-auto ${
        id === 7 ? "bottom-[180px] md:bottom-[230px]" : "bottom-12 md:bottom-16"
      }`}
    >
      <div className="md:bg-transparent bg-white/95 backdrop-blur-md md:backdrop-blur-none p-6 md:p-0 rounded-2xl md:rounded-none border border-gray-150 md:border-none shadow-xl md:shadow-none">
        <h2 
          className={`text-[36.4px] sm:text-[44.2px] lg:text-[54.6px] font-serif leading-[1.1] mb-4 tracking-tight ${
            isDimmed ? "text-white" : "text-gray-900"
          }`}
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {title}
        </h2>
        <p className={`text-[18.2px] sm:text-[20.8px] leading-relaxed max-w-[494px] font-sans ${
          isDimmed ? "text-gray-200" : "text-gray-500"
        }`}>
          {description}
        </p>
      </div>
    </motion.div>
  );
}
