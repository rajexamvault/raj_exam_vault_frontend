"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import ExamVaultsSection from "@/components/landing/ExamVaultsSection";
import PyqVaultSection from "@/components/landing/PyqVaultSection";
import TopperNotesSection from "@/components/landing/TopperNotesSection";
import SyllabusExplorerSection from "@/components/landing/SyllabusExplorerSection";
import MockTestSection from "@/components/landing/MockTestSection";
import CurrentAffairsSection from "@/components/landing/CurrentAffairsSection";
import ValuePillarsSection from "@/components/landing/ValuePillarsSection";
import FaqSection from "@/components/landing/FaqSection";
import CtaBannerSection from "@/components/landing/CtaBannerSection";
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
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-[#e62e3d] selection:text-white relative flex flex-col justify-between">
      {/* Top Navbar */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

      {/* Destination Exam Vaults (8 Featured Exams) */}
      <ExamVaultsSection />

      {/* The PYQ Vault Explorer */}
      <PyqVaultSection onOpenPreview={handleOpenPreview} />

      {/* Topper's Notebook Collection */}
      <TopperNotesSection onOpenPreview={handleOpenPreview} />

      {/* Interactive Syllabus Explorer */}
      <SyllabusExplorerSection />

      {/* Mock Test CBT Practice Series */}
      <MockTestSection />

      {/* Monthly Current Affairs & Magazine Digest */}
      <CurrentAffairsSection />

      {/* 4 Value Pillars */}
      <ValuePillarsSection />

      {/* FAQ Accordion */}
      <FaqSection />

      {/* Bottom CTA Banner */}
      <CtaBannerSection />

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
