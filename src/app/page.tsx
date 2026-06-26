import Link from "next/link";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollStory } from "@/components/landing/scroll-story";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">


      {/* ────────────────── Storytelling Journey ────────────────── */}
      <main className="relative">
        <ScrollStory />
      </main>

    </div>
  );
}

