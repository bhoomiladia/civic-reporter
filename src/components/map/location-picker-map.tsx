"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import { cn } from "@/lib/utils";

interface LocationPickerProps {
  position: { lat: number; lng: number } | null;
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  className?: string;
  searchedLocation?: { lat: number; lng: number } | null;
}

const pickerIcon = L.divIcon({
  html: '<div style="background-color:#2563eb;width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 4px 6px -1px rgb(0 0 0/0.3);display:flex;align-items:center;justify-content:center;"><div style="width:6px;height:6px;background-color:white;border-radius:50%;"></div></div><div style="width:3px;height:12px;background-color:#2563eb;margin:-2px auto 0 auto;"></div>',
  className: "custom-leaflet-marker",
  iconSize: [24, 34],
  iconAnchor: [12, 34],
});

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const url = "https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=" + lat + "&lon=" + lng;
    const res = await fetch(url);
    const data = await res.json();
    return data.display_name || (lat.toFixed(4) + ", " + lng.toFixed(4));
  } catch {
    return lat.toFixed(4) + ", " + lng.toFixed(4);
  }
}

function MapEvents({
  onLocationSelect,
  searchedLocation,
  currentPosition,
}: {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  searchedLocation?: { lat: number; lng: number } | null;
  currentPosition?: { lat: number; lng: number } | null;
}) {
  const map = useMap();
  const isInitialMount = useRef(true);

  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      const address = await reverseGeocode(lat, lng);
      onLocationSelect(lat, lng, address);
    },
  });

  useEffect(() => {
    if (searchedLocation && !isInitialMount.current) {
      map.flyTo([searchedLocation.lat, searchedLocation.lng], 16);
    }
  }, [searchedLocation, map]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (!currentPosition && !searchedLocation) {
        map.locate().on("locationfound", function (e) {
          map.flyTo(e.latlng, 15);
        });
      }
    }
  }, [map, currentPosition, searchedLocation]);

  return null;
}

export function LocationPickerMap({
  position,
  onLocationSelect,
  className,
  searchedLocation,
}: LocationPickerProps) {
  const initialCenter: [number, number] = position
    ? [position.lat, position.lng]
    : [37.7749, -122.4194];

  return (
    <div className={cn("w-full h-full relative z-0", className)}>
      <MapContainer
        center={initialCenter}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapEvents
          onLocationSelect={onLocationSelect}
          searchedLocation={searchedLocation}
          currentPosition={position}
        />

        {position && (
          <Marker position={[position.lat, position.lng]} icon={pickerIcon} />
        )}
      </MapContainer>

      {!position && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-gray-200 z-[1000] pointer-events-none">
          <span className="text-sm text-gray-700 font-medium">
            Tap anywhere to place pin
          </span>
        </div>
      )}
    </div>
  );
}
