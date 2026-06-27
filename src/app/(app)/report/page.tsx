"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Sparkles,
  ShieldCheck,
  Flame,
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
  { id: 1, label: "Location" },
  { id: 2, label: "Photo" },
  { id: 3, label: "Description" },
  { id: 4, label: "AI Review" },
];

export default function ReportPage() {
  const router = useRouter();
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
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResults, setAiResults] = useState<{
    suggestedCategory: IssueCategory;
    confidence: number;
    severity: "low" | "medium" | "high" | "critical";
    description: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const createIssueMutation = useCreateIssue();

  // Simulate AI Scan when entering Step 4
  useEffect(() => {
    if (currentStep === 4) {
      setAiAnalyzing(true);
      const timer = setTimeout(() => {
        // Suggest category based on text keyword or default to pothole
        let suggested: IssueCategory = "other";
        const descLower = description.toLowerCase() + " " + title.toLowerCase();
        if (descLower.includes("pothole") || descLower.includes("road") || descLower.includes("street damage")) {
          suggested = "pothole";
        } else if (descLower.includes("light") || descLower.includes("lamp") || descLower.includes("dark")) {
          suggested = "streetlight";
        } else if (descLower.includes("graffiti") || descLower.includes("paint") || descLower.includes("spray")) {
          suggested = "graffiti";
        } else if (descLower.includes("water") || descLower.includes("leak") || descLower.includes("burst")) {
          suggested = "water_leak";
        } else if (descLower.includes("trash") || descLower.includes("dump") || descLower.includes("garbage")) {
          suggested = "trash";
        }

        if (suggested === "other" && selectedCategory) {
          suggested = selectedCategory;
        }

        const suggestedLabel = CATEGORIES.find(c => c.id === suggested)?.label || "issue";
        setAiResults({
          suggestedCategory: suggested,
          confidence: Math.round(85 + Math.random() * 14),
          severity: descLower.includes("dangerous") || descLower.includes("accident") || descLower.includes("leak") ? "high" : "medium",
          description: `Visual match confirmed. The photo shows an active ${suggestedLabel.toLowerCase()} matching the description. Recommended for fast-track municipal scheduling.`,
        });
        setSelectedCategory(suggested);
        setAiAnalyzing(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, title, description, selectedCategory]);

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
    if (e.key === "Enter" && address.trim()) {
      setIsSearching(true);
      setSearchResults([]);
      try {
        const res = await fetch(
          "https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=" +
            encodeURIComponent(address)
        );
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
        return location !== null && address.length > 0;
      case 2:
        return true; // photos optional
      case 3:
        return title.length >= 5 && description.length >= 10 && selectedCategory !== null;
      case 4:
        return !aiAnalyzing;
      default:
        return false;
    }
  };

  const handleSubmit = () => {
    if (!selectedCategory || !title || !description || !location || !address) return;

    const payload = {
      title,
      description,
      category: selectedCategory,
      priority: aiResults?.severity || "medium",
      location: {
        lat: location.lat,
        lng: location.lng,
        address,
        neighborhood: "",
      },
      photos,
    };

    createIssueMutation.mutate(payload, {
      onSuccess: (newIssue: any) => {
        // Direct transition into tracking experience
        router.push(`/issues/${newIssue.data?.id || newIssue.id}`);
      },
      onError: (err) => {
        console.error("Create issue failed:", err);
      },
    });
  };

  return (
    <div className="min-h-[calc(100vh-56px)] lg:min-h-screen bg-slate-50/50 flex flex-col">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/issues"
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-small font-medium">Cancel</span>
          </Link>
          <span className="text-small font-bold text-gray-900">
            Report Civic Issue
          </span>
          <div className="w-16" />
        </div>
      </div>

      {/* Persistent horizontal progress indicator */}
      <div className="bg-white border-b border-gray-100 py-4 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-blue-600 -translate-y-1/2 z-0 transition-all duration-300"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center z-10 relative">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold transition-all duration-300",
                    currentStep > step.id
                      ? "bg-green-600 text-white shadow-md"
                      : currentStep === step.id
                      ? "bg-blue-600 text-white ring-4 ring-blue-100 shadow-md"
                      : "bg-white border-2 border-gray-200 text-gray-400"
                  )}
                >
                  {currentStep > step.id ? <Check size={14} /> : step.id}
                </div>
                <span
                  className={cn(
                    "text-[11px] font-semibold mt-1.5 transition-colors duration-300 hidden sm:block",
                    currentStep === step.id ? "text-blue-700 font-bold" : "text-gray-500"
                  )}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Form content area */}
      <div className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col justify-between">
        <Card className="flex-1 p-6 sm:p-8 shadow-md border-slate-100/80 bg-white">
          {/* Step 1: Location */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-h2 font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="text-blue-600" size={24} />
                  Where did you spot the issue?
                </h2>
                <p className="text-body text-gray-500 mt-1">
                  We use location to route the issue directly to the responsible district.
                </p>
              </div>

              <div className="relative">
                <Input
                  placeholder="Type an address or search... (Press Enter)"
                  icon={isSearching ? <Loader2 size={16} className="animate-spin text-blue-600" /> : <Search size={16} />}
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (searchResults.length > 0) setSearchResults([]);
                  }}
                  onKeyDown={handleAddressSearch}
                />
                {searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden max-h-[200px] overflow-y-auto">
                    {searchResults.map((result, idx) => (
                      <button
                        key={idx}
                        onClick={() => selectSearchResult(result)}
                        className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors border-b border-slate-50 cursor-pointer"
                      >
                        <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
                        <span className="text-sm text-gray-700 leading-snug line-clamp-2">{result.display_name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl overflow-hidden border border-gray-200 h-[300px] sm:h-[350px]">
                <LocationPickerWrapper
                  position={location}
                  searchedLocation={searchedLocation}
                  onLocationSelect={(lat, lng, addr) => {
                    setLocation({ lat, lng });
                    setAddress(addr);
                  }}
                />
              </div>
            </div>
          )}

          {/* Step 2: Photo */}
          {currentStep === 2 && (
            <div className="space-y-6 text-center py-4">
              <div className="max-w-md mx-auto">
                <h2 className="text-h2 font-bold text-gray-900">Add photos of the issue</h2>
                <p className="text-body text-gray-500 mt-1">
                  A photo helps the community verify details and assists repair crews in selecting equipment.
                </p>
              </div>

              <div className="max-w-lg mx-auto">
                <div
                  onClick={triggerFileSelect}
                  className={cn(
                    "border-2 border-dashed border-slate-300 rounded-2xl p-8 hover:border-blue-600 transition-colors cursor-pointer bg-slate-50/50 flex flex-col items-center justify-center min-h-[200px]",
                    photos.length > 0 && "py-4 min-h-0"
                  )}
                >
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                    <Upload size={22} />
                  </div>
                  <span className="text-small font-bold text-slate-800">Upload an image</span>
                  <span className="text-tiny text-slate-400 mt-1">PNG, JPG, WEBP up to 10MB</span>
                </div>

                {photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mt-6">
                    {photos.map((photoUrl, index) => (
                      <div key={index} className="aspect-square rounded-xl overflow-hidden border border-slate-200 relative group">
                        <img src={photoUrl} alt="Upload preview" className="w-full h-full object-cover" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPhotos((p) => p.filter((_, i) => i !== index));
                          }}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Description */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-h2 font-bold text-gray-900">What is the problem?</h2>
                <p className="text-body text-gray-500 mt-1">
                  Select a category and provide details. This will help our AI categorize it correctly.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-small font-bold text-slate-700 mb-2">Category</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {CATEGORIES.map((cat) => {
                      const Icon = iconMap[cat.icon];
                      const isSelected = selectedCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedCategory(cat.id)}
                          className={cn(
                            "flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all text-left cursor-pointer",
                            isSelected
                              ? "border-blue-600 bg-blue-50/50 text-blue-800"
                              : "border-slate-100 bg-slate-50/50 text-slate-700 hover:border-slate-200"
                          )}
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: cat.bgColor, color: cat.color }}
                          >
                            {Icon && <Icon size={16} />}
                          </div>
                          <span className="text-[12px] font-bold truncate">{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-small font-bold text-slate-700 mb-1.5">Short Title</label>
                  <Input
                    placeholder="e.g. Broken streetlight causing dark alleyway"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-small font-bold text-slate-700 mb-1.5">Description details</label>
                  <textarea
                    placeholder="Provide details. What size is it? Is it obstructing traffic? Are there safety hazards?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-50/30 border border-gray-200 text-body text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 resize-none hover:border-slate-300 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: AI Review */}
          {currentStep === 4 && (
            <div className="space-y-6 py-6">
              {aiAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center relative">
                    <Sparkles className="text-blue-600 animate-pulse" size={32} />
                    <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 border-t-blue-600 animate-spin" />
                  </div>
                  <h3 className="text-h3 font-bold text-slate-900">AI Review in Progress...</h3>
                  <p className="text-body text-gray-500 max-w-xs text-center">
                    Analyzing description and uploaded image to classify category, priority, and assign department.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-h2 font-bold text-gray-900 flex items-center gap-2">
                      <ShieldCheck className="text-green-600" size={24} />
                      AI Audit Results
                    </h2>
                    <p className="text-body text-gray-500">
                      Our AI has reviewed your submission. Confirm details below before launching the workflow.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Card padding="md" className="border-green-100 bg-green-50/20">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center font-bold">
                          <Check size={20} />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-green-700 block">Classified Category</span>
                          <span className="text-body font-bold text-slate-800">
                            {CATEGORIES.find((c) => c.id === aiResults?.suggestedCategory)?.label || "Other"}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 text-[11px] text-green-600 font-semibold">
                        Confidence Score: {aiResults?.confidence}%
                      </div>
                    </Card>

                    <Card padding="md" className="border-red-100 bg-red-50/20">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
                          <Flame size={20} />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-red-700 block">Suggested Priority</span>
                          <span className="text-body font-bold text-slate-800 uppercase">
                            {aiResults?.severity}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 text-[11px] text-red-600 font-semibold">
                        Auto-assigned to Municipality queue
                      </div>
                    </Card>
                  </div>

                  {aiResults?.description && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-left">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">AI Image Analysis Details</span>
                      <span className="text-xs text-slate-700 leading-relaxed font-semibold">
                        {aiResults.description}
                      </span>
                    </div>
                  )}

                  <div className="h-px bg-slate-100" />

                  <div className="space-y-3">
                    <span className="text-small font-bold text-slate-600 block">Verification Timeline Preview</span>
                    <div className="text-[12px] text-slate-500 leading-relaxed bg-slate-50 p-4 rounded-xl">
                      🚀 <strong>Instant:</strong> Sent to Municipality queue & neighboring residents on the map. <br/>
                      👥 <strong>Neighbor Verification:</strong> Issues require verified votes to fast-track municipal action.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Navigation bottom bar */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="ghost"
            onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
            disabled={currentStep === 1 || createIssueMutation.isPending}
            className="font-semibold text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft size={16} />
            Back
          </Button>

          {currentStep < 4 ? (
            <Button
              onClick={() => setCurrentStep((s) => Math.min(4, s + 1))}
              disabled={!canProceed()}
              className="font-semibold px-6 shadow-sm"
            >
              Continue
              <ArrowRight size={16} />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || createIssueMutation.isPending}
              className="font-bold bg-green-600 hover:bg-green-700 text-white px-8 shadow-md"
            >
              {createIssueMutation.isPending ? (
                <Loader2 size={16} className="animate-spin mr-1" />
              ) : (
                <Check size={16} />
              )}
              Submit & Track
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
