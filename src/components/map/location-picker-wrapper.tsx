"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

interface LocationPickerWrapperProps {
  position: { lat: number; lng: number } | null;
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  className?: string;
  searchedLocation?: { lat: number; lng: number } | null;
}

const DynamicPicker = dynamic(
  () => import("./location-picker-map").then((mod) => mod.LocationPickerMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#f2efe9]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500 font-medium text-sm">Loading map...</p>
      </div>
    ),
  }
);

export function LocationPickerWrapper(props: LocationPickerWrapperProps) {
  return <DynamicPicker {...props} />;
}
