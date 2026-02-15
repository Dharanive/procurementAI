import { cn } from "@/lib/utils";
import {
  IconTerminal2,
  IconEaseInOut,
  IconCurrencyDollar,
  IconCloud,
  IconRouteAltLeft,
  IconHelp,
  IconAdjustmentsBolt,
  IconHeart,
  IconBrain,
  IconBolt,
  IconUsers,
  IconBriefcase,
  IconCar,
  IconTruck,
  IconPackage,
  IconActivity,
// @ts-ignore
} from "@tabler/icons-react";

export function FeaturesSection() {
  const features = [
    {
      title: "AI-Powered Decisions",
      description:
        "LangGraph multi-agent systems use GPT-4o-mini to make intelligent, context-aware assignments.",
      icon: <IconBrain className="w-8 h-8 text-blue-500" />,
    },
    {
      title: "Auto-Pilot Allocation",
      description:
        "Stop manual scheduling. Agents find free employees and assign tasks as soon as stock levels drop.",
      icon: <IconBolt className="w-8 h-8 text-yellow-500" />,
    },
    {
      title: "Real-time Analytics",
      description:
        "Full visibility into employee capacity, utilization, and real-time task progress.",
      icon: <IconActivity className="w-8 h-8 text-green-500" />,
    },
    {
      title: "Explainable Trace",
      description: "Agents provide high-quality natural language reasoning for every decision they make.",
      icon: <IconBriefcase className="w-8 h-8 text-orange-500" />,
    },
    {
      title: "Car Factory Hub",
      description: "Specialized monitoring for automotive manufacturing with autonomous parts replenishment.",
      icon: <IconCar className="w-8 h-8 text-indigo-500" />,
    },
    {
      title: "Vendor Optimization",
      description:
        "AI evaluates vendor reliability, specialization, and lead times for every car part.",
      icon: <IconTruck className="w-8 h-8 text-red-500" />,
    },
    {
      title: "Inventory Sentries",
      description:
        "Autonomous agents monitor stock thresholds 24/7 and trigger procurement workflows.",
      icon: <IconPackage className="w-8 h-8 text-purple-500" />,
    },
    {
      title: "Seamless Integration",
      description: "Connected flows between Inventory, Vendors, Tasks, and Workforce management.",
      icon: <IconRouteAltLeft className="w-8 h-8 text-teal-500" />,
    },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10 py-10 max-w-7xl mx-auto">
      {features.map((feature, index) => (
        <Feature key={feature.title} {...feature} index={index} />
      ))}
    </div>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r py-10 relative group/feature dark:border-neutral-800",
        (index === 0 || index === 4) && "lg:border-l dark:border-neutral-800",
        index < 4 && "lg:border-b dark:border-neutral-800"
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-neutral-600 dark:text-neutral-400">
        {icon}
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-blue-500 transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-800 dark:text-neutral-100 uppercase tracking-wider text-sm">
          {title}
        </span>
      </div>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-xs relative z-10 px-10 leading-relaxed">
        {description}
      </p>
    </div>
  );
};
