"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CATEGORIES } from "@/lib/constants";
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
  const [submitted, setSubmitted] = useState(false);

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedCategory !== null;
      case 2:
        return address.length > 0;
      case 3:
        return title.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
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
            <Input
              placeholder="Enter address or intersection..."
              icon={<MapPin size={16} />}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mb-4"
            />
            {/* Map picker placeholder */}
            <Card padding="none" className="overflow-hidden h-[300px] sm:h-[400px]">
              <div className="w-full h-full bg-[#f2efe9] flex items-center justify-center relative">
                <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <defs>
                    <pattern id="loc-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                      <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#e8e4dd" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#loc-grid)" />
                </svg>
                {/* Center pin */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg border-3 border-white">
                    <MapPin size={20} className="text-white" />
                  </div>
                  <div className="w-1 h-3 bg-blue-600 -mt-1" />
                  <div className="w-3 h-3 rounded-full bg-blue-600/20 -mt-0.5" />
                </div>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-gray-200">
                  <span className="text-[12px] text-gray-600 font-medium">
                    Tap to place pin
                  </span>
                </div>
              </div>
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
                  Title
                </label>
                <Input
                  placeholder="e.g., Large pothole on Main Street"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-small font-medium text-gray-700 mb-1.5">
                  Description
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
                <div className="flex gap-3">
                  <button className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors cursor-pointer">
                    <Camera size={20} />
                    <span className="text-[10px] font-medium">Photo</span>
                  </button>
                  <button className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors cursor-pointer">
                    <Upload size={20} />
                    <span className="text-[10px] font-medium">Upload</span>
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
            <Button onClick={handleSubmit}>
              <Check size={16} />
              Submit Report
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
