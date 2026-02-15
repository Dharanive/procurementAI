import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Users, Briefcase, Brain, Zap } from "lucide-react";
import ShaderBackground from "@/components/ShaderBackground";
import { FeaturesSection } from "@/components/FeaturesSection";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative flex-1 flex items-center justify-center min-h-screen overflow-hidden">
        <ShaderBackground />
        <div className="container px-4 md:px-6 py-24 md:py-32 relative z-10">
          <div className="flex flex-col items-center space-y-8 text-center">
            <div className="space-y-4 max-w-3xl">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 drop-shadow-sm">
                  ProcureAI
                </span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-100 md:text-xl font-medium drop-shadow-md">
                Multi-Agent Smart Procurement System powered by AI. Automatically assign procurement tasks to the best employees based on skills and availability.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/procurement">
                <Button size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white border-none shadow-lg shadow-blue-500/20">
                  Create Task <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="text-white border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black tracking-tight sm:text-5xl md:text-6xl text-gray-900 dark:text-white uppercase italic">
              Key Capabilities
            </h2>
            <p className="mt-4 text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium">
              A high-precision orchestration layer for modern industrial operations.
            </p>
          </div>
          <FeaturesSection />
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              How It Works
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold">Create Task</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Define procurement task with required skills, estimated hours, and priority
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold">AI Analysis</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Multi-agent system analyzes workforce and calculates optimal assignment
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold">Auto Assign</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Task automatically assigned to best employee with full reasoning
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-6 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Ready to Get Started?
            </h2>
            <p className="max-w-[600px] text-blue-100 md:text-xl">
              Experience the power of AI-driven procurement task management
            </p>
            <Link href="/procurement">
              <Button size="lg" variant="secondary" className="gap-2">
                Create Your First Task <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
