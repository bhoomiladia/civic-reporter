import Link from "next/link";
import {
  Shield,
  MapPin,
  CheckCircle2,
  Clock,
  Users,
  ArrowRight,
  ChevronRight,
  BarChart3,
  Camera,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { mockStats } from "@/lib/mock-data";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <span className="font-semibold text-gray-900 text-[15px] tracking-tight">
              CIVC Reporter
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/map">
              <Button variant="ghost" size="sm">
                Open Map
              </Button>
            </Link>
            <Link href="/report">
              <Button size="sm">Report Issue</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-2xl">
            <h1 className="text-display text-gray-900 mb-4">
              Your city,
              <br />
              your voice.
            </h1>
            <p className="text-body text-gray-500 max-w-lg mb-8 leading-relaxed">
              Report civic issues directly on the map. Track progress in real
              time. Make your neighborhood better, one report at a time.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/map">
                <Button size="lg" className="gap-2">
                  <MapPin size={18} />
                  Open Map
                  <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/report">
                <Button variant="outline" size="lg">
                  Report an Issue
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card padding="md">
            <div className="text-h2 text-gray-900 mb-0.5">
              {mockStats.totalIssuesReported.toLocaleString()}
            </div>
            <div className="text-small text-gray-500">Issues Reported</div>
          </Card>
          <Card padding="md">
            <div className="text-h2 text-gray-900 mb-0.5">
              {mockStats.issuesResolvedThisMonth}
            </div>
            <div className="text-small text-gray-500">Resolved This Month</div>
          </Card>
          <Card padding="md">
            <div className="text-h2 text-gray-900 mb-0.5">
              {mockStats.averageResponseTime}
            </div>
            <div className="text-small text-gray-500">Avg. Response Time</div>
          </Card>
          <Card padding="md">
            <div className="text-h2 text-gray-900 mb-0.5">
              {mockStats.resolutionRate}%
            </div>
            <div className="text-small text-gray-500">Resolution Rate</div>
          </Card>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="text-h1 text-gray-900 mb-2">How it works</h2>
        <p className="text-body text-gray-500 mb-8 max-w-lg">
          Three simple steps to make your community better.
        </p>

        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
          <Card padding="lg" className="relative">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700 mb-4">
              <Camera size={20} />
            </div>
            <h3 className="text-h3 text-gray-900 mb-1.5">1. Report</h3>
            <p className="text-small text-gray-500 leading-relaxed">
              Spot an issue? Drop a pin on the map, snap a photo, and describe
              what you see. It takes less than a minute.
            </p>
          </Card>

          <Card padding="lg" className="relative">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-4">
              <Bell size={20} />
            </div>
            <h3 className="text-h3 text-gray-900 mb-1.5">2. Track</h3>
            <p className="text-small text-gray-500 leading-relaxed">
              Your report is routed to the right department. Follow the progress
              with real-time status updates.
            </p>
          </Card>

          <Card padding="lg" className="relative">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 mb-4">
              <CheckCircle2 size={20} />
            </div>
            <h3 className="text-h3 text-gray-900 mb-1.5">3. Resolve</h3>
            <p className="text-small text-gray-500 leading-relaxed">
              City teams respond and fix the issue. You get notified when it&apos;s
              done. Your city gets better.
            </p>
          </Card>
        </div>
      </section>

      {/* Community CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <Card padding="lg" className="bg-blue-700! border-blue-700! text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-h2 text-white mb-1" style={{ fontFamily: "var(--font-serif)" }}>
                Join your community
              </h2>
              <p className="text-small text-blue-200">
                {mockStats.activeReporters} active reporters are making a
                difference.
              </p>
            </div>
            <Link href="/community">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white! text-blue-700! hover:bg-blue-50! whitespace-nowrap"
              >
                <Users size={18} />
                View Community
                <ChevronRight size={16} />
              </Button>
            </Link>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-blue-700 flex items-center justify-center">
                <Shield size={12} className="text-white" />
              </div>
              <span className="text-small font-medium text-gray-900">
                CIVC Reporter
              </span>
            </div>
            <div className="flex items-center gap-6 text-small text-gray-500">
              <Link href="/map" className="hover:text-gray-900 transition-colors">
                Map
              </Link>
              <Link href="/issues" className="hover:text-gray-900 transition-colors">
                Issues
              </Link>
              <Link href="/community" className="hover:text-gray-900 transition-colors">
                Community
              </Link>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-[12px] text-gray-400">
              © 2026 CIVC Reporter. Built for better communities.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
