"use client";

import * as React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

// Define the type for a single milestone
interface Milestone {
  id: number;
  name: string;
  status: "complete" | "in-progress" | "pending";
  position: {
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
  };
}

// Define the props for the AnimatedRoadmap component
interface AnimatedRoadmapProps extends React.HTMLAttributes<HTMLDivElement> {
  milestones: Milestone[];
  mapImageSrc: string; // Add a prop for the map background image
}

// Sub-component for a single milestone marker
const MilestoneMarker = ({ milestone }: { milestone: Milestone }) => {
  const statusClasses = {
    complete: "bg-green-500 border-green-700",
    "in-progress": "bg-blue-400 border-blue-600",
    pending: "bg-slate-400 border-slate-500",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        duration: 1.2, 
        delay: milestone.id * 0.4, 
        ease: [0.22, 1, 0.36, 1] // Custom slow ease-out
      }}
      viewport={{ once: true, amount: 0.5 }}
      className="absolute flex items-center gap-4 group"
      style={milestone.position}
    >
      <div className="relative flex h-10 w-10 items-center justify-center">
        {/* Blinking outer ring */}
        <motion.div 
          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute h-full w-full rounded-full bg-primary/20" 
        />
        
        {/* Status point */}
        <motion.div
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className={cn(
            "relative h-4 w-4 rounded-full border-2 z-10 shadow-[0_0_10px_rgba(0,0,0,0.1)]",
            statusClasses[milestone.status]
          )}
        />
      </div>
      <div className="rounded-full border bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-5 py-2.5 text-sm font-semibold text-foreground shadow-xl border-white/20 group-hover:scale-105 transition-transform duration-300">
        {milestone.name}
      </div>
    </motion.div>
  );
};

// Main AnimatedRoadmap component
const AnimatedRoadmap = React.forwardRef<HTMLDivElement, AnimatedRoadmapProps>(
  ({ className, milestones, mapImageSrc, ...props }, ref) => {
    const targetRef = React.useRef<HTMLDivElement>(null);

    return (
      <div
        ref={targetRef}
        className={cn("relative w-full max-w-4xl mx-auto py-8", className)}
        {...props}
      >
        {/* Background map image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.2 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <img
            src={mapImageSrc}
            alt="Product roadmap map"
            className="w-full h-full object-contain max-h-[450px]"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=1280";
            }}
          />
        </motion.div>

        {/* Milestone Container */}
        <div className="relative h-[400px]">
          {/* Render each milestone */}
          {milestones.map((milestone) => (
            <MilestoneMarker key={milestone.id} milestone={milestone} />
          ))}
        </div>
      </div>
    );
  }
);

AnimatedRoadmap.displayName = "AnimatedRoadmap";

export { AnimatedRoadmap };
