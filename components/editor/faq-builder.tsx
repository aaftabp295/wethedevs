'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { HelpCircle, Plus, Trash2, ArrowUp, ArrowDown, CheckCircle2, Sparkles } from 'lucide-react';

export interface FAQItemData {
  id: string;
  question: string;
  answer: string;
}

interface FAQBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  faqs: FAQItemData[];
  onSaveFaqs: (faqs: FAQItemData[]) => void;
}

export function FAQBuilderModal({
  open,
  onOpenChange,
  faqs: initialFaqs,
  onSaveFaqs,
}: FAQBuilderProps) {
  const [items, setItems] = React.useState<FAQItemData[]>([]);

  // Reset items when modal opens
  React.useEffect(() => {
    if (open) {
      setItems(
        initialFaqs.length > 0
          ? initialFaqs.map((f) => ({ ...f, id: f.id || Math.random().toString(36).substring(2, 9) }))
          : [
              {
                id: Math.random().toString(36).substring(2, 9),
                question: '',
                answer: '',
              },
            ]
      );
    }
  }, [open, initialFaqs]);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: Math.random().toString(36).substring(2, 9),
        question: '',
        answer: '',
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const updated = [...items];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setItems(updated);
  };

  const handleChange = (id: string, field: 'question' | 'answer', value: string) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleSave = () => {
    const validItems = items.filter(
      (item) => item.question.trim() && item.answer.trim()
    );
    onSaveFaqs(validItems);
    onOpenChange(false);
  };

  const validCount = items.filter((i) => i.question.trim() && i.answer.trim()).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl w-full p-6 space-y-4 overflow-hidden rounded-xl border border-border bg-background shadow-xl max-h-[85vh] flex flex-col">
        <DialogHeader className="space-y-1 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <HelpCircle className="h-5 w-5 text-emerald-500" />
            <span>Article FAQ Builder</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Add questions & answers. They will be automatically rendered at the bottom of your article and indexed into Google <strong className="text-foreground font-mono font-medium">FAQPage</strong> JSON-LD schema for rich search results.
          </DialogDescription>
        </DialogHeader>

        {/* Status Badge */}
        <div className="flex items-center justify-between bg-muted/50 border border-border p-2.5 rounded-lg shrink-0">
          <div className="flex items-center gap-2 text-xs">
            <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
            <span className="font-medium text-foreground">
              {validCount} valid FAQ {validCount === 1 ? 'item' : 'items'} ready for Google Rich Snippets
            </span>
          </div>
          {validCount > 0 && (
            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> SEO Ready
            </span>
          )}
        </div>

        {/* Scrollable List of FAQ Inputs */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="p-4 rounded-lg border border-border bg-card space-y-3 relative group transition-colors hover:border-border/80 shadow-2xs"
            >
              <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-2">
                <span className="text-xs font-mono font-semibold text-muted-foreground">
                  Question #{index + 1}
                </span>

                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={index === 0}
                    onClick={() => handleMoveItem(index, 'up')}
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    title="Move Up"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={index === items.length - 1}
                    onClick={() => handleMoveItem(index, 'down')}
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    title="Move Down"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(item.id)}
                    className="h-6 w-6 text-destructive hover:bg-destructive/10"
                    title="Remove Question"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground block">
                  Question
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Is there a free tier available?"
                  value={item.question}
                  onChange={(e) => handleChange(item.id, 'question', e.target.value)}
                  className="text-xs w-full"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground block">
                  Answer
                </label>
                <Textarea
                  placeholder="Provide a clear, detailed answer..."
                  value={item.answer}
                  onChange={(e) => handleChange(item.id, 'answer', e.target.value)}
                  className="text-xs min-h-[70px] resize-y w-full leading-relaxed"
                />
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddItem}
            className="w-full border-dashed gap-1.5 text-xs text-muted-foreground hover:text-foreground h-9"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Another FAQ Question</span>
          </Button>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="flex items-center justify-between sm:justify-between pt-3 border-t border-border/50 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs h-8"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            className="text-xs font-semibold h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Save FAQs to Article
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
