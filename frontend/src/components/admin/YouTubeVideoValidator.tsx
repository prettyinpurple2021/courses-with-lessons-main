import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import GlassmorphicButton from '../common/GlassmorphicButton';
import { 
  validateYouTubeVideo, 
  getYouTubeVideoMetadata, 
  extractVideoIdFromInput,
  formatDuration,
  YouTubeVideoMetadata 
} from '../../services/youtubeService';

interface YouTubeVideoValidatorProps {
  videoId?: string;
  onVideoIdChange?: (videoId: string, metadata?: YouTubeVideoMetadata) => void;
  className?: string;
}

export default function YouTubeVideoValidator({
  videoId: initialVideoId = '',
  onVideoIdChange,
  className = '',
}: YouTubeVideoValidatorProps) {
  const [input, setInput] = useState(initialVideoId);
  const [metadata, setMetadata] = useState<YouTubeVideoMetadata | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateMutation = useMutation({
    mutationFn: async (videoId: string) => {
      const validation = await validateYouTubeVideo(videoId);
      if (validation.isValid) {
        const meta = await getYouTubeVideoMetadata(videoId);
        return { validation, metadata: meta };
      }
      return { validation, metadata: null };
    },
    onSuccess: ({ validation, metadata: meta }) => {
      if (validation.isValid && meta) {
        setMetadata(meta);
        setValidationError(null);
        onVideoIdChange?.(validation.videoId, meta);
      } else {
        setMetadata(null);
        setValidationError(validation.message);
      }
    },
    onError: () => {
      setValidationError('Failed to validate video. Please try again.');
      setMetadata(null);
    },
  });

  const handleValidate = () => {
    const videoId = extractVideoIdFromInput(input);
    if (!videoId) {
      setValidationError('Invalid YouTube URL or video ID');
      return;
    }
    validateMutation.mutate(videoId);
  };


  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          YouTube Video URL or ID
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="https://youtube.com/watch?v=... or video ID"
            className="flex-1 px-4 py-2 bg-black/30 border border-white/20 rounded-lg text-white 
              placeholder-gray-500 focus:outline-none focus:border-hot-pink transition-colors"
          />
          <GlassmorphicButton
            onClick={handleValidate}
            loading={validateMutation.isPending}
            disabled={!input || validateMutation.isPending}
          >
            Validate
          </GlassmorphicButton>
        </div>
      </div>

      {validationError && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
          <p className="text-red-400 text-sm">{validationError}</p>
        </div>
      )}

      {metadata && (
        <div className="glassmorphic p-4 rounded-lg space-y-3">
          <div className="flex items-start gap-4">
            <img
              src={metadata.thumbnail}
              alt={metadata.title}
              className="w-32 h-20 object-cover rounded"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold mb-1 truncate">
                {metadata.title}
              </h3>
              <p className="text-gray-400 text-sm mb-2">{metadata.channelTitle}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>Duration: {formatDuration(metadata.duration)}</span>
                <span className="text-success-teal">✓ Valid & Embeddable</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
