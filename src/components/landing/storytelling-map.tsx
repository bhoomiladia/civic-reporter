"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useTransform, useMotionValueEvent, MotionValue, useSpring } from "framer-motion";
import {
  CheckCircle2,
  Camera,
  Activity,
  ArrowLeft,
  MapPin,
  Check
} from "lucide-react";

// Kinematics and physics simulation functions for the maintenance truck
interface PathPoint {
  x: number;
  y: number;
  theta: number;
  kappa: number;
}

function getPathState(d: number, isReturn: boolean): PathPoint {
  // Arc length constant for R = 15 turning 90 degrees
  const ARC_LEN = 15 * Math.PI / 2; // ~23.56194

  if (!isReturn) {
    // Forward trip: City Hall (580, 145) -> Pothole (410, 280)
    // Segments:
    // 1. Line from (580, 145) to (495, 145) [length 85]
    // 2. Arc with center (480, 145) and radius 15, from (495, 145) to (480, 160) [length ARC_LEN]
    // 3. Line from (480, 160) to (480, 265) [length 105]
    // 4. Arc with center (480, 280) and radius 15, from (480, 265) to (465, 280) [length ARC_LEN]
    // 5. Line from (465, 280) to (410, 280) [length 55]
    if (d <= 85) {
      return { x: 580 - d, y: 145, theta: 180, kappa: 0 };
    } else if (d <= 85 + ARC_LEN) {
      const dLocal = d - 85;
      const alpha = dLocal / 15;
      return {
        x: 480 + 15 * Math.cos(alpha),
        y: 145 + 15 * Math.sin(alpha),
        theta: 180 - alpha * 180 / Math.PI,
        kappa: -1 / 15
      };
    } else if (d <= 85 + ARC_LEN + 105) {
      const dLocal = d - (85 + ARC_LEN);
      return { x: 480, y: 160 + dLocal, theta: 90, kappa: 0 };
    } else if (d <= 85 + ARC_LEN + 105 + ARC_LEN) {
      const dLocal = d - (85 + ARC_LEN + 105);
      const alpha = dLocal / 15;
      return {
        x: 480 - 15 * Math.sin(alpha),
        y: 280 - 15 * Math.cos(alpha),
        theta: 90 + alpha * 180 / Math.PI,
        kappa: 1 / 15
      };
    } else {
      const dLocal = d - (85 + ARC_LEN + 105 + ARC_LEN);
      return { x: 465 - dLocal, y: 280, theta: 180, kappa: 0 };
    }
  } else {
    // Return trip: Pothole (410, 280) -> City Hall (580, 145)
    // Segments:
    // 1. Line from (410, 280) to (465, 280) [length 55]
    // 2. Arc with center (480, 280) and radius 15, from (465, 280) to (480, 265) [length ARC_LEN]
    // 3. Line from (480, 265) to (480, 160) [length 105]
    // 4. Arc with center (480, 145) and radius 15, from (480, 160) to (495, 145) [length ARC_LEN]
    // 5. Line from (495, 145) to (580, 145) [length 85]
    if (d <= 55) {
      return { x: 410 + d, y: 280, theta: 360, kappa: 0 };
    } else if (d <= 55 + ARC_LEN) {
      const dLocal = d - 55;
      const alpha = dLocal / 15;
      return {
        x: 480 - 15 * Math.cos(alpha),
        y: 280 - 15 * Math.sin(alpha),
        theta: 360 - alpha * 180 / Math.PI,
        kappa: -1 / 15
      };
    } else if (d <= 55 + ARC_LEN + 105) {
      const dLocal = d - (55 + ARC_LEN);
      return { x: 480, y: 265 - dLocal, theta: 270, kappa: 0 };
    } else if (d <= 55 + ARC_LEN + 105 + ARC_LEN) {
      const dLocal = d - (55 + ARC_LEN + 105);
      const alpha = dLocal / 15;
      return {
        x: 480 + 15 * Math.sin(alpha),
        y: 145 + 15 * Math.cos(alpha),
        theta: 270 + alpha * 180 / Math.PI,
        kappa: 1 / 15
      };
    } else {
      const dLocal = d - (55 + ARC_LEN + 105 + ARC_LEN);
      return { x: 495 + dLocal, y: 145, theta: 360, kappa: 0 };
    }
  }
}

function getTruckKinematics(p: number) {
  const ARC_LEN = 15 * Math.PI / 2;
  const L = 85 + ARC_LEN + 105 + ARC_LEN + 55; // 292.12389
  
  let isReturn = false;
  let t = 0;
  let opacity = 0;
  
  if (p >= 0.59 && p <= 0.67) {
    // Forward trip
    isReturn = false;
    // Map p in [0.60, 0.66] to t in [0, 1]
    const pStart = 0.60;
    const pEnd = 0.66;
    t = (p - pStart) / (pEnd - pStart);
    t = Math.max(0, Math.min(1, t));
    
    // Opacity fades in at 0.59 to 0.61, fades out at 0.66 to 0.67
    if (p < 0.61) {
      opacity = (p - 0.59) / 0.02;
    } else if (p > 0.65) {
      opacity = 1 - (p - 0.65) / 0.02;
    } else {
      opacity = 1;
    }
    opacity = Math.max(0, Math.min(1, opacity));
  } else if (p >= 0.71 && p <= 0.79) {
    // Return trip
    isReturn = true;
    const pStart = 0.72;
    const pEnd = 0.78;
    t = (p - pStart) / (pEnd - pStart);
    t = Math.max(0, Math.min(1, t));
    
    // Opacity fades in at 0.71 to 0.73, fades out at 0.77 to 0.79
    if (p < 0.73) {
      opacity = (p - 0.71) / 0.02;
    } else if (p > 0.77) {
      opacity = 1 - (p - 0.77) / 0.02;
    } else {
      opacity = 1;
    }
    opacity = Math.max(0, Math.min(1, opacity));
  } else {
    // Inactive
    return {
      x: 580,
      y: 145,
      rotate: 180,
      opacity: 0,
      bodyTranslateX: 0,
      bodyTranslateY: 0,
      wheelOffset: 0
    };
  }
  
  // Smootherstep calculation
  const s = 6 * Math.pow(t, 5) - 15 * Math.pow(t, 4) + 10 * Math.pow(t, 3);
  const d = s * L;
  
  // Velocity factor (ds/dt)
  const v_factor = 30 * Math.pow(t, 4) - 60 * Math.pow(t, 3) + 30 * Math.pow(t, 2);
  const v_norm = v_factor / 1.875; // Peak value at t=0.5 is 1.875, so v_norm ranges [0, 1]
  
  // Acceleration factor (dv/dt)
  const a_factor = 120 * Math.pow(t, 3) - 180 * Math.pow(t, 2) + 60 * t;
  const a_norm = a_factor / 5.77; // Peak value is ~5.77, so a_norm ranges [-1, 1]
  
  const state = getPathState(d, isReturn);
  
  // Dynamic Roll (suspension side-to-side reaction)
  // Shift perpendicular to heading direction
  const K_roll = 45; // roll translation coefficient
  const rollOffset = state.kappa * v_norm * K_roll;
  const rollAngleRad = (state.theta + 90) * Math.PI / 180;
  const rollX = rollOffset * Math.cos(rollAngleRad);
  const rollY = rollOffset * Math.sin(rollAngleRad);
  
  // Dynamic Pitch (suspension front-to-back reaction)
  // Shift along heading direction when accelerating/decelerating
  const K_pitch = 2.5; // pitch translation coefficient (in pixels)
  const pitchOffset = -a_norm * K_pitch;
  const pitchAngleRad = state.theta * Math.PI / 180;
  const pitchX = pitchOffset * Math.cos(pitchAngleRad);
  const pitchY = pitchOffset * Math.sin(pitchAngleRad);
  
  // Combined chassis offsets
  const bodyTranslateX = rollX + pitchX;
  const bodyTranslateY = rollY + pitchY;
  
  // Wheel offset based on distance traveled
  const wheelOffset = d;
  
  return {
    x: state.x,
    y: state.y,
    rotate: state.theta,
    opacity,
    bodyTranslateX,
    bodyTranslateY,
    wheelOffset
  };
}

