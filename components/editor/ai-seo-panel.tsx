'use client';

import * as React from 'react';
import { Editor } from '@tiptap/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Key,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Check,
  X,
  ExternalLink,
  RotateCcw,
  Copy,
  Info,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useAiSeo } from '@/hooks/use-ai-seo';
import { PublishSidebarState } from '@/types/editor';
import { ManifestEntry } from '@/types/content';
import { InternalLinkSuggestion, InboundLinkSuggestion, ExternalLinkSuggestion } from '@/types/ai-seo';

interface AiSeoPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editor: Editor | null;
  publishState: PublishSidebarState;
  onPublishStateChange?: (updates: Partial<PublishSidebarState>) => void;
  onUpdatePublishState?: (updates: Partial<PublishSidebarState>) => void;
  manifest?: ManifestEntry[];
}

export function AiSeoPanel({
  open,
  onOpenChange,
  editor,
  publishState,
  onPublishStateChange,
  onUpdatePublishState,
  manifest = [],
}: AiSeoPanelProps) {
  const updateStateCallback = onPublishStateChange || onUpdatePublishState;
  const {
    apiKey,
    saveApiKey,
    isKeyValid,
    isValidatingKey,
    isLoading,
    activeAction,
    error,
    internalLinks,
    inboundLinks,
    externalLinks,
    schemaResults,
    metaTagSuggestions,
    auditReport,
    executeAction,
    updateInternalLinkStatus,
    updateExternalLinkStatus,
    injectInboundLink,
    injectBatchInboundLinks,
  } = useAiSeo();

  const [inputKey, setInputKey] = React.useState('');
  const [copiedSchemaIndex, setCopiedSchemaIndex] = React.useState<number | null>(null);
  const [injectingId, setInjectingId] = React.useState<string | null>(null);
  const [isBatchInjecting, setIsBatchInjecting] = React.useState(false);

  React.useEffect(() => {
    setInputKey(apiKey);
  }, [apiKey]);

  if (!open) return null;

  const articleHtml = editor?.getHTML() || '';

  const handleSaveKey = async () => {
    await saveApiKey(inputKey);
  };

  // 1. Internal Link Callout Card Insertion (placed strictly after target context paragraph & scrolled into view)
  const handleApplyInternalLink = (item: InternalLinkSuggestion) => {
    if (!editor) return;

    const transitionReason = item.reason ? item.reason.replace(/\.$/, '') + ',' : 'Take a look at';
    const calloutHtml = `<blockquote><p>💡 <strong>Related Guide:</strong> ${transitionReason} read our full breakdown of <a href="${item.targetUrl}">${item.targetTitle}</a>.</p></blockquote>`;

    let targetPos: number | null = null;
    const doc = editor.state.doc;
    const searchPhrase = (item.contextExcerpt || item.anchorText || '').trim();

    // Count top-level block paragraphs to calculate position after paragraph #3
    let blockCount = 0;
    let minAllowedPos: number | null = null;
    let currentBlockEnd: number | null = null;

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

    // Strategy B: Fuzzy keyword matching if exact substring fails
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

    // Insert callout and scroll editor canvas into view in real time!
    editor
      .chain()
      .focus()
      .insertContentAt(safePos, calloutHtml)
      .setTextSelection(Math.max(1, safePos - 2))
      .scrollIntoView()
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
        .scrollIntoView()
        .run();
    }

    updateInternalLinkStatus(item.id, 'pending');
  };

  // 3. Handle Single Item MDX Auto-Injection for Inbound Links (skips git push)
  const handleInjectInboundCallout = async (item: InboundLinkSuggestion) => {
    setInjectingId(item.id);
    await injectInboundLink(item);
    setInjectingId(null);
  };

  // 4. Handle Batch MDX Auto-Injection (1 single commit & git push for all pending items)
  const handleBatchInjectInboundCallouts = async () => {
    const pendingItems = inboundLinks.filter((item) => item.status !== 'injected');
    if (pendingItems.length === 0) return;
    setIsBatchInjecting(true);
    await injectBatchInboundLinks(pendingItems);
    setIsBatchInjecting(false);
  };

  // 5. External Link Application with Real-Time Auto-Scroll
  const handleApplyExternalLink = (item: ExternalLinkSuggestion) => {
    if (!editor) return;
    let found = false;
    const doc = editor.state.doc;

    doc.descendants((node, pos) => {
      if (found) return false;
      if (node.isText && node.text) {
        const index = node.text.toLowerCase().indexOf(item.anchorText.toLowerCase());
        if (index !== -1) {
          const from = pos + index;
          const to = from + item.anchorText.length;
          editor
            .chain()
            .focus()
            .setTextSelection({ from, to })
            .setLink({ href: item.url, target: '_blank', rel: 'noopener noreferrer' })
            .scrollIntoView()
            .run();
          found = true;
        }
      }
    });

    if (!found) {
      const endPos = Math.max(1, doc.content.size - 1);
      editor
        .chain()
        .focus()
        .insertContentAt(
          endPos,
          `<p>Reference: <a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.anchorText}</a></p>`
        )
        .scrollIntoView()
        .run();
    }

    updateExternalLinkStatus(item.id, 'accepted');
  };

  // 6. Remove External Link
  const handleRemoveExternalLink = (item: ExternalLinkSuggestion) => {
    if (!editor) return;
    const doc = editor.state.doc;
    let found = false;

    doc.descendants((node, pos) => {
      if (found) return false;
      if (
        node.isText &&
        node.text &&
        node.text.toLowerCase().includes(item.anchorText.toLowerCase())
      ) {
        const index = node.text.toLowerCase().indexOf(item.anchorText.toLowerCase());
        if (index !== -1) {
          const from = pos + index;
          const to = from + item.anchorText.length;
          editor
            .chain()
            .focus()
            .setTextSelection({ from, to })
            .unsetLink()
            .scrollIntoView()
            .run();
          found = true;
        }
      }
    });

    updateExternalLinkStatus(item.id, 'pending');
  };

  const handleCopyJsonLd = (jsonObj: Record<string, unknown>, index: number) => {
    navigator.clipboard.writeText(JSON.stringify(jsonObj, null, 2));
    setCopiedSchemaIndex(index);
    setTimeout(() => setCopiedSchemaIndex(null), 2000);
  };

  const handleApplyMetaSuggestions = () => {
    if (!metaTagSuggestions || !updateStateCallback) return;
    updateStateCallback({
      ...publishState,
      metaTitle: metaTagSuggestions.metaTitle.value,
      metaDescription: metaTagSuggestions.metaDescription.value,
      coverAlt: metaTagSuggestions.coverAlt || publishState.coverAlt,
    });
  };

  const pendingInboundCount = inboundLinks.filter((item) => item.status !== 'injected').length;

  return (
    <aside className="w-[420px] xl:w-[460px] shrink-0 border border-border/80 rounded-2xl bg-card p-4 shadow-sm sticky top-[7.5rem] max-h-[calc(100vh-8.5rem)] flex flex-col z-20 space-y-4">
      {/* Side Panel Header */}
      <div className="flex items-center justify-between border-b pb-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold leading-none">AI SEO Assistant</h3>
            <p className="text-[11px] text-muted-foreground mt-1">Real-time side-by-side SEO optimization</p>
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={() => onOpenChange(false)}
          title="Close AI SEO Panel"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-5 no-scrollbar">
        {/* API Key Configuration Card */}
        <div className="p-3 rounded-xl border bg-muted/20 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <Key className="h-3.5 w-3.5 text-violet-500" />
              <span>Gemini API Key</span>
            </div>
            {isKeyValid === true && (
              <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1 px-1.5 py-0">
                <CheckCircle2 className="h-2.5 w-2.5" /> Valid
              </Badge>
            )}
            {isKeyValid === false && (
              <Badge variant="outline" className="text-[9px] bg-destructive/10 text-destructive border-destructive/20 gap-1 px-1.5 py-0">
                <AlertCircle className="h-2.5 w-2.5" /> Invalid
              </Badge>
            )}
          </div>

          <div className="flex gap-1.5">
            <Input
              type="password"
              placeholder="AIzaSy..."
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              className="h-7 text-xs font-mono"
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={handleSaveKey}
              disabled={isValidatingKey || !inputKey}
              className="h-7 text-xs shrink-0 px-2.5"
            >
              {isValidatingKey ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Save Key'}
            </Button>
          </div>
        </div>

        {!apiKey && (
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-[11px] flex items-center gap-2">
            <Info className="h-3.5 w-3.5 shrink-0" />
            <span>Please enter and save your Gemini API key above to activate AI actions.</span>
          </div>
        )}

        {error && (
          <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-[11px] flex items-start gap-2">
            <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Action Tabs */}
        <Tabs defaultValue="internal-links" className="w-full">
          <TabsList className="grid grid-cols-5 w-full h-8 p-0.5 bg-muted/60">
            <TabsTrigger value="internal-links" className="text-[10px] px-1">Links</TabsTrigger>
            <TabsTrigger value="external-links" className="text-[10px] px-1">Refs</TabsTrigger>
            <TabsTrigger value="schema" className="text-[10px] px-1">Schema</TabsTrigger>
            <TabsTrigger value="meta-tags" className="text-[10px] px-1">Meta</TabsTrigger>
            <TabsTrigger value="audit" className="text-[10px] px-1">Audit</TabsTrigger>
          </TabsList>

          {/* Tab 1: Internal & Inbound Links */}
          <TabsContent value="internal-links" className="space-y-5 pt-3">
            {/* Action Buttons Header */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold">Internal Linking Suite</h4>
                <p className="text-[10px] text-muted-foreground">
                  Outbound callouts + Inbound backlinks
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="default"
                  disabled={isLoading || !apiKey}
                  onClick={() =>
                    executeAction('internal-links', articleHtml, publishState, manifest)
                  }
                  className="h-7 text-[11px] gap-1 bg-violet-600 text-white hover:bg-violet-700 px-2"
                >
                  {isLoading && activeAction === 'internal-links' ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3" />
                  )}
                  <span>Outbound</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  disabled={isLoading || !apiKey}
                  onClick={() =>
                    executeAction('inbound-links', articleHtml, publishState, manifest)
                  }
                  className="h-7 text-[11px] gap-1 border-violet-500/40 text-violet-600 hover:bg-violet-500/10 dark:text-violet-400 px-2"
                >
                  {isLoading && activeAction === 'inbound-links' ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Zap className="h-3 w-3 text-amber-500" />
                  )}
                  <span>Incoming</span>
                </Button>
              </div>
            </div>

            {/* Sub-Section 1: Outbound Internal Links */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b pb-1">
                <h5 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <ArrowRight className="h-3 w-3 text-violet-500" />
                  <span>Outbound Callouts (Current article)</span>
                </h5>
                <Badge variant="secondary" className="text-[9px] font-mono px-1.5 py-0">
                  {internalLinks.length}
                </Badge>
              </div>

              {internalLinks.length === 0 && !isLoading && (
                <div className="text-center py-4 text-[11px] text-muted-foreground border border-dashed rounded-lg">
                  Click "Outbound" to generate styled Callout Cards.
                </div>
              )}

              {internalLinks.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border text-xs transition-all ${
                    item.status === 'accepted'
                      ? 'border-emerald-500/40 bg-emerald-500/5'
                      : item.status === 'rejected'
                      ? 'border-border bg-muted/20 opacity-50'
                      : 'border-border bg-card hover:border-violet-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="default" className="text-[9px] uppercase tracking-wider bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30 px-1 py-0">
                          💡 Callout Card
                        </Badge>
                        <span className="font-semibold text-foreground truncate max-w-[180px]">
                          {item.targetTitle}
                        </span>
                      </div>

                      <p className="text-[10px] text-violet-600 dark:text-violet-400 font-mono flex items-center gap-1">
                        <ArrowRight className="h-2.5 w-2.5" /> {item.targetUrl}
                      </p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {item.reason}
                      </p>
                    </div>

                    {item.status === 'pending' && (
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-[10px] gap-1 text-emerald-600 hover:bg-emerald-500/10 border-emerald-500/30 px-2"
                          title="Accept & Insert Callout into Editor Canvas with Real-Time Auto-Scroll"
                          onClick={() => handleApplyInternalLink(item)}
                        >
                          <Check className="h-3 w-3" />
                          <span>Insert</span>
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-6 w-6 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          title="Dismiss"
                          onClick={() => updateInternalLinkStatus(item.id, 'rejected')}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}

                    {item.status === 'accepted' && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[9px] px-1 py-0">
                          Inserted
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 text-[10px] gap-1 text-muted-foreground hover:text-destructive px-1.5"
                          onClick={() => handleRemoveInternalLink(item)}
                          title="Remove Callout from Editor Canvas"
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

            {/* Sub-Section 2: Incoming Internal Links (Batch Injector) */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between border-b pb-1">
                <h5 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Zap className="h-3 w-3 text-amber-500" />
                  <span>Incoming Links (Inject into published articles)</span>
                </h5>
                <div className="flex items-center gap-1.5">
                  {pendingInboundCount > 0 && (
                    <Button
                      size="sm"
                      variant="default"
                      disabled={isBatchInjecting}
                      onClick={handleBatchInjectInboundCallouts}
                      className="h-5 text-[9px] gap-1 bg-amber-600 hover:bg-amber-700 text-white px-2 py-0"
                      title="Inject all links into MDX files & trigger 1 single GitHub deployment"
                    >
                      {isBatchInjecting ? (
                        <Loader2 className="h-2.5 w-2.5 animate-spin" />
                      ) : (
                        <Zap className="h-2.5 w-2.5" />
                      )}
                      <span>Deploy All ({pendingInboundCount})</span>
                    </Button>
                  )}
                  <Badge variant="secondary" className="text-[9px] font-mono px-1.5 py-0">
                    {inboundLinks.length}
                  </Badge>
                </div>
              </div>

              {inboundLinks.length === 0 && !isLoading && (
                <div className="text-center py-4 text-[11px] text-muted-foreground border border-dashed rounded-lg">
                  Click "Incoming" to find published articles to link back to this article.
                </div>
              )}

              {inboundLinks.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border text-xs transition-all ${
                    item.status === 'injected'
                      ? 'border-emerald-500/40 bg-emerald-500/5'
                      : 'border-border bg-card hover:border-violet-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[9px] font-mono text-violet-600 border-violet-500/30 px-1 py-0">
                          Source: {item.sourceSlug}
                        </Badge>
                        <span className="font-semibold text-foreground truncate max-w-[180px]">
                          {item.sourceTitle}
                        </span>
                      </div>

                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {item.reason}
                      </p>

                      <div className="p-1.5 rounded bg-amber-500/5 border border-amber-500/20 text-[10px] font-mono text-muted-foreground leading-relaxed">
                        {item.calloutMarkdown}
                      </div>
                    </div>

                    {item.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="default"
                        disabled={injectingId === item.id || isBatchInjecting}
                        className="h-6 text-[10px] gap-1 bg-amber-600 hover:bg-amber-700 text-white shrink-0 px-2"
                        title="Inject Callout directly into target MDX file on disk (saves to disk without pushing)"
                        onClick={() => handleInjectInboundCallout(item)}
                      >
                        {injectingId === item.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Check className="h-3 w-3" />
                        )}
                        <span>Inject</span>
                      </Button>
                    )}

                    {item.status === 'injected' && (
                      <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[9px] shrink-0 gap-1 px-1.5 py-0">
                        <CheckCircle2 className="h-2.5 w-2.5" /> Injected
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Tab 2: External References */}
          <TabsContent value="external-links" className="space-y-4 pt-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold">External Outbound Links</h4>
                <p className="text-[10px] text-muted-foreground">
                  High-authority reference links for UNLINKED terms only.
                </p>
              </div>
              <Button
                size="sm"
                variant="default"
                disabled={isLoading || !apiKey}
                onClick={() => executeAction('external-links', articleHtml, publishState)}
                className="h-7 text-[11px] gap-1 bg-violet-600 text-white hover:bg-violet-700 px-2.5"
              >
                {isLoading && activeAction === 'external-links' ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
                <span>Suggest</span>
              </Button>
            </div>

            {externalLinks.length === 0 && !isLoading && (
              <div className="text-center py-6 text-[11px] text-muted-foreground border border-dashed rounded-lg">
                Click "Suggest" to scan for high-trust outbound link targets.
              </div>
            )}

            <div className="space-y-2.5">
              {externalLinks.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border text-xs transition-all ${
                    item.status === 'accepted'
                      ? 'border-emerald-500/40 bg-emerald-500/5'
                      : 'border-border bg-card hover:border-violet-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[9px] font-mono px-1 py-0">
                          {item.domain}
                        </Badge>
                        <span className="font-semibold text-foreground">
                          "{item.anchorText}"
                        </span>
                      </div>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-violet-600 dark:text-violet-400 underline font-mono flex items-center gap-1"
                      >
                        {item.url} <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{item.reason}</p>
                    </div>

                    {item.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 text-[10px] gap-1 text-emerald-600 hover:bg-emerald-500/10 border-emerald-500/30 shrink-0 px-2"
                        onClick={() => handleApplyExternalLink(item)}
                        title="Insert Reference Link into Editor Canvas with Real-Time Auto-Scroll"
                      >
                        <Check className="h-3 w-3" />
                        <span>Insert</span>
                      </Button>
                    )}

                    {item.status === 'accepted' && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[9px] px-1 py-0">
                          Linked
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 text-[10px] gap-1 text-muted-foreground hover:text-destructive px-1.5"
                          onClick={() => handleRemoveExternalLink(item)}
                          title="Remove External Link from Editor Canvas"
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

          {/* Tab 3: Schema (JSON-LD Preview & Head Injection Info) */}
          <TabsContent value="schema" className="space-y-4 pt-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold font-mono">Google Rich Snippets</h4>
                <p className="text-[10px] text-muted-foreground">
                  Article, FAQPage & ItemList schemas auto-injected into &lt;head&gt;.
                </p>
              </div>
              <Button
                size="sm"
                variant="default"
                disabled={isLoading || !apiKey}
                onClick={() => executeAction('schema', articleHtml, publishState)}
                className="h-7 text-[11px] gap-1 bg-violet-600 text-white hover:bg-violet-700 px-2.5"
              >
                {isLoading && activeAction === 'schema' ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
                <span>Preview</span>
              </Button>
            </div>

            <div className="p-2.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-700 dark:text-violet-300 text-xs flex items-start gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 mt-0.5 text-violet-500" />
              <div className="space-y-0.5 text-[10px] leading-relaxed">
                <p className="font-semibold">Automated Schema Sync Active</p>
                <p>
                  Wethedevs extracts H2/H3 FAQs & list items to output 100% valid Google JSON-LD upon publication.
                </p>
              </div>
            </div>

            {schemaResults.length === 0 && !isLoading && (
              <div className="text-center py-6 text-[11px] text-muted-foreground border border-dashed rounded-lg">
                Click "Preview" to inspect auto-generated JSON-LD schemas.
              </div>
            )}

            <div className="space-y-3">
              {schemaResults.map((item, index) => (
                <div key={index} className="p-3 rounded-xl border bg-card space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="text-[9px] font-mono uppercase bg-violet-500/10 text-violet-600 border-violet-500/20 px-1 py-0">
                        {item.type} Schema
                      </Badge>
                      <Badge variant="secondary" className="text-[9px] bg-emerald-500/10 text-emerald-600 px-1 py-0">
                        Valid
                      </Badge>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-[10px] gap-1 px-2"
                      onClick={() => handleCopyJsonLd(item.jsonLd, index)}
                    >
                      {copiedSchemaIndex === index ? (
                        <>
                          <Check className="h-2.5 w-2.5 text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-2.5 w-2.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </Button>
                  </div>

                  <pre className="p-2 rounded-lg bg-muted font-mono text-[9px] text-muted-foreground overflow-x-auto max-h-40 border">
                    {JSON.stringify(item.jsonLd, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Tab 4: Meta Tag Optimization */}
          <TabsContent value="meta-tags" className="space-y-4 pt-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold">SEO & OpenGraph Copywriting</h4>
                <p className="text-[10px] text-muted-foreground">
                  Character-calibrated Meta Title & Description.
                </p>
              </div>
              <Button
                size="sm"
                variant="default"
                disabled={isLoading || !apiKey}
                onClick={() => executeAction('meta-tags', articleHtml, publishState)}
                className="h-7 text-[11px] gap-1 bg-violet-600 text-white hover:bg-violet-700 px-2.5"
              >
                {isLoading && activeAction === 'meta-tags' ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
                <span>Optimize</span>
              </Button>
            </div>

            {!metaTagSuggestions && !isLoading && (
              <div className="text-center py-6 text-[11px] text-muted-foreground border border-dashed rounded-lg">
                Click "Optimize" to generate character-calibrated titles & descriptions.
              </div>
            )}

            {metaTagSuggestions && (
              <div className="space-y-3">
                <div className="p-3 rounded-xl border bg-card space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">Meta Title</span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {metaTagSuggestions.metaTitle.charCount} chars
                    </span>
                  </div>
                  <p className="text-xs font-medium">{metaTagSuggestions.metaTitle.value}</p>
                </div>

                <div className="p-3 rounded-xl border bg-card space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">Meta Description</span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {metaTagSuggestions.metaDescription.charCount} chars
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {metaTagSuggestions.metaDescription.value}
                  </p>
                </div>

                <Button
                  size="sm"
                  className="w-full h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={handleApplyMetaSuggestions}
                >
                  <Check className="h-3 w-3" />
                  <span>Apply Meta Tags to Sidebar</span>
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Tab 5: Full SEO Audit */}
          <TabsContent value="audit" className="space-y-4 pt-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold">SEO Audit</h4>
                <p className="text-[10px] text-muted-foreground">
                  Structure, headings, keywords & readability.
                </p>
              </div>
              <Button
                size="sm"
                variant="default"
                disabled={isLoading || !apiKey}
                onClick={() => executeAction('audit', articleHtml, publishState)}
                className="h-7 text-[11px] gap-1 bg-violet-600 text-white hover:bg-violet-700 px-2.5"
              >
                {isLoading && activeAction === 'audit' ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
                <span>Audit</span>
              </Button>
            </div>

            {!auditReport && !isLoading && (
              <div className="text-center py-6 text-[11px] text-muted-foreground border border-dashed rounded-lg">
                Click "Audit" for an instant technical SEO evaluation score.
              </div>
            )}

            {auditReport && (
              <div className="space-y-3">
                <div className="p-3 rounded-xl border bg-card flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold">SEO Health Score</h5>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{auditReport.summary}</p>
                  </div>
                  <div className="text-xl font-black font-mono text-violet-600 dark:text-violet-400">
                    {auditReport.score}/100
                  </div>
                </div>

                <div className="space-y-2">
                  {auditReport.items.map((item) => (
                    <div key={item.id} className="p-2.5 rounded-lg border text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[11px]">{item.title}</span>
                        <Badge
                          variant={
                            item.severity === 'pass'
                              ? 'secondary'
                              : item.severity === 'error'
                              ? 'destructive'
                              : 'outline'
                          }
                          className="text-[9px] uppercase px-1 py-0"
                        >
                          {item.severity}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-[10px]">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </aside>
  );
}
