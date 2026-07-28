'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface FAQItemProps {
  question: string;
  answer: string;
}

export function FAQItem({ question, answer }: FAQItemProps) {
  return (
    <details className="group border border-border/80 rounded-xl bg-card p-4 my-3 transition-all duration-200 open:bg-muted/20">
      <summary className="font-semibold text-foreground cursor-pointer flex items-center justify-between list-none select-none outline-none">
        <span className="flex-1 pr-2 text-base font-semibold">{question}</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180 flex-shrink-0 ml-2" />
      </summary>
      <div className="mt-3 pt-3 border-t border-border/40 text-muted-foreground text-sm leading-relaxed">
        {answer}
      </div>
    </details>
  );
}
