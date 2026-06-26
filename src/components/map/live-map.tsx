"use client";

import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/constants";
import type { Issue } from "@/lib/types";
import { MapControls } from "@/components/map/map-controls";

interface LiveMapProps {
  issuesList?: Issue[];
  onPinClick?: (issue: Issue) => void;
  selectedIssueId?: string;
  className?: string;
}

// Ensure leaflet handles icons gracefully inside Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function getMapCenter(issues: Issue[]): [number, number] {
  if (!issues || issues.length === 0) return [37.7749, -122.4194]; // Default SF
  
  const lats = issues.map((i) => i.location.lat).filter((l) => !isNaN(l));
  const lngs = issues.map((i) => i.location.lng).filter((l) => !isNaN(l));
  
  if (lats.length === 0) return [37.7749, -122.4194];
  
  const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length;
  const avgLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
  return [avgLat, avgLng];
}

const createCategoryIcon = (category: string, isSelected: boolean) => {
  const catDef = CATEGORIES.find((c) => c.id === category);
  const color = catDef ? catDef.color : "#6b7280";
  
  const scale = isSelected ? "scale(1.2)" : "scale(1)";
  const zIndex = isSelected ? 1000 : 1;
  const shadow = isSelected ? "box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.3);" : "box-shadow: 0 2px 4px -1px rgb(0 0 0 / 0.1);";

  const html = `
    <div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 2px solid white;
      transform: ${scale};
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      ${shadow}
    ">
      <div style="width: 6px; height: 6px; background-color: white; border-radius: 50%;"></div>
    </div>
    <div style="
      width: 2px;
      height: 8px;
      background-color: ${color};
      margin: -2px auto 0 auto;
    "></div>
  `;

  return L.divIcon({
    html,
    className: "custom-leaflet-marker",
    iconSize: [24, 32],
    iconAnchor: [12, 32],
    popupAnchor: [0, -32],
  });
};

function MapEffectHandler({ issuesList, selectedIssueId }: { issuesList: Issue[], selectedIssueId?: string }) {
  const map = useMap();

  useEffect(() => {
    if (selectedIssueId) {
      const issue = issuesList.find(i => i.id === selectedIssueId);
      if (issue && !isNaN(issue.location.lat) && !isNaN(issue.location.lng)) {
        map.flyTo([issue.location.lat, issue.location.lng], 16, { duration: 1.5 });
      }
    }
  }, [selectedIssueId, issuesList, map]);

  return (
    <div className="absolute right-3 top-3 sm:right-4 sm:top-4 z-[1000]">
      <MapControls
        onZoomIn={() => map.zoomIn()}
        onZoomOut={() => map.zoomOut()}
        onLocate={() => {
          map.locate().on("locationfound", function (e) {
            map.flyTo(e.latlng, map.getZoom());
          });
        }}
      />
    </div>
  );
}

export function LiveMap({ issuesList = [], onPinClick, selectedIssueId, className }: LiveMapProps) {
  const [center, setCenter] = useState<[number, number]>(getMapCenter(issuesList));
  
  useEffect(() => {
    if (issuesList.length > 0) {
      setCenter(getMapCenter(issuesList));
    }
  }, [issuesList.length]);

  return (
    <div className={cn("w-full h-full relative z-0", className)}>
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapEffectHandler issuesList={issuesList} selectedIssueId={selectedIssueId} />
        
        {issuesList.map((issue) => {
          if (isNaN(issue.location.lat) || isNaN(issue.location.lng)) return null;
          
          const isSelected = selectedIssueId === issue.id;
          
          return (
            <Marker
              key={issue.id}
              position={[issue.location.lat, issue.location.lng]}
              icon={createCategoryIcon(issue.category, isSelected)}
              eventHandlers={{
                click: () => {
                  if (onPinClick) onPinClick(issue);
                },
              }}
            />
          );
        })}
      </MapContainer>
      
      <div className="absolute bottom-1 right-1 text-[9px] text-gray-500/80 bg-white/50 px-1 py-0.5 rounded select-none pointer-events-none z-[1000]">
        Real-time Live Data
      </div>
    </div>
  );
}