interface StorytellingMapProps {
  progress: MotionValue<number>;
}

export function StorytellingMap({ progress }: StorytellingMapProps) {
  // Track active scene based on progress
  const [activeScene, setActiveScene] = useState(1);
  const [mobileStage, setMobileStage] = useState(1);

  useMotionValueEvent(progress, "change", (latest) => {
    if (latest <= 0.125) {
      if (activeScene !== 1) setActiveScene(1);
    } else if (latest <= 0.25) {
      if (activeScene !== 2) setActiveScene(2);
    } else if (latest <= 0.375) {
      if (activeScene !== 3) setActiveScene(3);
      // Determine sub-progress of mobile reporting in Scene 3
      if (latest < 0.29) {
        if (mobileStage !== 1) setMobileStage(1);
      } else if (latest < 0.33) {
        if (mobileStage !== 2) setMobileStage(2);
      } else {
        if (mobileStage !== 3) setMobileStage(3);
      }
    } else if (latest <= 0.50) {
      if (activeScene !== 4) setActiveScene(4);
    } else if (latest <= 0.625) {
      if (activeScene !== 5) setActiveScene(5);
    } else if (latest <= 0.75) {
      if (activeScene !== 6) setActiveScene(6);
    } else if (latest <= 0.875) {
      if (activeScene !== 7) setActiveScene(7);
    } else {
      if (activeScene !== 8) setActiveScene(8);
    }
  });

  // ---- DYNAMIC SCANNING STATES ----
  const scanStateText = useTransform(progress, (p) => {
    if (p < 0.258) return "Detecting road surface...";
    if (p < 0.266) return "GPS Lock: 142 Main St";
    if (p < 0.274) return "AI Classifying anomaly...";
    if (p < 0.282) return "Matching department...";
    return "City Operations Matched (98% Conf)";
  });

  const [scanState, setScanState] = useState("Detecting road surface...");
  useMotionValueEvent(scanStateText, "change", (latest) => {
    setScanState(latest);
  });

  // ---- CAMERA TRANSFORMS (Continuous shot drone simulation) ----
  // Center of canvas is 500, 400. Focus point (fx, fy) maps to camera offset: X = 500 - fx, Y = 400 - fy.
  // Pothole (380, 280) focus: X = 120, Y = 120.
  // City Hall (580, 145) focus: X = -80, Y = 255.
  // Midway Route (480, 212) focus: X = 20, Y = 188.
  const cameraScale = useTransform(
    progress,
    [0.0, 0.125, 0.25, 0.50, 0.54, 0.58, 0.60, 0.63, 0.66, 0.72, 0.75, 0.78, 0.85, 1.0],
    [0.85, 1.0, 2.0, 2.0, 1.7, 1.5, 1.5, 1.7, 2.2, 2.2, 1.7, 1.5, 0.85, 0.80],
    { clamp: true }
  );

  const cameraX = useTransform(
    progress,
    [0.0, 0.125, 0.25, 0.50, 0.54, 0.58, 0.60, 0.63, 0.66, 0.72, 0.75, 0.78, 0.85, 1.0],
    [0, 0, 120, 120, 20, -80, -80, 20, 120, 120, 20, -80, 0, 0],
    { clamp: true }
  );

  const cameraY = useTransform(
    progress,
    [0.0, 0.125, 0.25, 0.50, 0.54, 0.58, 0.60, 0.63, 0.66, 0.72, 0.75, 0.78, 0.85, 1.0],
    [0, 0, 120, 120, 188, 255, 255, 188, 120, 120, 188, 255, 0, 0],
    { clamp: true }
  );

  const cameraRotate = useTransform(
    progress,
    [0.0, 0.25, 0.50, 0.75, 1.0],
    [0, -2, 1.5, -1, -2],
    { clamp: true }
  );

  // ---- MAP VISUAL STATE TRANSFORMS ----
  const mapOpacity = useTransform(progress, [0.08, 0.15], [0, 1], { clamp: true });

  const mapDimOpacity = useTransform(
    progress,
    [0.22, 0.26, 0.35, 0.48, 0.50, 0.625, 0.84, 0.90],
    [0, 0.45, 0.50, 0.50, 0, 0, 0, 0.6],
    { clamp: true }
  );

  // Road highlight: Red -> Orange (during repair) -> Dark Grey (fresh asphalt) -> Green (completed)
  const roadStrokeColor = useTransform(
    progress,
    [0.60, 0.66, 0.67, 0.70, 0.71, 0.74],
    ["#ef4444", "#ef4444", "#f97316", "#f97316", "#4b5563", "#22c55e"],
    { clamp: true }
  );

  // Pothole pin scale/opacity (reveals in Scene 2)
  const potholeScale = useTransform(progress, [0.125, 0.18], [0, 1], { clamp: true });
  const potholeOpacity = useTransform(progress, [0.125, 0.16], [0, 1], { clamp: true });

  // Citizen (Blue dot) walks out of building (255, 240) to pothole area (340, 285)
  const citizenX = useTransform(progress, [0.25, 0.30], [255, 340], { clamp: true });
  const citizenY = useTransform(progress, [0.25, 0.30], [240, 285], { clamp: true });
  const citizenOpacity = useTransform(progress, [0.24, 0.26, 0.74, 0.76], [0, 1, 1, 0], { clamp: true });

  // Scene 4 Neighbor Avatars coordinates (Animate towards pothole 380, 280)
  const n1X = useTransform(progress, [0.375, 0.45], [200, 340], { clamp: true });
  const n1Y = useTransform(progress, [0.375, 0.45], [160, 250], { clamp: true });
  const n1Opacity = useTransform(progress, [0.375, 0.40, 0.49, 0.52], [0, 1, 1, 0], { clamp: true });

  const n2X = useTransform(progress, [0.375, 0.45], [540, 420], { clamp: true });
  const n2Y = useTransform(progress, [0.375, 0.45], [200, 250], { clamp: true });
  const n2Opacity = useTransform(progress, [0.375, 0.40, 0.49, 0.52], [0, 1, 1, 0], { clamp: true });

  const n3X = useTransform(progress, [0.375, 0.45], [280, 350], { clamp: true });
  const n3Y = useTransform(progress, [0.375, 0.45], [420, 310], { clamp: true });
  const n3Opacity = useTransform(progress, [0.375, 0.40, 0.49, 0.52], [0, 1, 1, 0], { clamp: true });

  const n4X = useTransform(progress, [0.375, 0.45], [480, 410], { clamp: true });
  const n4Y = useTransform(progress, [0.375, 0.45], [360, 310], { clamp: true });
  const n4Opacity = useTransform(progress, [0.375, 0.40, 0.49, 0.52], [0, 1, 1, 0], { clamp: true });

  // Direct transform bindings for neighbor position strings
  const n1Transform = useTransform([n1X, n1Y], ([x, y]) => `translate(${x}, ${y})`);
  const n2Transform = useTransform([n2X, n2Y], ([x, y]) => `translate(${x}, ${y})`);
  const n3Transform = useTransform([n3X, n3Y], ([x, y]) => `translate(${x}, ${y})`);
  const n4Transform = useTransform([n4X, n4Y], ([x, y]) => `translate(${x}, ${y})`);

  // Scene 5 Route Line Animation - stops exactly at City Hall threshold (580, 145)
  // Grows forward from pothole to City Hall, then shrinks backwards (towards pothole) as the truck arrives.
  const routeDashoffset = useTransform(
    progress,
    [0.50, 0.58, 0.60, 0.66],
    [335, 0, 0, 335],
    { clamp: true }
  );
  const routeOpacity = useTransform(progress, [0.49, 0.50, 0.74, 0.76], [0, 1, 1, 0], { clamp: true });

  // Scene 7 Green Route Line Animation - grows from Pothole (380, 280) to City Hall (580, 145)
  // as the truck returns between 0.72 and 0.78
  const greenDashoffset = useTransform(progress, [0.72, 0.78], [335, 0], { clamp: true });
  const greenOpacity = useTransform(progress, [0.71, 0.72, 0.88, 0.90], [0, 1, 1, 0], { clamp: true });

  // Report dot position: stays at pothole (380, 280) until 0.50, then travels to City Hall (580, 145)
  const reportDotX = useTransform(
    progress,
    [0.0, 0.50, 0.52, 0.55, 0.58],
    [380, 380, 480, 480, 580],
    { clamp: true }
  );
  const reportDotY = useTransform(
    progress,
    [0.0, 0.50, 0.52, 0.55, 0.58],
    [280, 280, 280, 145, 145],
    { clamp: true }
  );
  // Red circle opacity: visible in Scene 2-4 (at pothole), travels in Scene 5, fades out at City Hall
  const reportDotOpacity = useTransform(
    progress,
    [0.125, 0.16, 0.58, 0.60],
    [0, 1, 1, 0],
    { clamp: true }
  );

  // Scene 6 & 7 Maintenance Truck driving with realistic kinematics
  const truckX = useTransform(progress, (p) => getTruckKinematics(p).x);
  const truckY = useTransform(progress, (p) => getTruckKinematics(p).y);
  const truckRotate = useTransform(progress, (p) => getTruckKinematics(p).rotate);
  const truckOpacity = useTransform(progress, (p) => getTruckKinematics(p).opacity);
  const bodyTranslateX = useTransform(progress, (p) => getTruckKinematics(p).bodyTranslateX);
  const bodyTranslateY = useTransform(progress, (p) => getTruckKinematics(p).bodyTranslateY);
  const wheelOffset = useTransform(progress, (p) => getTruckKinematics(p).wheelOffset);

  // Caution Rings Ripple (active during repair Scene 6)
  const cautionRingOpacity = useTransform(progress, [0.69, 0.70, 0.74, 0.75], [0, 0.8, 0.8, 0], { clamp: true });

  // Scene 7 Traffic Particle flow along Main St (y: 280)
  const trafficFlowX1 = useTransform(progress, (v) => {
    if (v < 0.73) return -100;
    const progressFactor = (v - 0.73) / 0.145;
    return (progressFactor * 1200) - 100;
  });
  const trafficFlowX2 = useTransform(progress, (v) => {
    if (v < 0.73) return 1100;
    const progressFactor = (v - 0.73) / 0.145;
    return 1100 - (progressFactor * 1200);
  });
  const trafficOpacity = useTransform(progress, [0.73, 0.76], [0, 0.75], { clamp: true });

  // Green checkmark pin appearing after repair is complete
  const greenPinOpacity = useTransform(progress, [0.71, 0.74], [0, 1], { clamp: true });

  // Scene 7 Statistics counter mapping
  const resolveRate = useTransform(progress, [0.75, 0.85], [80, 94.2], { clamp: true });
  const [resolveRateVal, setResolveRateVal] = useState("80.0");
  useMotionValueEvent(resolveRate, "change", (latest) => {
    setResolveRateVal(latest.toFixed(1));
  });

  const otherResolvedPins = [
    { id: "op1", x: 150, y: 220 },
    { id: "op2", x: 680, y: 200 },
    { id: "op3", x: 820, y: 550 },
    { id: "op4", x: 220, y: 700 },
    { id: "op5", x: 550, y: 780 },
    { id: "op6", x: 740, y: 380 }
  ];

  return (
    <div className="relative w-full h-full bg-[#f6f5f0] overflow-hidden select-none">
      {/* ────────────────── MAP GRID / VECTOR CANVAS ────────────────── */}
      <motion.div
        className="absolute inset-0 origin-center w-full h-full"
        style={{
          scale: cameraScale,
          x: cameraX,
          y: cameraY,
          rotate: 0,
          opacity: mapOpacity,
        }}
      >
        <svg className="w-full h-full min-w-full min-h-full" viewBox="0 0 1000 800" fill="none" xmlns="http://www.w3.org/2000/svg">
          <style>
            {`
              @keyframes ambient-blink {
                0%, 100% { opacity: 0.25; }
                50% { opacity: 0.95; }
              }
              @keyframes car-flow-east {
                0% { transform: translateX(-150px); }
                100% { transform: translateX(1100px); }
              }
              @keyframes car-flow-south {
                0% { transform: translateY(-100px); }
                100% { transform: translateY(850px); }
              }
              @keyframes pedestrian-idle {
                0%, 100% { transform: translate(0, 0); }
                50% { transform: translate(6px, -6px); }
              }
              @keyframes pulse-ripple {
                0% { r: 10px; opacity: 0.85; }
                100% { r: 28px; opacity: 0; }
              }
              .blink-light {
                animation: ambient-blink 3s infinite ease-in-out;
              }
              .car-east {
                animation: car-flow-east 14s infinite linear;
              }
              .car-south {
                animation: car-flow-south 18s infinite linear;
              }
              .ped-walk {
                animation: pedestrian-idle 7s infinite ease-in-out;
              }
              .ripple-effect {
                animation: pulse-ripple 1.8s infinite ease-out;
                transform-origin: center;
              }
            `}
          </style>

          {/* Base Grid */}
          <defs>
            <pattern id="city-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ebe9e0" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="1000" height="800" fill="url(#city-grid)" />

          {/* Waterbody */}
          <path
            d="M 850 0 C 800 200, 920 400, 880 600 C 850 750, 900 800, 1000 800 L 1000 0 Z"
            fill="#e4ecf5"
            opacity="0.9"
          />

          {/* Parks */}
          <rect x="50" y="80" width="160" height="120" rx="16" fill="#e5ecd9" />
          <rect x="620" y="450" width="180" height="150" rx="20" fill="#e5ecd9" />
          <circle cx="200" cy="620" r="70" fill="#e5ecd9" />

          {/* Pedestrians (Tiny ambient circles walking in parks) */}
          <circle cx="90" cy="110" r="2.5" fill="#a3a3a3" className="ped-walk" style={{ animationDelay: "0.2s" }} />
          <circle cx="140" cy="150" r="2.5" fill="#a3a3a3" className="ped-walk" style={{ animationDelay: "1.4s" }} />
          <circle cx="670" cy="510" r="2.5" fill="#a3a3a3" className="ped-walk" style={{ animationDelay: "0.8s" }} />
          <circle cx="710" cy="540" r="2.5" fill="#a3a3a3" className="ped-walk" style={{ animationDelay: "2.1s" }} />

          {/* Buildings block placeholders */}
          <g fill="#ece9e1">
            <rect x="250" y="100" width="70" height="60" rx="6" />
            <rect x="330" y="100" width="80" height="60" rx="6" />
            <rect x="420" y="100" width="60" height="60" rx="6" />

            <rect x="50" y="240" width="80" height="70" rx="6" />
            <rect x="140" y="240" width="90" height="70" rx="6" />

            <rect x="520" y="120" width="120" height="80" rx="8" />
            <rect x="650" y="120" width="90" height="80" rx="8" />

            <rect x="500" y="280" width="70" height="100" rx="6" />
            <rect x="580" y="280" width="70" height="100" rx="6" />

            <rect x="280" y="480" width="100" height="70" rx="6" />
            <rect x="390" y="480" width="80" height="70" rx="6" />
          </g>

          {activeScene >= 5 && (
            <motion.g 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{ x: 535, y: 100 }}
            >
              {/* Civic Signage Header */}
              <text x="45" y="-5" textAnchor="middle" fill="#475569" fontSize="6" fontWeight="bold" fontFamily="sans-serif" letterSpacing="0.05em">MUNICIPAL CORP.</text>
              {/* Subtle ground shadow */}
              <rect x="0" y="51" width="90" height="4" rx="2" fill="#000000" fillOpacity="0.08" />
              
              {/* Foundation steps / base plate */}
              <rect x="2" y="47" width="86" height="5" fill="#94a3b8" rx="0.5" />
              <rect x="6" y="44" width="78" height="3" fill="#cbd5e1" rx="0.5" />

              {/* Side Wings (Neutral concrete masonry panels) */}
              <rect x="8" y="15" width="20" height="30" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.8" rx="0.5" />
              <rect x="62" y="15" width="20" height="30" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.8" rx="0.5" />
              
              {/* Side Wing Windows (Clean glass strips) */}
              <rect x="12" y="20" width="4" height="8" fill="#475569" rx="0.5" />
              <rect x="18" y="20" width="4" height="8" fill="#475569" rx="0.5" />
              <rect x="12" y="31" width="4" height="8" fill="#475569" rx="0.5" />
              <rect x="18" y="31" width="4" height="8" fill="#475569" rx="0.5" />

              <rect x="68" y="20" width="4" height="8" fill="#475569" rx="0.5" />
              <rect x="74" y="20" width="4" height="8" fill="#475569" rx="0.5" />
              <rect x="68" y="31" width="4" height="8" fill="#475569" rx="0.5" />
              <rect x="74" y="31" width="4" height="8" fill="#475569" rx="0.5" />

              {/* Central Atrium Block (Double height glass structure with concrete frame) */}
              <rect x="28" y="4" width="34" height="40" fill="#cbd5e1" stroke="#64748b" strokeWidth="1" rx="1" />
              <rect x="31" y="8" width="28" height="36" fill="#1e293b" rx="0.5" /> {/* Atrium glass background */}

              {/* Modern vertical columns / piers */}
              <rect x="33" y="4" width="2.5" height="40" fill="#f1f5f9" />
              <rect x="41" y="4" width="2.5" height="40" fill="#f1f5f9" />
              <rect x="46.5" y="4" width="2.5" height="40" fill="#f1f5f9" />
              <rect x="54.5" y="4" width="2.5" height="40" fill="#f1f5f9" />

              {/* Entrance Portal (Large door frame) */}
              <rect x="37.5" y="26" width="15" height="18" fill="#1e3a6e" stroke="#f1f5f9" strokeWidth="0.8" rx="0.5" />
              <rect x="40" y="29" width="10" height="15" fill="#f8fafc" opacity="0.95" rx="0.2" />
              {/* Glass door seam */}
              <line x1="45" y1="29" x2="45" y2="44" stroke="#64748b" strokeWidth="0.5" />

              {/* Modern flat roof overhangs */}
              <rect x="26" y="2" width="38" height="3" fill="#64748b" rx="0.5" />
              <rect x="6" y="13" width="24" height="2" fill="#94a3b8" rx="0.5" />
              <rect x="60" y="13" width="24" height="2" fill="#94a3b8" rx="0.5" />

              {/* Subtle architectural detailing / horizontal louvers */}
              <line x1="31" y1="12" x2="59" y2="12" stroke="#475569" strokeWidth="0.8" />
              <line x1="31" y1="16" x2="59" y2="16" stroke="#475569" strokeWidth="0.8" />

              {/* Official Plaque Signage next to entrance */}
              <rect x="56" y="30" width="4.5" height="6" fill="#0f172a" rx="0.5" />
              <line x1="57" y1="32" x2="59" y2="32" stroke="#f1f5f9" strokeWidth="0.4" />
              <line x1="57" y1="34" x2="58.5" y2="34" stroke="#f1f5f9" strokeWidth="0.4" />

              {/* Flagpole & Official Blue/Gold Civic Flag */}
              <line x1="3" y1="22" x2="3" y2="49" stroke="#64748b" strokeWidth="0.8" />
              <path d="M 3 22 L 14 25 L 3 28 Z" fill="#1e3a6e" />
              <circle cx="3" cy="21.5" r="0.8" fill="#e2e8f0" />
            </motion.g>
          )}

          {/* City Roads System */}
          <g stroke="#ffffff" strokeLinecap="round">
            {/* Primary horizontal road (Main St) */}
            <line x1="0" y1="280" x2="880" y2="280" strokeWidth="20" />
            <line x1="0" y1="280" x2="880" y2="280" stroke="#f1eeeb" strokeWidth="2" strokeDasharray="6 6" />

            {/* Secondary horizontal roads */}
            <line x1="0" y1="440" x2="1000" y2="440" strokeWidth="14" />
            <line x1="0" y1="640" x2="880" y2="640" strokeWidth="12" />
            <line x1="200" y1="80" x2="800" y2="80" strokeWidth="10" />

            {/* Vertical major roads */}
            <line x1="240" y1="0" x2="240" y2="800" strokeWidth="18" />
            <line x1="480" y1="0" x2="480" y2="800" strokeWidth="16" />
            <line x1="800" y1="0" x2="800" y2="800" strokeWidth="14" />

            {/* Diagonal road connecting midtown */}
            <line x1="480" y1="440" x2="800" y2="80" strokeWidth="10" />
          </g>

          {/* Ambient cars flowing along roads */}
          <g className="car-east" transform="translate(0, 436)">
            <rect width="12" height="6" rx="2" fill="#9ca3af" />
          </g>
          <g className="car-south" transform="translate(236, 0)">
            <rect width="6" height="12" rx="2" fill="#ef4444" opacity="0.8" />
          </g>
          <g className="car-south" transform="translate(804, 100)" style={{ animationDelay: "-6s" }}>
            <rect width="6" height="12" rx="2" fill="#3b82f6" opacity="0.8" />
          </g>

          {/* Ambient Blinking streetlights */}
          <circle cx="260" cy="180" r="1.5" fill="#fef08a" className="blink-light" style={{ animationDelay: "0.2s" }} />
          <circle cx="430" cy="180" r="1.5" fill="#fef08a" className="blink-light" style={{ animationDelay: "1.1s" }} />
          <circle cx="150" cy="340" r="1.5" fill="#fef08a" className="blink-light" style={{ animationDelay: "0.7s" }} />
          <circle cx="530" cy="220" r="1.5" fill="#fef08a" className="blink-light" style={{ animationDelay: "1.8s" }} />
          <circle cx="670" cy="220" r="1.5" fill="#fef08a" className="blink-light" style={{ animationDelay: "0.5s" }} />

          {/* Scene 2+ Highlighted Pothole Segment */}
          <motion.path
            d="M 330 280 L 430 280"
            stroke={roadStrokeColor}
            strokeWidth="6"
            strokeLinecap="round"
            style={{ opacity: potholeOpacity }}
          />

          {/* Scene 5 Route Line Animation - stops exactly at City Hall threshold (580, 145) */}
          {activeScene >= 5 && (
            <>
              <motion.path
                d="M 380 280 L 480 280 L 480 145 L 580 145"
                stroke="#3b82f6"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="335"
                style={{ strokeDashoffset: routeDashoffset, opacity: routeOpacity }}
              />
              {/* Native SVG animateMotion for information particles traveling through infrastructure */}
              {activeScene === 5 && (
                <>
                  <circle r="4.5" fill="#93c5fd" opacity="0.9">
                    <animateMotion
                      path="M 380 280 L 480 280 L 480 145 L 580 145"
                      dur="1.8s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle r="3.5" fill="#ffffff" opacity="1">
                    <animateMotion
                      path="M 380 280 L 480 280 L 480 145 L 580 145"
                      dur="1.8s"
                      begin="0.6s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle r="3.5" fill="#93c5fd" opacity="0.8">
                    <animateMotion
                      path="M 380 280 L 480 280 L 480 145 L 580 145"
                      dur="1.8s"
                      begin="1.2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </>
              )}
            </>
          )}

          {/* Scene 7 Green Route Line Animation - grows from Pothole to City Hall */}
          {activeScene >= 6 && (
            <motion.path
              d="M 380 280 L 480 280 L 480 145 L 580 145"
              stroke="#22c55e"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="335"
              style={{ strokeDashoffset: greenDashoffset, opacity: greenOpacity }}
            />
          )}

          {/* Pulsing Red Circle (native SVG report dot) */}
          <motion.circle
            className="ripple-effect"
            style={{
              cx: reportDotX,
              cy: reportDotY,
              opacity: reportDotOpacity
            }}
            fill="#ef4444"
          />
          <motion.circle
            style={{
              cx: reportDotX,
              cy: reportDotY,
              opacity: reportDotOpacity,
              scale: potholeScale
            }}
            r="10"
            fill="#ef4444"
            stroke="#ffffff"
            strokeWidth="2.5"
          />

          {/* Scene 7 Traffic Dots */}
          <motion.circle
            style={{ cx: trafficFlowX1, opacity: trafficOpacity }}
            cy="274"
            r="4.5"
            fill="#a3a3a3"
          />
          <motion.circle
            style={{ cx: trafficFlowX2, opacity: trafficOpacity }}
            cy="286"
            r="4.5"
            fill="#a3a3a3"
          />

          {/* Scene 4 Neighbor Avatars (Rendered directly using SVG coordinates to prevent styling defects) */}
          <g>
            <motion.circle style={{ opacity: n1Opacity }} cx={n1X} cy={n1Y} r="14" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" />
            <motion.text style={{ opacity: n1Opacity }} x={n1X} y={n1Y} dy="3" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">M.K.</motion.text>
          </g>
          <g>
            <motion.circle style={{ opacity: n2Opacity }} cx={n2X} cy={n2Y} r="14" fill="#d97706" stroke="#ffffff" strokeWidth="1.5" />
            <motion.text style={{ opacity: n2Opacity }} x={n2X} y={n2Y} dy="3" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">J.D.</motion.text>
          </g>
          <g>
            <motion.circle style={{ opacity: n3Opacity }} cx={n3X} cy={n3Y} r="14" fill="#7c3aed" stroke="#ffffff" strokeWidth="1.5" />
            <motion.text style={{ opacity: n3Opacity }} x={n3X} y={n3Y} dy="3" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">A.L.</motion.text>
          </g>
          <g>
            <motion.circle style={{ opacity: n4Opacity }} cx={n4X} cy={n4Y} r="14" fill="#0d9488" stroke="#ffffff" strokeWidth="1.5" />
            <motion.text style={{ opacity: n4Opacity }} x={n4X} y={n4Y} dy="3" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">S.H.</motion.text>
          </g>

          {/* Pulsing Citizen Dot (Rendered inside native SVG to prevent coordinate drift) */}
          <g>
            <motion.circle
              style={{ opacity: citizenOpacity }}
              cx={citizenX}
              cy={citizenY}
              r="12"
              fill="#2563eb"
              fillOpacity="0.2"
              className="ripple-effect"
            />
            <motion.circle
              style={{ opacity: citizenOpacity }}
              cx={citizenX}
              cy={citizenY}
              r="5"
              fill="#2563eb"
              stroke="#ffffff"
              strokeWidth="2"
            />
          </g>

          {/* Scene 6 Driving Maintenance Truck (native SVG group - Top-down View to rotate naturally on turns) */}
          {activeScene >= 5 && activeScene <= 7 && (
            <motion.g
              style={{
                x: truckX,
                y: truckY,
                rotate: truckRotate,
                opacity: truckOpacity,
                transformOrigin: "center"
              }}
            >
              {/* Ground Shadow */}
              <rect x="-24" y="-12" width="48" height="24" rx="4" fill="#000000" fillOpacity="0.15" />
              
              {/* Wheels visible from top-down on the sides, treads rotate based on distance traveled */}
              {/* Front Left Wheel */}
              <g transform="translate(8, -11.5)">
                <rect x="0" y="0" width="8" height="2" rx="0.5" fill="#1e293b" />
                <motion.line x1="0" y1="1" x2="8" y2="1" stroke="#4b5563" strokeWidth="0.8" strokeDasharray="2 2" style={{ strokeDashoffset: wheelOffset }} />
              </g>
              {/* Front Right Wheel */}
              <g transform="translate(8, 9.5)">
                <rect x="0" y="0" width="8" height="2" rx="0.5" fill="#1e293b" />
                <motion.line x1="0" y1="1" x2="8" y2="1" stroke="#4b5563" strokeWidth="0.8" strokeDasharray="2 2" style={{ strokeDashoffset: wheelOffset }} />
              </g>
              {/* Rear Left Wheel */}
              <g transform="translate(-14, -11.5)">
                <rect x="0" y="0" width="8" height="2" rx="0.5" fill="#1e293b" />
                <motion.line x1="0" y1="1" x2="8" y2="1" stroke="#4b5563" strokeWidth="0.8" strokeDasharray="2 2" style={{ strokeDashoffset: wheelOffset }} />
              </g>
              {/* Rear Right Wheel */}
              <g transform="translate(-14, 9.5)">
                <rect x="0" y="0" width="8" height="2" rx="0.5" fill="#1e293b" />
                <motion.line x1="0" y1="1" x2="8" y2="1" stroke="#4b5563" strokeWidth="0.8" strokeDasharray="2 2" style={{ strokeDashoffset: wheelOffset }} />
              </g>

              {/* Truck Body - Suspenion roll and pitch movement shift the body relative to the chassis */}
              <motion.g style={{ x: bodyTranslateX, y: bodyTranslateY }}>
                {/* Main body (orange/yellow container) */}
                <rect x="-22" y="-10" width="44" height="20" rx="3" fill="#f59e0b" stroke="#1e293b" strokeWidth="1.5" />
                
                {/* Cabin (windshield and side windows) */}
                <rect x="6" y="-8" width="12" height="16" rx="2" fill="#1e293b" />
                {/* Windshield */}
                <rect x="12" y="-6" width="4" height="12" fill="#e2e8f0" />
                {/* Side Windows */}
                <rect x="8" y="-7" width="3" height="2" fill="#e2e8f0" />
                <rect x="8" y="5" width="3" height="2" fill="#e2e8f0" />
                
                {/* Cargo bed divider */}
                <line x1="4" y1="-10" x2="4" y2="10" stroke="#1e293b" strokeWidth="1.5" />
                
                {/* Utility details in cargo bed */}
                <rect x="-16" y="-6" width="16" height="12" fill="#d97706" stroke="#1e293b" strokeWidth="1" />
                <line x1="-12" y1="-3" x2="-4" y2="-3" stroke="#1e293b" strokeWidth="1" />
                <line x1="-12" y1="1" x2="-4" y2="1" stroke="#1e293b" strokeWidth="1" />

                {/* Side mirrors */}
                <rect x="10" y="-12" width="3" height="2" rx="0.5" fill="#1e293b" />
                <rect x="10" y="10" width="3" height="2" rx="0.5" fill="#1e293b" />

                {/* Front bumper */}
                <rect x="22" y="-5" width="2" height="10" rx="0.5" fill="#94a3b8" stroke="#1e293b" strokeWidth="1" />
              </motion.g>
            </motion.g>
          )}

          {/* Caution repair ring (active during repair Scene 6 at pothole 380, 280) */}
          <motion.circle
            style={{ opacity: cautionRingOpacity, animationDuration: "12s", transformOrigin: "380px 280px" }}
            cx="380"
            cy="280"
            r="28"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="3"
            strokeDasharray="6 6"
            className="animate-spin"
          />

          {/* Green checkmark pin appearing after repair is complete */}
          <g>
            <motion.circle
              style={{ opacity: greenPinOpacity }}
              cx="380"
              cy="280"
              r="12"
              fill="#22c55e"
              stroke="#ffffff"
              strokeWidth="2.5"
            />
            <motion.path
              d="M 374 280 L 378 284 L 387 275"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{ opacity: greenPinOpacity }}
            />
          </g>

          {/* Scene 7+ Many Resolved Pins */}
          {activeScene >= 7 && (
            <>
              {otherResolvedPins.map((op, idx) => (
                <g key={op.id}>
                  <motion.circle
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: idx * 0.08, type: "spring", stiffness: 150 }}
                    cx={op.x}
                    cy={op.y}
                    r="10"
                    fill="#22c55e"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  <motion.path
                    d={`M ${op.x - 5} ${op.y} L ${op.x - 1} ${op.y + 4} L ${op.x + 6} ${op.y - 4}`}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.08 + 0.1 }}
                  />
                </g>
              ))}
            </>
          )}


        </svg>
      </motion.div>

      {/* ────────────────── MAP ANNOTATIONS / LABELS ────────────────── */}
      <div className="absolute top-[8%] left-[10%] text-[8px] tracking-[0.2em] font-semibold text-gray-400 uppercase pointer-events-none">Central Park</div>
      <div className="absolute top-[18%] left-[28%] text-[8px] tracking-[0.2em] font-semibold text-gray-400 uppercase pointer-events-none">Midtown Commercial</div>
      <div className="absolute top-[31%] left-[10%] text-[9px] tracking-[0.05em] font-bold text-gray-500 pointer-events-none italic">Main Street</div>
      <motion.div className="absolute inset-0 bg-black pointer-events-none z-15" style={{ opacity: mapDimOpacity }} />

      {/* ─── Scene 3: Flagship Mobile Phone Mockup Overlay ─── */}
      <AnimatePresence>
        {activeScene === 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="absolute top-[12%] left-[47%] w-[230px] h-[510px] bg-[#1e2022] rounded-[34px] p-1 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.65),0_15px_30px_-10px_rgba(0,0,0,0.4)] border-[3.5px] border-[#2c2d30] z-35 overflow-hidden select-none flex flex-col"
          >
            {/* Dynamic Island */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-3 bg-black rounded-full z-45 flex items-center justify-end px-2 gap-1.5 shadow-[inset_0_1px_2px_rgba(255,255,255,0.15)]">
              <div className="w-1 h-1 rounded-full bg-slate-900 border-[0.2px] border-cyan-500/20" />
              <div className="w-0.5 h-0.5 rounded-full bg-slate-950" />
            </div>

            {/* Glass Sheen Reflection Overlay */}
            <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden rounded-[30px]">
              <motion.div 
                className="absolute -inset-[200%] bg-gradient-to-tr from-transparent via-white/5 to-transparent rotate-[35deg]"
                animate={{
                  x: ["-50%", "50%"],
                  y: ["-50%", "50%"]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 8,
                  ease: "linear"
                }}
              />
            </div>

            {/* Real Light-Themed App UI content screen */}
            <div className="relative w-full h-full bg-[#f7f7f5] rounded-[30px] overflow-hidden flex flex-col justify-between z-20 font-sans shadow-inner">
              
              {/* Status bar */}
              <div className="flex justify-between items-center text-[8.5px] text-gray-500 font-semibold px-4 pt-4 pb-1">
                <span>9:41 AM</span>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-1.5 bg-gray-600 rounded-sm" />
                  <span className="w-2 h-2 bg-gray-600 rounded-full" />
                </div>
              </div>

              {/* Navigation Header */}
              <div className="bg-white border-b border-gray-150 py-2.5 px-3 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-1 text-[10px] text-gray-500 font-medium">
                  <ArrowLeft size={10} />
                  <span>Cancel</span>
                </div>
                <span className="text-[10px] font-semibold text-gray-900">Report Issue</span>
                <div className="w-10" />
              </div>

              {/* Step indicator */}
              <div className="bg-white border-b border-gray-100 py-1.5 px-3 flex items-center justify-between text-[7.5px] font-semibold text-gray-400">
                {/* Step 1: Scan */}
                <div className={`flex items-center gap-1 ${mobileStage > 1 ? "text-green-600" : "text-slate-800"}`}>
                  {mobileStage > 1 ? (
                    <Check size={8} className="bg-green-50 rounded-full p-0.5" />
                  ) : (
                    <span className="w-1 h-1 rounded-full bg-slate-800 animate-pulse" />
                  )}
                  <span>Scan</span>
                </div>
                
                <div className="w-4 h-[1px] bg-gray-150" />
                
                {/* Step 2: Review */}
                <div className={`flex items-center gap-1 ${mobileStage > 2 ? "text-green-600" : mobileStage === 2 ? "text-slate-800" : "text-gray-400"}`}>
                  {mobileStage > 2 ? (
                    <Check size={8} className="bg-green-50 rounded-full p-0.5" />
                  ) : mobileStage === 2 ? (
                    <span className="w-1 h-1 rounded-full bg-slate-800 animate-pulse" />
                  ) : null}
                  <span>Review</span>
                </div>
                
                <div className="w-4 h-[1px] bg-gray-150" />
                
                {/* Step 3: Success */}
                <div className={`flex items-center gap-1 ${mobileStage === 3 ? "text-green-600" : "text-gray-400"}`}>
                  {mobileStage === 3 && (
                    <Check size={8} className="bg-green-50 rounded-full p-0.5" />
                  )}
                  <span>Success</span>
                </div>
              </div>

              {/* Form Content Area / Mobile Workflow Phases */}
              {mobileStage === 1 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex-1 p-3.5 space-y-3.5 overflow-y-auto flex flex-col justify-between"
                >
                  {/* Expanded Camera Preview */}
                  <div className="relative flex-1 min-h-[160px] bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center border border-gray-200/40 shadow-inner">
                    {/* Live road simulation background */}
                    <div className="absolute inset-0 bg-[#57534e] flex flex-col items-center justify-center">
                      {/* Asphalt textures and cracking */}
                      <div className="absolute inset-0 bg-[radial-gradient(#3e3c3a_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
                      {/* Pothole details */}
                      <svg className="w-32 h-20 opacity-80" viewBox="0 0 100 60">
                        <path d="M 10 30 C 15 15, 30 10, 50 12 C 70 14, 85 20, 90 35 C 80 48, 60 52, 40 48 C 20 44, 5 35, 10 30 Z" fill="#292524" />
                        <path d="M 25 22 L 35 24 M 45 28 L 50 35 M 65 20 L 55 24" stroke="#0c0a09" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </div>

                    {/* Camera focal HUD */}
                    <div className="absolute inset-4 border border-white/20 rounded-xl pointer-events-none flex items-center justify-center">
                      <div className="w-6 h-6 border-t-2 border-l-2 border-white/60 absolute top-0 left-0" />
                      <div className="w-6 h-6 border-t-2 border-r-2 border-white/60 absolute top-0 right-0" />
                      <div className="w-6 h-6 border-b-2 border-l-2 border-white/60 absolute bottom-0 left-0" />
                      <div className="w-6 h-6 border-b-2 border-r-2 border-white/60 absolute bottom-0 right-0" />
                      
                      {/* Scanning Laser Line */}
                      <motion.div
                        className="absolute left-0 right-0 h-0.5 bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                        animate={{ top: ["5%", "95%", "5%"] }}
                        transition={{ duration: 3.0, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </div>

                    <div className="absolute bottom-3 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full text-[7.5px] text-emerald-400 font-medium flex items-center gap-1.5 border border-emerald-500/20">
                      <Camera size={8} className="animate-pulse" />
                      <span>{scanState}</span>
                    </div>
                  </div>

                  {/* Diagnostic Progress HUD */}
                  <div className="bg-white border border-gray-150 rounded-xl p-3 space-y-2 shadow-xs">
                    <div className="flex justify-between items-center text-[7.5px] font-semibold text-gray-400 uppercase tracking-wide">
                      <span>Diagnostic Feed</span>
                      <span className="text-slate-700 animate-pulse font-bold">Locking...</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-slate-800 rounded-full" 
                          animate={{ width: ["15%", "100%"] }}
                          transition={{ duration: 4.0, repeat: Infinity, ease: "linear" }}
                        />
                      </div>
                      <p className="text-[8.5px] text-gray-500 font-medium">
                        Synthesizing geographic mapping vectors...
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {mobileStage === 2 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 p-3.5 space-y-3 overflow-y-auto flex flex-col justify-between"
                >
                  <div className="space-y-3.5">
                    {/* Confirmed photo preview */}
                    <div className="relative h-24 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border border-gray-200/50 shadow-sm">
                      {/* Live road simulation background */}
                      <div className="absolute inset-0 bg-[#57534e]">
                        <div className="absolute inset-0 bg-[radial-gradient(#3e3c3a_1px,transparent_1px)] [background-size:12px_12px] opacity-40" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-60">
                          <svg className="w-24 h-16" viewBox="0 0 100 60">
                            <path d="M 10 30 C 15 15, 30 10, 50 12 C 70 14, 85 20, 90 35 C 80 48, 60 52, 40 48 Z" fill="#292524" />
                          </svg>
                        </div>
                      </div>
                      {/* AI Bounding box indicator */}
                      <div className="absolute border border-emerald-500 bg-emerald-500/10 w-20 h-12 rounded flex items-start p-0.5">
                        <span className="bg-emerald-500 text-[5px] text-white px-0.5 py-0.2 rounded font-bold uppercase tracking-wider">Pothole (98%)</span>
                      </div>
                    </div>

                    {/* Confirmed details card - progressive staggered animation */}
                    <div className="bg-white border border-gray-150 rounded-xl p-3 space-y-2.5 shadow-xs">
                      <motion.div 
                        initial={{ opacity: 0, x: -5 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        transition={{ delay: 0.1 }}
                        className="space-y-0.5"
                      >
                        <span className="text-[7.5px] font-bold text-gray-400 uppercase tracking-wide">Category</span>
                        <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg p-1.5">
                          <span className="text-[9px] font-medium text-gray-900">Road Pothole</span>
                          <Check size={8} className="text-emerald-600" />
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        initial={{ opacity: 0, x: -5 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        transition={{ delay: 0.2 }}
                        className="space-y-0.5"
                      >
                        <span className="text-[7.5px] font-bold text-gray-400 uppercase tracking-wide">Location</span>
                        <div className="flex items-center gap-1 bg-gray-50 border border-gray-100 rounded-lg p-1.5">
                          <MapPin size={8} className="text-gray-400" />
                          <span className="text-[9px] text-gray-600 font-medium truncate">142 Main St (Downtown)</span>
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  {/* Active Submit Footer */}
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="w-full bg-[#1e2022] hover:bg-black text-[#fafafa] py-2 rounded-xl text-center text-[10px] font-semibold shadow-md cursor-pointer transition-colors duration-200">
                      Submit Report
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {mobileStage === 3 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex-1 p-4 flex flex-col items-center justify-between text-center"
                >
                  <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                    {/* Success icon check animation */}
                    <div className="relative w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100">
                      <CheckCircle2 size={24} className="text-emerald-600" />
                      <div className="absolute inset-0 bg-emerald-500 rounded-full scale-105 opacity-10 animate-ping" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xs font-semibold text-gray-900">Report Approved</h3>
                      <p className="text-[9px] text-gray-500 leading-relaxed max-w-[150px] mx-auto">
                        Logged, classified, and routed to City Operations department.
                      </p>
                    </div>

                    {/* Dispatch metadata badge */}
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 w-full space-y-1">
                      <div className="flex justify-between items-center text-[8.5px]">
                        <span className="text-gray-400">Reference ID:</span>
                        <span className="font-semibold text-slate-800">#CIV-48902</span>
                      </div>
                      <div className="flex justify-between items-center text-[8.5px]">
                        <span className="text-gray-400">Status:</span>
                        <span className="font-semibold text-emerald-600">Dispatched</span>
                      </div>
                    </div>
                  </div>

                  {/* Completed Track Footer */}
                  <div className="w-full bg-emerald-600 text-[#fafafa] py-2 rounded-xl text-center text-[10px] font-semibold shadow-sm">
                    Tracking Dispatch
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div className="absolute inset-0 bg-black pointer-events-none z-15" style={{ opacity: mapDimOpacity }} />

      {/* ─── Scene 7: Beautiful Statistics Overlay ─── */}
      <AnimatePresence>
        {activeScene === 7 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="absolute inset-x-0 bottom-12 mx-auto max-w-4xl px-8 z-30"
          >
            <div className="bg-white/90 backdrop-blur-xl border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-2xl grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 divide-x divide-gray-150">
              <div className="text-center">
                <p className="text-[36px] font-bold text-blue-900 tracking-tight leading-none mb-1.5 font-serif">{resolveRateVal}%</p>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Resolution Rate</p>
              </div>
              <div className="text-center pl-6 font-serif">
                <p className="text-[36px] font-bold text-blue-900 tracking-tight leading-none mb-1.5">3.2 Hrs</p>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">Avg. Response</p>
              </div>
              <div className="text-center pl-6 font-serif">
                <p className="text-[36px] font-bold text-blue-900 tracking-tight leading-none mb-1.5">14.2k</p>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">Citizens Helped</p>
              </div>
              <div className="text-center pl-6 font-serif">
                <p className="text-[36px] font-bold text-blue-900 tracking-tight leading-none mb-1.5">98.9%</p>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">Community Trust</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
