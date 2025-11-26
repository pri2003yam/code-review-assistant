'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Code2, BarChart3 } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and brand */}
          <Link href="/" className="flex items-center gap-2">
            <Code2 className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">CodeReview AI</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 font-medium transition"
            >
              Home
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition"
            >
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
