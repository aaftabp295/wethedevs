'use client';

import * as React from 'react';
import {
  InternalLinkSuggestion,
  ExternalLinkSuggestion,
  SchemaResultItem,
  MetaTagSuggestions,
  AuditReport,
  AiSeoAction,
} from '@/types/ai-seo';
import { PublishSidebarState } from '@/types/editor';
import { ManifestEntry } from '@/types/content';

const LOCAL_STORAGE_KEY = 'wethedevs_gemini_api_key';

export function useAiSeo() {
  const [apiKey, setApiKeyState] = React.useState<string>('');
  const [isKeyValid, setIsKeyValid] = React.useState<boolean | null>(null);
  const [isValidatingKey, setIsValidatingKey] = React.useState<boolean>(false);

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [activeAction, setActiveAction] = React.useState<AiSeoAction | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // Results state
  const [internalLinks, setInternalLinks] = React.useState<InternalLinkSuggestion[]>([]);
  const [externalLinks, setExternalLinks] = React.useState<ExternalLinkSuggestion[]>([]);
  const [schemaResults, setSchemaResults] = React.useState<SchemaResultItem[]>([]);
  const [metaTagSuggestions, setMetaTagSuggestions] = React.useState<MetaTagSuggestions | null>(null);
  const [auditReport, setAuditReport] = React.useState<AuditReport | null>(null);

  // Load API Key on Mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem(LOCAL_STORAGE_KEY) || '';
      setApiKeyState(savedKey);
      if (savedKey) {
        validateKey(savedKey);
      }
    }
  }, []);

  const saveApiKey = React.useCallback(async (newKey: string) => {
    const trimmed = newKey.trim();
    setApiKeyState(trimmed);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, trimmed);
    }
    if (trimmed) {
      await validateKey(trimmed);
    } else {
      setIsKeyValid(null);
    }
  }, []);

  const validateKey = React.useCallback(async (keyToTest: string) => {
    if (!keyToTest) {
      setIsKeyValid(null);
      return false;
    }

    setIsValidatingKey(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/seo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${keyToTest}`,
        },
        body: JSON.stringify({
          action: 'validate-key',
          articleHtml: '',
          publishState: {},
        }),
      });

      const data = await res.json();
      if (res.ok && data.valid) {
        setIsKeyValid(true);
        setIsValidatingKey(false);
        return true;
      } else {
        setIsKeyValid(false);
        setError(data.error || 'Invalid API Key');
        setIsValidatingKey(false);
        return false;
      }
    } catch (err: unknown) {
      setIsKeyValid(false);
      setError(err instanceof Error ? err.message : 'Failed to validate API key');
      setIsValidatingKey(false);
      return false;
    }
  }, []);

  const executeAction = React.useCallback(
    async (
      action: AiSeoAction,
      articleHtml: string,
      publishState: PublishSidebarState,
      manifest?: ManifestEntry[]
    ) => {
      if (!apiKey) {
        setError('Please provide and save your Gemini API key first.');
        return null;
      }

      setIsLoading(true);
      setActiveAction(action);
      setError(null);

      try {
        const res = await fetch('/api/ai/seo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            action,
            articleHtml,
            publishState,
            manifest,
          }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || `Failed to perform ${action}`);
        }

        const resultData = data.data;

        if (action === 'internal-links') {
          const suggestions = (resultData?.suggestions || []).map(
            (s: Partial<InternalLinkSuggestion>, idx: number) => ({
              ...s,
              id: `int-${Date.now()}-${idx}`,
              type: s.type || 'inline',
              status: 'pending',
            })
          );
          setInternalLinks(suggestions);
        } else if (action === 'external-links') {
          const suggestions = (resultData?.suggestions || []).map(
            (s: Partial<ExternalLinkSuggestion>, idx: number) => ({
              ...s,
              id: `ext-${Date.now()}-${idx}`,
              status: 'pending',
            })
          );
          setExternalLinks(suggestions);
        } else if (action === 'schema') {
          setSchemaResults(resultData?.schemas || []);
        } else if (action === 'meta-tags') {
          setMetaTagSuggestions(resultData || null);
        } else if (action === 'audit') {
          setAuditReport(resultData || null);
        }

        return resultData;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'AI SEO request failed';
        setError(msg);
        return null;
      } finally {
        setIsLoading(false);
        setActiveAction(null);
      }
    },
    [apiKey]
  );

  const updateInternalLinkStatus = React.useCallback(
    (id: string, status: 'accepted' | 'rejected' | 'pending') => {
      setInternalLinks((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status } : item))
      );
    },
    []
  );

  const updateExternalLinkStatus = React.useCallback(
    (id: string, status: 'accepted' | 'rejected' | 'pending') => {
      setExternalLinks((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status } : item))
      );
    },
    []
  );

  return {
    apiKey,
    saveApiKey,
    isKeyValid,
    isValidatingKey,
    isLoading,
    activeAction,
    error,
    setError,

    // Results
    internalLinks,
    externalLinks,
    schemaResults,
    metaTagSuggestions,
    auditReport,

    // Actions
    executeAction,
    updateInternalLinkStatus,
    updateExternalLinkStatus,
  };
}
