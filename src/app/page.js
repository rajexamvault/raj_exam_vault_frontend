"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import StatsTrustSection from "@/components/landing/StatsTrustSection";
import MainGridSection from "@/components/landing/MainGridSection";
import BottomPromoSection from "@/components/landing/BottomPromoSection";
import Footer from "@/components/layout/Footer";
import PreviewModal from "@/components/landing/PreviewModal";

export default function HomePage() {
  const [selectedResource, setSelectedResource] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleOpenPreview = (resource) => {
    setSelectedResource(resource);
    setPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setSelectedResource(null);
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-[#d32f2f] selection:text-white relative flex flex-col justify-between">
      {/* Top Navbar */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

      {/* 6-Chip Trust/Feature Bar */}
      <StatsTrustSection />

      {/* Main 3-Column Grid: Popular Exams, Best Seller PYQs, Free Resources */}
      <MainGridSection onOpenPreview={handleOpenPreview} />

      {/* Bottom Promo & Testimonial Section */}
      <BottomPromoSection />

      {/* Footer */}
      <Footer />

      {/* Details & PDF Preview Modal */}
      <PreviewModal
        isOpen={previewOpen}
        onClose={handleClosePreview}
        resource={selectedResource}
      />
    </main>
  );
}
