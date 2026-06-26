"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CATEGORIES } from "@/lib/constants";
import { useCreateIssue } from "@/hooks/use-issues";
import { uploadApi } from "@/services/upload.api";
import { LocationPickerWrapper } from "@/components/map/location-picker-wrapper";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  MapPin,
  Camera,
  Upload,
  CircleAlert,
  Lightbulb,
  PaintBucket,
  Droplets,
  Footprints,
  Trash2,
  Volume2,
  TriangleAlert,
  Waves,
  Trees,
  MessageCircle,
  Loader2,
  Search,
} from "lucide-react";
import Link from "next/link";
import type { IssueCategory } from "@/lib/types";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  "circle-alert": CircleAlert,
  lightbulb: Lightbulb,
  "paint-bucket": PaintBucket,
  droplets: Droplets,
  footprints: Footprints,
  "trash-2": Trash2,
  "volume-2": Volume2,
  "triangle-alert": TriangleAlert,
  waves: Waves,
  trees: Trees,
  "message-circle": MessageCircle,
};

const steps = [
  { id: 1, label: "Category" },
  { id: 2, label: "Location" },
  { id: 3, label: "Details" },
  { id: 4, label: "Review" },
];

export default function ReportPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<IssueCategory | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchedLocation, setSearchedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const createIssueMutation = useCreateIssue();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const file = files[0];
      const uploadedUrl = await uploadApi.uploadFile(file);
      setPhotos((prev) => [...prev, uploadedUrl]);
    } catch (e) {
      console.error("Failed to upload image:", e);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleAddressSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && address.trim()) {
      setIsSearching(true);
      setSearchResults([]);
      try {
        const res = await fetch("https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=" + encodeURIComponent(address));
        const data = await res.json();
        if (data && data.length > 0) {
          setSearchResults(data);
        }
      } catch (err) {
        console.error("Geocoding failed", err);
      } finally {
        setIsSearching(false);
      }
    }
  };

  const selectSearchResult = (result: { display_name: string; lat: string; lon: string }) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setLocation({ lat, lng });
    setSearchedLocation({ lat, lng });
    setAddress(result.display_name);
    setSearchResults([]);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedCategory !== null;
      case 2:
        return location !== null && address.length > 0;
      case 3:
        return title.length > 0 && description.length >= 10;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = () => {
    if (!selectedCategory || !title || !description || !location || !address) return;
    
    // Construct request matching createIssueSchema Zod validation
    const payload = {
      title,
      description,
      category: selectedCategory,
      priority: "medium", // default
      location: {
        lat: location.lat,
        lng: location.lng,
        address,
        neighborhood: "",
      },
      photos,
    };

    createIssueMutation.mutate(payload, {
      onSuccess: () => {
        setSubmitted(true);
      },
      onError: (err) => {
        console.error("Create issue failed:", err);
      }
    });
  };

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-56px)] lg:min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 mx-auto mb-6">
            <Check size={32} />
          </div>
          <h1 className="text-h1 text-gray-900 mb-2">Report Submitted</h1>
          <p className="text-body text-gray-500 mb-8">
            Thank you for making your community better. You&apos;ll receive
            updates as your report is reviewed and resolved.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/map">
              <Button className="w-full" size="lg">
                <MapPin size={18} />
                Back to Map
              </Button>
            </Link>
            <Link href="/issues">
              <Button variant="outline" className="w-full" size="lg">
                View All Issues
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-56px)] lg:min-h-screen bg-surface-secondary">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/map"
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-small font-medium">Cancel</span>
          </Link>
          <span className="text-small font-medium text-gray-900">
            Report Issue
          </span>
          <div className="w-16" />
        </div>
      </div>

      {/* Step indicator */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2">
            {steps.map((step, i) => (
              <div key={step.id} className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-2 flex-1">
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-semibold shrink-0",
                      "transition-all duration-normal",
                      currentStep > step.id
                        ? "bg-green-600 text-white"
                        : currentStep === step.id
                        ? "bg-blue-700 text-white"
                        : "bg-gray-100 text-gray-400"
                    )}
                  >
                    {currentStep > step.id ? (
                      <Check size={14} />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[12px] font-medium hidden sm:block",
                      currentStep >= step.id
                        ? "text-gray-900"
                        : "text-gray-400"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={cn(
                      "h-px flex-1",
                      currentStep > step.id ? "bg-green-600" : "bg-gray-200"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Step 1: Category */}
        {currentStep === 1 && (
          <div>
            <h2 className="text-h1 text-gray-900 mb-2">
              What type of issue?
            </h2>
            <p className="text-body text-gray-500 mb-6">
              Select the category that best describes the problem.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CATEGORIES.map((cat) => {
                const Icon = iconMap[cat.icon];
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "flex flex-col items-center gap-2.5 p-4 rounded-xl",
                      "border-2 transition-all duration-fast cursor-pointer",
                      "text-center",
                      "hover:shadow-sm",
                      isSelected
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    )}
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{
                        backgroundColor: cat.bgColor,
                        color: cat.color,
                      }}
                    >
                      {Icon && <Icon size={22} />}
                    </div>
                    <div>
                      <div className="text-small font-medium text-gray-900">
                        {cat.label}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        {cat.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Location */}
        {currentStep === 2 && (
          <div>
            <h2 className="text-h1 text-gray-900 mb-2">
              Where is the issue?
            </h2>
            <p className="text-body text-gray-500 mb-6">
              Enter the address or pin a location on the map.
            </p>
            <div className="relative mb-4">
              <Input
                placeholder="Enter address or intersection... (Press Enter to search)"
                icon={isSearching ? <Loader2 size={16} className="animate-spin text-gray-400" /> : <MapPin size={16} />}
                value={address}
                onChange={(e) => { setAddress(e.target.value); if (searchResults.length > 0) setSearchResults([]); }}
                onKeyDown={handleAddressSearch}
              />
              {searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden max-h-[240px] overflow-y-auto">
                  {searchResults.map((result, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectSearchResult(result)}
                      className={cn(
                        "w-full text-left px-4 py-3 flex items-start gap-3 cursor-pointer",
                        "transition-colors hover:bg-blue-50",
                        idx > 0 && "border-t border-gray-100"
                      )}
                    >
                      <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
                      <span className="text-sm text-gray-700 leading-snug line-clamp-2">{result.display_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Real Map Picker */}
            <Card padding="none" className="overflow-hidden h-[300px] sm:h-[400px]">
              <LocationPickerWrapper
                position={location}
                searchedLocation={searchedLocation}
                onLocationSelect={(lat, lng, addr) => {
                  setLocation({ lat, lng });
                  setAddress(addr);
                }}
              />
            </Card>
          </div>
        )}

        {/* Step 3: Details */}
        {currentStep === 3 && (
          <div>
            <h2 className="text-h1 text-gray-900 mb-2">
              Describe the issue
            </h2>
            <p className="text-body text-gray-500 mb-6">
              A clear title and description helps teams respond faster.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-small font-medium text-gray-700 mb-1.5">
                  Title (min 5 chars)
                </label>
                <Input
                  placeholder="e.g., Large pothole on Main Street"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-small font-medium text-gray-700 mb-1.5">
                  Description (min 10 chars)
                </label>
                <textarea
                  placeholder="Describe the issue, its size, and any safety concerns..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className={cn(
                    "w-full px-3 py-2.5 rounded-lg",
                    "bg-white border border-gray-200",
                    "text-body text-gray-900 placeholder:text-gray-400",
                    "transition-all duration-fast",
                    "hover:border-gray-300",
                    "focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600",
                    "resize-none"
                  )}
                />
              </div>
              <div>
                <label className="block text-small font-medium text-gray-700 mb-1.5">
                  Photos (optional)
                </label>
                <div className="flex flex-wrap gap-3">
                  {photos.map((photoUrl, index) => (
                    <div key={index} className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 relative">
                      <img src={photoUrl} alt="Upload thumbnail" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  
                  <button
                    onClick={triggerFileSelect}
                    disabled={isUploading}
                    className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors cursor-pointer"
                  >
                    {isUploading ? (
                      <Loader2 size={20} className="animate-spin text-blue-600" />
                    ) : (
                      <>
                        <Upload size={20} />
                        <span className="text-[10px] font-medium">Upload</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <div>
            <h2 className="text-h1 text-gray-900 mb-2">
              Review your report
            </h2>
            <p className="text-body text-gray-500 mb-6">
              Make sure everything looks correct before submitting.
            </p>
            <Card padding="lg" className="space-y-4">
              <div>
                <span className="text-tiny text-gray-400 block mb-1">
                  Category
                </span>
                <span className="text-body font-medium text-gray-900">
                  {CATEGORIES.find((c) => c.id === selectedCategory)?.label}
                </span>
              </div>
              <div className="h-px bg-gray-100" />
              <div>
                <span className="text-tiny text-gray-400 block mb-1">
                  Location
                </span>
                <span className="text-body text-gray-900">
                  {address || "—"}
                </span>
              </div>
              <div className="h-px bg-gray-100" />
              <div>
                <span className="text-tiny text-gray-400 block mb-1">
                  Title
                </span>
                <span className="text-body font-medium text-gray-900">
                  {title || "—"}
                </span>
              </div>
              {description && (
                <>
                  <div className="h-px bg-gray-100" />
                  <div>
                    <span className="text-tiny text-gray-400 block mb-1">
                      Description
                    </span>
                    <span className="text-small text-gray-600">
                      {description}
                    </span>
                  </div>
                </>
              )}
              {photos.length > 0 && (
                <>
                  <div className="h-px bg-gray-100" />
                  <div>
                    <span className="text-tiny text-gray-400 block mb-1">
                      Photos ({photos.length})
                    </span>
                    <div className="flex gap-2 mt-1">
                      {photos.map((photoUrl, index) => (
                        <img key={index} src={photoUrl} className="w-12 h-12 object-cover rounded-lg border border-gray-200" alt="Thumbnail" />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </Card>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <Button
            variant="ghost"
            onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
            disabled={currentStep === 1}
          >
            <ArrowLeft size={16} />
            Back
          </Button>

          {currentStep < 4 ? (
            <Button
              onClick={() => setCurrentStep((s) => Math.min(4, s + 1))}
              disabled={!canProceed()}
            >
              Continue
              <ArrowRight size={16} />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={createIssueMutation.isPending}>
              {createIssueMutation.isPending ? (
                <Loader2 size={16} className="animate-spin mr-1" />
              ) : (
                <Check size={16} />
              )}
              Submit Report
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
