import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../services/api';
import { useToast } from './useToast';
import { logger } from '../utils/logger';

interface Note {
  id: string;
  content: string;
  timestamp: number | null;
  createdAt: Date;
  updatedAt: Date;
}

interface UseAutoSaveNotesOptions {
  lessonId: string;
  initialContent?: string;
  initialNoteId?: string | null;
  autoSaveInterval?: number; // in milliseconds, default 30 seconds
  enabled?: boolean;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

/**
 * Hook for auto-saving notes with debouncing and conflict resolution
 */
export function useAutoSaveNotes({
  lessonId,
  initialContent = '',
  initialNoteId = null,
  autoSaveInterval = 30000, // 30 seconds
  enabled = true,
}: UseAutoSaveNotesOptions) {
  const [content, setContent] = useState(initialContent);
  const [noteId, setNoteId] = useState<string | null>(initialNoteId);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { error: showError, info: showInfo } = useToast();

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContentRef = useRef<string>(initialContent);
  const isSavingRef = useRef<boolean>(false);

  /**
   * Save note to server
   */
  const saveNote = useCallback(
    async (noteContent: string, videoTimestamp?: number) => {
      if (!enabled || isSavingRef.current || noteContent.trim().length === 0) {
        return;
      }

      // Don't save if content hasn't changed
      if (noteContent === lastSavedContentRef.current) {
        return;
      }

      isSavingRef.current = true;
      setSaveStatus('saving');

      try {
        const response = await api.post(`/lessons/${lessonId}/notes/auto-save`, {
          content: noteContent,
          timestamp: videoTimestamp,
          noteId: noteId,
        });

        const savedNote: Note = response.data.data;
        setNoteId(savedNote.id);
        lastSavedContentRef.current = noteContent;
        setLastSaved(new Date());
        setSaveStatus('saved');

        // Store draft locally as backup
        localStorage.setItem(`note_draft_${lessonId}`, JSON.stringify({
          content: noteContent,
          noteId: savedNote.id,
          timestamp: videoTimestamp,
          lastSaved: new Date().toISOString(),
        }));
      } catch (error) {
        logger.error('Failed to save note', error);
        setSaveStatus('error');
        showError('Failed to save note');

        // Store draft locally on error
        localStorage.setItem(`note_draft_${lessonId}`, JSON.stringify({
          content: noteContent,
          noteId: noteId,
          timestamp: videoTimestamp,
          lastSaved: new Date().toISOString(),
          error: true,
        }));
      } finally {
        isSavingRef.current = false;
      }
    },
    [lessonId, noteId, enabled, showError]
  );

  /**
   * Debounced auto-save
   */
  const debouncedSave = useCallback(
    (noteContent: string, videoTimestamp?: number) => {
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Set new timeout
      saveTimeoutRef.current = setTimeout(() => {
        saveNote(noteContent, videoTimestamp);
      }, autoSaveInterval);
    },
    [saveNote, autoSaveInterval]
  );

  /**
   * Update content and trigger auto-save
   */
  const updateContent = useCallback(
    (newContent: string, videoTimestamp?: number) => {
      setContent(newContent);
      setSaveStatus('idle');
      debouncedSave(newContent, videoTimestamp);
    },
    [debouncedSave]
  );

  /**
   * Force immediate save
   */
  const forceSave = useCallback(
    async (videoTimestamp?: number) => {
      // Clear debounce timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      await saveNote(content, videoTimestamp);
    },
    [content, saveNote]
  );

  /**
   * Load draft from localStorage
   */
  const loadDraft = useCallback(() => {
    try {
      const draftStr = localStorage.getItem(`note_draft_${lessonId}`);
      if (draftStr) {
        const draft = JSON.parse(draftStr);
        setContent(draft.content);
        setNoteId(draft.noteId);
        lastSavedContentRef.current = draft.content;
        return draft;
      }
    } catch (error) {
      logger.error('Failed to load draft', error);
    }
    return null;
  }, [lessonId]);

  /**
   * Clear draft from localStorage
   */
  const clearDraft = useCallback(() => {
    localStorage.removeItem(`note_draft_${lessonId}`);
  }, [lessonId]);

  /**
   * Resolve conflict with server
   */
  const resolveConflict = useCallback(
    async (clientTimestamp: Date) => {
      if (!noteId) {
        return null;
      }

      try {
        const response = await api.post(
          `/lessons/${lessonId}/notes/${noteId}/resolve-conflict`,
          {
            content,
            clientTimestamp: clientTimestamp.toISOString(),
          }
        );

        const result = response.data.data;
        
        if (result.hadConflict) {
          // Server had newer data, update local content
          setContent(result.resolved.content);
          lastSavedContentRef.current = result.resolved.content;
          showInfo('Note updated with server version');
        }

        return result;
      } catch (error) {
        logger.error('Failed to resolve conflict', error);
        showError('Failed to sync note');
        return null;
      }
    },
    [lessonId, noteId, content, showError, showInfo]
  );

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Load draft on mount
   */
  useEffect(() => {
    if (enabled && !initialContent) {
      loadDraft();
    }
  }, [enabled, initialContent, loadDraft]);

  return {
    content,
    noteId,
    saveStatus,
    lastSaved,
    updateContent,
    forceSave,
    loadDraft,
    clearDraft,
    resolveConflict,
  };
}
