import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import GlassmorphicCard from '../common/GlassmorphicCard';
import { useToast } from '../../contexts/ToastContext';

interface Note {
  id: string;
  content: string;
  timestamp: number | null;
  createdAt: string;
  updatedAt: string;
}

interface NoteTakingPanelProps {
  lessonId: string;
  currentVideoTime: number;
  className?: string;
}

export default function NoteTakingPanel({
  lessonId,
  currentVideoTime,
  className = '',
}: NoteTakingPanelProps) {
  const [noteContent, setNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Fetch notes
  const { data: notes = [] } = useQuery<Note[]>({
    queryKey: ['notes', lessonId],
    queryFn: async () => {
      const response = await api.get(`/lessons/${lessonId}/notes`);
      return response.data.data;
    },
  });

  // Create note mutation
  const createNoteMutation = useMutation({
    mutationFn: async (data: { content: string; timestamp?: number }) => {
      const response = await api.post(`/lessons/${lessonId}/notes`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', lessonId] });
      setNoteContent('');
      setLastSaved(new Date());
      showToast('Note saved!', 'success');
    },
    onError: () => {
      showToast('Failed to save note', 'error');
    },
  });

  // Update note mutation
  const updateNoteMutation = useMutation({
    mutationFn: async (data: { noteId: string; content: string; timestamp?: number }) => {
      const response = await api.put(`/lessons/${lessonId}/notes/${data.noteId}`, {
        content: data.content,
        timestamp: data.timestamp,
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', lessonId] });
      setEditingNoteId(null);
      setNoteContent('');
      setLastSaved(new Date());
      showToast('Note updated!', 'success');
    },
    onError: () => {
      showToast('Failed to update note', 'error');
    },
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      await api.delete(`/lessons/${lessonId}/notes/${noteId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', lessonId] });
      showToast('Note deleted', 'success');
    },
    onError: () => {
      showToast('Failed to delete note', 'error');
    },
  });

  // Auto-save mutation
  const autoSaveMutation = useMutation({
    mutationFn: async (data: { content: string; timestamp?: number }) => {
      const response = await api.post(`/lessons/${lessonId}/notes/auto-save`, data);
      return response.data.data;
    },
    onSuccess: () => {
      setIsSaving(false);
      setLastSaved(new Date());
      queryClient.invalidateQueries({ queryKey: ['notes', lessonId] });
    },
    onError: () => {
      setIsSaving(false);
    },
  });

  // Auto-save effect
  useEffect(() => {
    if (noteContent.trim().length > 0 && !editingNoteId) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      setIsSaving(true);
      autoSaveTimerRef.current = setTimeout(() => {
        autoSaveMutation.mutate({
          content: noteContent,
          timestamp: Math.floor(currentVideoTime),
        });
      }, 30000); // Auto-save after 30 seconds
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [noteContent, currentVideoTime, editingNoteId]);

  const handleSaveNote = () => {
    if (noteContent.trim().length === 0) {
      showToast('Please enter some content', 'error');
      return;
    }

    if (editingNoteId) {
      updateNoteMutation.mutate({
        noteId: editingNoteId,
        content: noteContent,
      });
    } else {
      createNoteMutation.mutate({
        content: noteContent,
        timestamp: Math.floor(currentVideoTime),
      });
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNoteId(note.id);
    setNoteContent(note.content);
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setNoteContent('');
  };

  const handleDeleteNote = (noteId: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      deleteNoteMutation.mutate(noteId);
    }
  };

  const formatTimestamp = (seconds: number | null) => {
    if (seconds === null) return 'No timestamp';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <GlassmorphicCard className={`camo-background-subtle ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">📝 Notes</h3>
        {isSaving && <span className="text-xs text-gray-400">Saving...</span>}
        {lastSaved && !isSaving && (
          <span className="text-xs text-gray-400">
            Saved {formatDate(lastSaved.toISOString())}
          </span>
        )}
      </div>

      {/* Note Input */}
      <div className="mb-6">
        <textarea
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          placeholder="Take notes while watching... (auto-saves every 30 seconds)"
          className="w-full h-32 px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-hot-pink transition-colors resize-none"
        />
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-gray-400">
            Video time: {formatTimestamp(currentVideoTime)}
          </span>
          <div className="flex gap-2">
            {editingNoteId && (
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleSaveNote}
              disabled={
                noteContent.trim().length === 0 ||
                createNoteMutation.isPending ||
                updateNoteMutation.isPending
              }
              className="px-4 py-2 bg-hot-pink text-white text-sm font-semibold rounded-lg hover:bg-hot-pink/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {editingNoteId ? 'Update' : 'Save'} Note
            </button>
          </div>
        </div>
      </div>

      {/* Notes List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {notes.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">
            No notes yet. Start taking notes while watching the video!
          </p>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="p-4 bg-black/20 border border-white/10 rounded-lg hover:border-white/20 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {note.timestamp !== null && (
                    <span className="px-2 py-1 bg-hot-pink/20 text-hot-pink text-xs font-semibold rounded">
                      {formatTimestamp(note.timestamp)}
                    </span>
                  )}
                  <span className="text-xs text-gray-500">{formatDate(note.createdAt)}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditNote(note)}
                    className="text-gray-400 hover:text-white transition-colors"
                    title="Edit note"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                    title="Delete note"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <p className="text-gray-300 text-sm whitespace-pre-wrap">{note.content}</p>
            </div>
          ))
        )}
      </div>
    </GlassmorphicCard>
  );
}
