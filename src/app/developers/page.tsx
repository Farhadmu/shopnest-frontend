import type { Metadata } from "next";
import { DeveloperHero } from "@/components/developers/DeveloperHero";
import { DeveloperNetworkVisualization } from "@/components/developers/DeveloperNetworkVisualization";
import { DeveloperGrid } from "@/components/developers/DeveloperGrid";
import { DeveloperRoleDomains } from "@/components/developers/DeveloperRoleDomains";
import { DeveloperTechStack } from "@/components/developers/DeveloperTechStack";
import { DeveloperEngineeringFlow } from "@/components/developers/DeveloperEngineeringFlow";
import { DeveloperCta } from "@/components/developers/DeveloperCta";

export const metadata: Metadata = {
  title: "Meet the Developers | ShopNest",
  description:
    "Meet the engineering team behind ShopNest — six developers building a next-generation AI-powered multi-vendor commerce platform.",
};

export default function DevelopersPage() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      {/* 1. Hero Section & Stats */}
      <DeveloperHero />

      {/* 2. Flagship Interactive Collaboration Mesh */}
      <DeveloperNetworkVisualization />

      {/* 3. Detailed Team Profiles Grid */}
      <DeveloperGrid />

      {/* 4. Engineering Role Pillars */}
      <DeveloperRoleDomains />

      {/* 5. Production Engineering Stack */}
      <DeveloperTechStack />

      {/* 6. End-to-End Build Pipeline */}
      <DeveloperEngineeringFlow />

      {/* 7. Final Call to Action */}
      <DeveloperCta />
    </div>
  );
}
