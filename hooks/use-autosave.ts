'use client';

import * as React from 'react';
import { EditorState } from '@/types/editor';

const AUTOSAVE_KEY_PREFIX = 'wethedevs_draft_';

export function useAutosave(
  documentSlug: string | 'new',
  editorState: EditorState,
  onSave?: (state: EditorState) => void
) {
  const [lastSaved, setLastSaved] = React.useState<string | null>(
    editorState.lastSavedAt || null
  );

  const storageKey = `${AUTOSAVE_KEY_PREFIX}${documentSlug}`;

  // Save to localStorage
  const saveToLocal = React.useCallback(
    (state: EditorState) => {
      try {
        const payload = JSON.stringify({
          ...state,
          lastSavedAt: new Date().toISOString(),
        });
        localStorage.setItem(storageKey, payload);
        const now = new Date().toLocaleTimeString();
        setLastSaved(now);
        if (onSave) onSave(state);
      } catch {
        // Ignored if quota exceeded
      }
    },
    [storageKey, onSave]
  );

  // 30-second interval timer
  React.useEffect(() => {
    if (!editorState.isDirty) return;

    const interval = setInterval(() => {
      saveToLocal(editorState);
    }, 30000);

    return () => clearInterval(interval);
  }, [editorState, saveToLocal]);

  // Warn on navigation if unsaved changes exist
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (editorState.isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [editorState.isDirty]);

  // Load draft from localStorage on mount
  const getSavedLocalDraft = React.useCallback((): EditorState | null => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      return JSON.parse(raw) as EditorState;
    } catch {
      return null;
    }
  }, [storageKey]);

  return {
    lastSaved,
    saveToLocal,
    getSavedLocalDraft,
  };
}
