'use client';

import React from 'react';
import { ResponsiveComponentSheet } from '@/components/ui-library/ResponsiveComponentSheet';
import { Container } from '@/components/ui-library/layout';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ResponsiveDemo() {
  return (
    <div className="pb-20">
      <div className="bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-950 dark:to-slate-900 py-12 mb-8">
        <Container>
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4 sm:text-4xl md:text-5xl">
              FinDoc Responsive Design Framework
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-6 dark:text-slate-300">
              A comprehensive system for building responsive layouts that work seamlessly across all device sizes
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/responsive-demo#components">View Components</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/DevDocs/RESPONSIVE_DESIGN_GUIDE.md" target="_blank">Read Documentation</Link>
              </Button>
            </div>
          </div>
        </Container>
      </div>

      <ResponsiveComponentSheet />
    </div>
  );
}