'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // On internal pages, we always want the "scrolled" (solid/dark) look for visibility
  const isSticky = scrolled || !isHome;

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      isSticky 
        ? "bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm py-2" 
        : "bg-transparent py-6"
    }`}>
      <div className="flex items-center px-4 max-w-7xl mx-auto h-12">
        <Link href="/" className="font-black text-2xl mr-10 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-80 transition-opacity">
          ProcureAI
        </Link>
        <div className="flex items-center space-x-8 text-[11px] font-black uppercase tracking-[0.2em]">
          <Link 
            href="/dashboard" 
            className={`transition-all hover:text-blue-600 ${isSticky ? "text-gray-900" : "text-white"}`}
          >
            Dashboard
          </Link>
          <Link 
            href="/procurement" 
            className={`transition-all hover:text-blue-600 ${isSticky ? "text-gray-900" : "text-white"}`}
          >
            New Task
          </Link>
          <Link 
            href="/employees" 
            className={`transition-all hover:text-blue-600 ${isSticky ? "text-gray-900" : "text-white"}`}
          >
            Employees
          </Link>
          <Link 
            href="/car-factory" 
            className={`transition-all hover:text-blue-600 ${isSticky ? "text-gray-900" : "text-white"}`}
          >
            Car Factory
          </Link>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          
          {!isSticky && (
             <Link href="/procurement">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white border-none shadow-lg shadow-blue-500/20 px-6 font-bold text-xs">
                  Get Started
                </Button>
             </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
