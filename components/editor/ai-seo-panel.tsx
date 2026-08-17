'use client';

import * as React from 'react';
import { type Editor } from '@tiptap/react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAiSeo } from '@/hooks/use-ai-seo';
import { InternalLinkSuggestion, SchemaResultItem } from '@/types/ai-seo';
import { PublishSidebarState } from '@/types/editor';
import { getPublicArticles } from '@/lib/content/manifest';
import {
  Key,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Link2,
  ExternalLink,
  Code2,
  FileText,
  ShieldCheck,
  Check,
  X,
  Copy,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

interface AiSeoPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editor: Editor | null;
  publishState: PublishSidebarState;
  onPublishStateChange: (state: PublishSidebarState) => void;
}

export function AiSeoPanel({
  open,
  onOpenChange,
  editor,
  publishState,
  onPublishStateChange,
}: AiSeoPanelProps) {
  const {
    apiKey,
    saveApiKey,
    isKeyValid,
    isValidatingKey,
    isLoading,
    activeAction,
    error,
    internalLinks,
    externalLinks,
    schemaResults,
    metaTagSuggestions,
    auditReport,
    executeAction,
    updateInternalLinkStatus,
    updateExternalLinkStatus,
  } = useAiSeo();

  const [inputKey, setInputKey] = React.useState(apiKey);
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);
  const [appliedSchemaIndex, setAppliedSchemaIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    setInputKey(apiKey);
  }, [apiKey]);

  const manifest = React.useMemo(() => {
    try {
      return getPublicArticles();
    } catch {
      return [];
    }
  }, []);

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveApiKey(inputKey);
  };

  // 1. Internal Link Callout Card Insertion (placed strictly after target context paragraph)
  const handleApplyInternalLink = (item: InternalLinkSuggestion) => {
    if (!editor) return;

    const transitionReason = item.reason ? item.reason.replace(/\.$/, '') + ',' : 'Take a look at';
    const calloutHtml = `<blockquote><p>💡 <strong>Related Guide:</strong> ${transitionReason} read our full breakdown of <a href="${item.targetUrl}">${item.targetTitle}</a>.</p></blockquote>`;

    let targetPos: number | null = null;
    const doc = editor.state.doc;
    const searchPhrase = (item.contextExcerpt || item.anchorText || '').trim();

    // Count top-level block paragraphs to calculate the position right after paragraph #3
    let blockCount = 0;
    let minAllowedPos: number | null = null;
    let currentBlockEnd: number | null = null;

    // Strategy A: Exact phrase substring match in paragraph text (skipping first 3 paragraphs)
    if (searchPhrase.length >= 3) {
      doc.descendants((node, pos) => {
        if (node.isBlock) {
          blockCount++;
          currentBlockEnd = pos + node.nodeSize;
          if (blockCount === 3) {
            minAllowedPos = currentBlockEnd;
          }
        }
        if (targetPos === null && node.isText && node.text && currentBlockEnd !== null) {
          // Only match if we are in block 4 or deeper
          if (blockCount > 3 && node.text.toLowerCase().includes(searchPhrase.toLowerCase())) {
            targetPos = currentBlockEnd;
          }
        }
      });
    } else {
      doc.descendants((node, pos) => {
        if (node.isBlock) {
          blockCount++;
          if (blockCount === 3) {
            minAllowedPos = pos + node.nodeSize;
          }
        }
      });
    }

    // Strategy B: Fuzzy keyword matching if exact substring fails (skipping first 3 paragraphs)
    if (targetPos === null && searchPhrase.length >= 3) {
      const keywords = searchPhrase
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 3);

      if (keywords.length > 0) {
        let maxMatchCount = 0;
        let bestParagraphEnd: number | null = null;

        let bIndex = 0;
        doc.descendants((node, pos) => {
          if (node.isBlock) {
            bIndex++;
            if (bIndex > 3 && node.textContent) {
              const blockText = node.textContent.toLowerCase();
              const matchCount = keywords.filter((kw) => blockText.includes(kw)).length;
              if (matchCount > maxMatchCount && matchCount >= Math.min(2, keywords.length)) {
                maxMatchCount = matchCount;
                bestParagraphEnd = pos + node.nodeSize;
              }
            }
          }
        });

        if (bestParagraphEnd !== null) {
          targetPos = bestParagraphEnd;
        }
      }
    }

    // Strategy C: Bounded Insertion — Enforce targetPos MUST be after paragraph 3
    const docSize = doc.content.size;
    const floorPos =
      minAllowedPos !== null && minAllowedPos > 0
        ? minAllowedPos
        : Math.min(100, Math.floor(docSize / 2));

    let safePos =
      targetPos !== null && targetPos >= floorPos && targetPos <= docSize
        ? targetPos
        : floorPos;
    if (safePos >= docSize) {
      safePos = Math.max(1, docSize - 1);
    }

    editor
      .chain()
      .focus()
      .insertContentAt(safePos, calloutHtml)
      .run();

    updateInternalLinkStatus(item.id, 'accepted');
  };

  // 2. Remove Internal Link Callout Card
  const handleRemoveInternalLink = (item: InternalLinkSuggestion) => {
    if (!editor) return;

    const doc = editor.state.doc;
    let rangeToDelete: { from: number; to: number } | null = null;

    doc.descendants((node, pos) => {
      if (rangeToDelete) return false;
      if (
        node.isBlock &&
        (node.textContent.includes(item.targetTitle) ||
          (item.targetUrl && node.textContent.includes(item.targetUrl)))
      ) {
        rangeToDelete = { from: pos, to: pos + node.nodeSize };
      }
    });

    if (rangeToDelete) {
      editor
        .chain()
        .focus()
        .deleteRange(rangeToDelete)
        .run();
    }

    updateInternalLinkStatus(item.id, 'pending');
  };

  // 3. External Link Insertion
  const handleApplyExternalLink = (
    anchorText: string,
    url: string,
    nofollow = false
  ) => {
    if (!editor) return;

    let found = false;
    const doc = editor.state.doc;
    const cleanAnchor = anchorText.trim();

    if (cleanAnchor.length >= 2) {
      doc.descendants((node, pos) => {
        if (found) return false;
        if (node.isText && node.text) {
          const index = node.text.toLowerCase().indexOf(cleanAnchor.toLowerCase());
          if (index !== -1) {
            const from = pos + index;
            const to = from + cleanAnchor.length;
            editor
              .chain()
              .focus()
              .setTextSelection({ from, to })
              .setLink({
                href: url,
                target: '_blank',
                rel: nofollow ? 'nofollow' : undefined,
              })
              .run();
            found = true;
          }
        }
      });
    }

    if (!found) {
      const endPos = Math.max(1, doc.content.size - 1);
      const linkHtml = `<a href="${url}" target="_blank"${nofollow ? ' rel="nofollow"' : ''}>${cleanAnchor || url}</a>`;
      editor
        .chain()
        .focus()
        .insertContentAt(endPos, linkHtml)
        .run();
    }
  };

  // 4. Remove External Link
  const handleRemoveExternalLink = (anchorText: string) => {
    if (!editor) return;
    const doc = editor.state.doc;
    let found = false;
    const cleanAnchor = anchorText.trim();

    if (cleanAnchor.length >= 2) {
      doc.descendants((node, pos) => {
        if (found) return false;
        if (node.isText && node.text) {
          const index = node.text.toLowerCase().indexOf(cleanAnchor.toLowerCase());
          if (index !== -1) {
            const from = pos + index;
            const to = from + cleanAnchor.length;
            editor
              .chain()
              .focus()
              .setTextSelection({ from, to })
              .unsetLink()
              .run();
            found = true;
          }
        }
      });
    }
  };

  // 5. Schema Applicator — SAFE NON-DESTRUCTIVE APPLICATION
  const handleApplySchemaToEditor = (item: SchemaResultItem, index: number) => {
    if (item.type === 'Article' || item.applyAction === 'meta') {
      const jsonLd = item.jsonLd as Record<string, unknown>;
      onPublishStateChange({
        ...publishState,
        metaTitle: (jsonLd.headline as string) || publishState.metaTitle,
        metaDescription: (jsonLd.description as string) || publishState.metaDescription,
      });
      setAppliedSchemaIndex(index);
      setTimeout(() => setAppliedSchemaIndex(null), 3000);
    } else {
      // For FAQPage, ItemList, BreadcrumbList etc., copy JSON and notify
      navigator.clipboard.writeText(JSON.stringify(item.jsonLd, null, 2));
      setAppliedSchemaIndex(index);
      setTimeout(() => setAppliedSchemaIndex(null), 3000);
    }
  };

  const articleHtml = editor?.getHTML() || '';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto space-y-6">
        <SheetHeader className="border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <SheetTitle className="text-xl font-bold">AI SEO Assistant</SheetTitle>
              <SheetDescription className="text-xs">
                Relative internal linking, callouts, schema builder & interactive editor sync.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Gemini API Key Box (BYOK Model) */}
        <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
              <Key className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Gemini API Key (BYOK)</span>
            </label>
            {isKeyValid === true && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> Key Valid
              </span>
            )}
            {isKeyValid === false && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-destructive">
                <AlertCircle className="h-3.5 w-3.5" /> Key Invalid
              </span>
            )}
          </div>

          <form onSubmit={handleSaveKey} className="flex gap-2">
            <Input
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="Paste AI Studio Gemini API Key (AIzaSy...)"
              className="text-xs h-8"
            />
            <Button
              type="submit"
              variant="outline"
              size="sm"
              disabled={isValidatingKey || !inputKey.trim()}
              className="h-8 text-xs shrink-0"
            >
              {isValidatingKey ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                'Save Key'
              )}
            </Button>
          </form>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">AI Request Error</p>
              <p className="text-[11px] leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* Action Tabs */}
        <Tabs defaultValue="internal-links" className="w-full">
          <TabsList className="grid grid-cols-5 w-full h-9 bg-muted/60 p-0.5">
            <TabsTrigger value="internal-links" className="text-[11px] gap-1 px-1">
              <Link2 className="h-3 w-3" />
              <span className="hidden sm:inline">Internal</span>
            </TabsTrigger>
            <TabsTrigger value="external-links" className="text-[11px] gap-1 px-1">
              <ExternalLink className="h-3 w-3" />
              <span className="hidden sm:inline">External</span>
            </TabsTrigger>
            <TabsTrigger value="schema" className="text-[11px] gap-1 px-1">
              <Code2 className="h-3 w-3" />
              <span className="hidden sm:inline">Schema</span>
            </TabsTrigger>
            <TabsTrigger value="meta-tags" className="text-[11px] gap-1 px-1">
              <FileText className="h-3 w-3" />
              <span className="hidden sm:inline">Meta</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="text-[11px] gap-1 px-1">
              <ShieldCheck className="h-3 w-3" />
              <span className="hidden sm:inline">Audit</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Internal Links */}
          <TabsContent value="internal-links" className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold">Internal Article Linking</h4>
                <p className="text-[11px] text-muted-foreground">
                  Relative Next.js routing links (`/contentType/slug`) & paragraph-specific Callout cards.
                </p>
              </div>
              <Button
                size="sm"
                variant="default"
                disabled={isLoading || !apiKey}
                onClick={() =>
                  executeAction('internal-links', articleHtml, publishState, manifest)
                }
                className="h-8 text-xs gap-1.5 bg-violet-600 text-white hover:bg-violet-700"
              >
                {isLoading && activeAction === 'internal-links' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                <span>Analyze Links</span>
              </Button>
            </div>

            {internalLinks.length === 0 && !isLoading && (
              <div className="text-center py-8 text-xs text-muted-foreground border border-dashed rounded-lg">
                Click "Analyze Links" to generate relative internal links & callout cards.
              </div>
            )}

            <div className="space-y-3">
              {internalLinks.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-lg border text-xs transition-colors ${
                    item.status === 'accepted'
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : item.status === 'rejected'
                      ? 'border-border bg-muted/20 opacity-50'
                      : 'border-border bg-card'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={item.type === 'callout' ? 'default' : 'secondary'}
                          className="text-[9px] uppercase tracking-wider"
                        >
                          {item.type === 'callout' ? '📌 Callout Card' : '🔗 Inline Link'}
                        </Badge>
                        <span className="font-semibold text-foreground truncate max-w-[200px]">
                          "{item.anchorText || item.contextExcerpt || item.targetTitle}"
                        </span>
                      </div>

                      <p className="text-[11px] text-violet-600 dark:text-violet-400 font-mono flex items-center gap-1">
                        <ArrowRight className="h-3 w-3" /> {item.targetTitle} ({item.targetUrl})
                      </p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {item.reason}
                      </p>
                      {item.contextExcerpt && (
                        <p className="text-[10px] text-muted-foreground font-mono bg-muted/40 p-1.5 rounded border border-border/50">
                          Target Context: "{item.contextExcerpt}"
                        </p>
                      )}
                    </div>

                    {item.status === 'pending' && (
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-[11px] gap-1 text-emerald-600 hover:bg-emerald-500/10 border-emerald-500/30"
                          title="Accept & Insert into Editor"
                          onClick={() => handleApplyInternalLink(item)}
                        >
                          <Check className="h-3 w-3" />
                          <span>Insert</span>
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-7 w-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          title="Dismiss"
                          onClick={() => updateInternalLinkStatus(item.id, 'rejected')}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}

                    {item.status === 'accepted' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px]">
                          Linked
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-[10px] gap-1 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveInternalLink(item)}
                          title="Remove Link/Callout from Editor"
                        >
                          <RotateCcw className="h-3 w-3" />
                          <span>Remove</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Tab 2: External Links */}
          <TabsContent value="external-links" className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold">External Outbound Link Suggestions</h4>
                <p className="text-[11px] text-muted-foreground">
                  Recommends high-authority technical reference links for key concepts.
                </p>
              </div>
              <Button
                size="sm"
                variant="default"
                disabled={isLoading || !apiKey}
                onClick={() => executeAction('external-links', articleHtml, publishState)}
                className="h-8 text-xs gap-1.5 bg-violet-600 text-white hover:bg-violet-700"
              >
                {isLoading && activeAction === 'external-links' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                <span>Suggest References</span>
              </Button>
            </div>

            {externalLinks.length === 0 && !isLoading && (
              <div className="text-center py-8 text-xs text-muted-foreground border border-dashed rounded-lg">
                Click "Suggest References" to scan for high-trust outbound link targets.
              </div>
            )}

            <div className="space-y-3">
              {externalLinks.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-lg border text-xs ${
                    item.status === 'accepted'
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : item.status === 'rejected'
                      ? 'border-border bg-muted/20 opacity-50'
                      : 'border-border bg-card'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground">"{item.anchorText}"</p>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-blue-500 hover:underline flex items-center gap-1 font-mono"
                      >
                        {item.domain} <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                      <p className="text-[11px] text-muted-foreground">{item.reason}</p>
                    </div>

                    {item.status === 'pending' && (
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-7 w-7 text-emerald-600 hover:bg-emerald-500/10"
                          title="Accept & Insert Link"
                          onClick={() => {
                            handleApplyExternalLink(item.anchorText, item.url, item.nofollow);
                            updateExternalLinkStatus(item.id, 'accepted');
                          }}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-7 w-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          title="Dismiss"
                          onClick={() => updateExternalLinkStatus(item.id, 'rejected')}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}

                    {item.status === 'accepted' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px]">
                          Linked
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-[10px] gap-1 text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            handleRemoveExternalLink(item.anchorText);
                            updateExternalLinkStatus(item.id, 'pending');
                          }}
                        >
                          <RotateCcw className="h-3 w-3" />
                          <span>Remove</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Tab 3: Schema Markup */}
          <TabsContent value="schema" className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold">Structured Data Schema Builder</h4>
                <p className="text-[11px] text-muted-foreground">
                  Generate Google rich result schemas (Article, FAQPage, ItemList) for auto-injection into head.
                </p>
              </div>
              <Button
                size="sm"
                variant="default"
                disabled={isLoading || !apiKey}
                onClick={() => executeAction('schema', articleHtml, publishState)}
                className="h-8 text-xs gap-1.5 bg-violet-600 text-white hover:bg-violet-700"
              >
                {isLoading && activeAction === 'schema' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                <span>Generate Schemas</span>
              </Button>
            </div>

            {schemaResults.length === 0 && !isLoading && (
              <div className="text-center py-8 text-xs text-muted-foreground border border-dashed rounded-lg">
                Click "Generate Schemas" to generate JSON-LD structured data for this article.
              </div>
            )}

            <div className="space-y-4">
              {schemaResults.map((item, idx) => (
                <div key={idx} className="rounded-lg border border-border bg-card p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-[10px] bg-violet-500/10 text-violet-600">
                        @{item.type}
                      </Badge>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                        Auto-injected into page &lt;head&gt;
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-[10px] gap-1"
                        onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify(item.jsonLd, null, 2));
                          setCopiedIndex(idx);
                          setTimeout(() => setCopiedIndex(null), 2000);
                        }}
                      >
                        <Copy className="h-3 w-3" />
                        <span>{copiedIndex === idx ? 'Copied' : 'Copy JSON'}</span>
                      </Button>

                      {item.type === 'Article' && (
                        <Button
                          variant="default"
                          size="sm"
                          className="h-7 text-[10px] gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                          onClick={() => handleApplySchemaToEditor(item, idx)}
                        >
                          {appliedSchemaIndex === idx ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )}
                          <span>
                            {appliedSchemaIndex === idx ? 'Synced with Meta!' : 'Sync with Meta Settings'}
                          </span>
                        </Button>
                      )}
                    </div>
                  </div>

                  <pre className="p-2.5 rounded bg-muted/60 font-mono text-[10px] overflow-x-auto max-h-40 text-muted-foreground">
                    {JSON.stringify(item.jsonLd, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Tab 4: Meta Tags */}
          <TabsContent value="meta-tags" className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold">Meta Tags Optimizer</h4>
                <p className="text-[11px] text-muted-foreground">
                  AI-powered title, description, cover alt, and taxonomy tags optimization.
                </p>
              </div>
              <Button
                size="sm"
                variant="default"
                disabled={isLoading || !apiKey}
                onClick={() => executeAction('meta-tags', articleHtml, publishState)}
                className="h-8 text-xs gap-1.5 bg-violet-600 text-white hover:bg-violet-700"
              >
                {isLoading && activeAction === 'meta-tags' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                <span>Optimize Meta</span>
              </Button>
            </div>

            {!metaTagSuggestions && !isLoading && (
              <div className="text-center py-8 text-xs text-muted-foreground border border-dashed rounded-lg">
                Click "Optimize Meta" to generate character-calibrated meta titles and descriptions.
              </div>
            )}

            {metaTagSuggestions && (
              <div className="space-y-4 rounded-lg border border-border p-4 bg-card text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between text-muted-foreground font-semibold">
                    <span>Meta Title</span>
                    <span>{metaTagSuggestions.metaTitle.charCount} chars</span>
                  </div>
                  <p className="p-2 rounded bg-muted/50 font-medium">
                    {metaTagSuggestions.metaTitle.value}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-muted-foreground font-semibold">
                    <span>Meta Description</span>
                    <span>{metaTagSuggestions.metaDescription.charCount} chars</span>
                  </div>
                  <p className="p-2 rounded bg-muted/50 text-muted-foreground leading-relaxed">
                    {metaTagSuggestions.metaDescription.value}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-semibold text-muted-foreground">Image Cover Alt Text</span>
                  <p className="p-2 rounded bg-muted/50 font-mono text-[11px]">
                    {metaTagSuggestions.coverAlt}
                  </p>
                </div>

                {metaTagSuggestions.suggestedTags?.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="font-semibold text-muted-foreground">Suggested Tags</span>
                    <div className="flex flex-wrap gap-1">
                      {metaTagSuggestions.suggestedTags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px]">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  size="sm"
                  className="w-full h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5"
                  onClick={() => {
                    onPublishStateChange({
                      ...publishState,
                      metaTitle: metaTagSuggestions.metaTitle.value,
                      metaDescription: metaTagSuggestions.metaDescription.value,
                      coverAlt: metaTagSuggestions.coverAlt,
                      tags: Array.from(
                        new Set([...publishState.tags, ...metaTagSuggestions.suggestedTags])
                      ),
                    });
                  }}
                >
                  <Check className="h-3.5 w-3.5" /> Apply to Article Settings
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Tab 5: Audit */}
          <TabsContent value="audit" className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold">Comprehensive SEO Audit</h4>
                <p className="text-[11px] text-muted-foreground">
                  Evaluates headings, keywords, readability, image alt text & schema integrity.
                </p>
              </div>
              <Button
                size="sm"
                variant="default"
                disabled={isLoading || !apiKey}
                onClick={() => executeAction('audit', articleHtml, publishState)}
                className="h-8 text-xs gap-1.5 bg-violet-600 text-white hover:bg-violet-700"
              >
                {isLoading && activeAction === 'audit' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                <span>Run SEO Audit</span>
              </Button>
            </div>

            {!auditReport && !isLoading && (
              <div className="text-center py-8 text-xs text-muted-foreground border border-dashed rounded-lg">
                Click "Run SEO Audit" to generate an overall score and actionable checklist.
              </div>
            )}

            {auditReport && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/40 border border-border">
                  <div
                    className={`h-16 w-16 rounded-full flex items-center justify-center font-bold text-xl border-4 ${
                      auditReport.score >= 80
                        ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                        : auditReport.score >= 60
                        ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/10'
                        : 'border-destructive text-destructive bg-destructive/10'
                    }`}
                  >
                    {auditReport.score}
                  </div>
                  <div className="space-y-1 flex-1">
                    <h5 className="font-bold text-sm">SEO Score: {auditReport.score}/100</h5>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {auditReport.summary}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {auditReport.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg border border-border bg-card text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">{item.title}</span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] capitalize ${
                            item.severity === 'pass'
                              ? 'border-emerald-500/30 text-emerald-600 bg-emerald-500/10'
                              : item.severity === 'warning'
                              ? 'border-amber-500/30 text-amber-600 bg-amber-500/10'
                              : item.severity === 'error'
                              ? 'border-destructive/30 text-destructive bg-destructive/10'
                              : 'border-border text-muted-foreground'
                          }`}
                        >
                          {item.severity}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{item.description}</p>
                      {item.fix && (
                        <p className="text-[11px] text-violet-600 dark:text-violet-400 font-medium pt-1">
                          Fix: {item.fix}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
