'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Menu, X } from 'lucide-react';
import { NotificationCenter } from '@/components/NotificationCenter';
import { TextRotate } from "@/components/ui/text-rotate";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when shifting pages
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // On internal pages, we always want the "scrolled" (solid/dark) look for visibility
  const isSticky = scrolled || !isHome || mobileMenuOpen;

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/procurement', label: 'New Task' },
    { href: '/employees', label: 'Employees' },
    { href: '/car-factory', label: 'Car Factory' },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      isSticky 
        ? "bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm py-2" 
        : "bg-transparent py-6"
    }`}>
      <div className="flex items-center px-4 md:px-6 max-w-7xl mx-auto h-12">
        <div className="w-54 flex-shrink-0">
          <Link href="/" className="flex items-center font-black text-2xl hover:opacity-80 transition-opacity whitespace-nowrap py-1">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Procure
            </span>
            <TextRotate
              texts={["AI", "SaaS", "Hub", "Fast", "Agentic"]}
              rotationInterval={2500}
              mainClassName="ml-2 px-2 bg-blue-600 text-white rounded-lg overflow-hidden py-0.5 text-xl"
              staggerDuration={0.03}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-120%" }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              splitLevelClassName="overflow-hidden"
            />
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8 text-[11px] font-black uppercase tracking-[0.2em]">
          {navLinks.map((link) => (
            <Link 
              key={link.href}
              href={link.href} 
              className={`transition-all hover:text-blue-600 ${isSticky ? "text-gray-900" : "text-white"}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="ml-auto flex items-center space-x-4">
          <NotificationCenter />
          <div className="hidden md:block">
            {!isSticky && (
               <Link href="/procurement">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white border-none shadow-lg shadow-blue-500/20 px-6 font-bold text-xs">
                    Get Started
                  </Button>
               </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className={`md:hidden p-2 transition-colors ${isSticky ? "text-gray-900" : "text-white"}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
        mobileMenuOpen ? "max-h-[400px] opacity-100 border-b border-gray-100 bg-white shadow-xl" : "max-h-0 opacity-0"
      }`}>
        <div className="px-6 py-8 flex flex-col space-y-6">
          {navLinks.map((link, i) => (
            <Link 
              key={link.href}
              href={link.href} 
              className="text-sm font-black uppercase tracking-[0.25em] text-gray-900 hover:text-blue-600 transition-all flex items-center justify-between group"
              style={{ transitionDelay: `${i * 50}ms` }}
            >
              <span>{link.label}</span>
              <div className="h-px w-0 group-hover:w-8 bg-blue-600 transition-all duration-300"></div>
            </Link>
          ))}
          <div className="pt-4 border-t border-gray-100">
            <Link href="/procurement">
              <Button size="lg" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-none shadow-lg shadow-blue-500/20 font-bold text-sm h-12">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
