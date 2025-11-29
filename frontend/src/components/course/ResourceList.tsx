import { useState, useMemo } from 'react';
import GlassmorphicCard from '../common/GlassmorphicCard';

interface Resource {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}

interface ResourceListProps {
  resources: Resource[];
  className?: string;
}

export default function ResourceList({ resources, className = '' }: ResourceListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Get unique file types
  const fileTypes = useMemo(() => {
    const types = new Set(resources.map((r) => r.fileType.toLowerCase()));
    return Array.from(types).sort();
  }, [resources]);

  // Filter resources
  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesSearch =
        searchQuery === '' ||
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType =
        filterType === 'all' || resource.fileType.toLowerCase() === filterType.toLowerCase();

      return matchesSearch && matchesType;
    });
  }, [resources, searchQuery, filterType]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getFileIcon = (fileType: string): string => {
    const type = fileType.toLowerCase();
    if (type.includes('pdf')) return '📄';
    if (type.includes('doc') || type.includes('word')) return '📝';
    if (type.includes('xls') || type.includes('excel') || type.includes('sheet')) return '📊';
    if (type.includes('ppt') || type.includes('presentation')) return '📽️';
    if (type.includes('zip') || type.includes('rar') || type.includes('archive')) return '📦';
    if (type.includes('image') || type.includes('jpg') || type.includes('png')) return '🖼️';
    if (type.includes('video') || type.includes('mp4')) return '🎥';
    if (type.includes('audio') || type.includes('mp3')) return '🎵';
    return '📎';
  };

  if (resources.length === 0) {
    return (
      <GlassmorphicCard className={className}>
        <h2 className="text-xl font-bold text-white mb-4">Lesson Resources</h2>
        <p className="text-center text-gray-400 text-sm py-8">
          No resources available for this lesson yet.
        </p>
      </GlassmorphicCard>
    );
  }

  return (
    <GlassmorphicCard className={className}>
      <h2 className="text-xl font-bold text-white mb-4">Lesson Resources</h2>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search Input */}
        <div className="flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search resources..."
            className="w-full px-4 py-2 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-hot-pink transition-colors"
          />
        </div>

        {/* File Type Filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 bg-black/30 border border-white/20 rounded-lg text-white focus:outline-none focus:border-hot-pink transition-colors cursor-pointer"
        >
          <option value="all">All Types</option>
          {fileTypes.map((type) => (
            <option key={type} value={type}>
              {type.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Results Count */}
      {(searchQuery || filterType !== 'all') && (
        <p className="text-sm text-gray-400 mb-4">
          Showing {filteredResources.length} of {resources.length} resources
        </p>
      )}

      {/* Resources List */}
      <div className="space-y-3">
        {filteredResources.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">
            No resources match your search criteria.
          </p>
        ) : (
          filteredResources.map((resource) => (
            <a
              key={resource.id}
              href={resource.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="flex items-center justify-between p-4 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 hover:border-hot-pink/50 transition-all group"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-3xl flex-shrink-0">
                  {getFileIcon(resource.fileType)}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold truncate group-hover:text-hot-pink transition-colors">
                    {resource.title}
                  </h3>
                  {resource.description && (
                    <p className="text-gray-400 text-sm line-clamp-2">{resource.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-hot-pink/20 text-hot-pink text-xs font-semibold rounded">
                      {resource.fileType.toUpperCase()}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {formatFileSize(resource.fileSize)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 ml-4">
                <span className="text-hot-pink text-xl group-hover:scale-110 transition-transform inline-block">
                  ↓
                </span>
              </div>
            </a>
          ))
        )}
      </div>

      {/* Download All Button */}
      {filteredResources.length > 1 && (
        <div className="mt-6 pt-6 border-t border-white/10">
          <button
            onClick={() => {
              filteredResources.forEach((resource) => {
                window.open(resource.fileUrl, '_blank');
              });
            }}
            className="w-full px-4 py-3 bg-hot-pink/20 border border-hot-pink/50 text-hot-pink font-semibold rounded-lg hover:bg-hot-pink/30 transition-colors"
          >
            Download All ({filteredResources.length} files)
          </button>
        </div>
      )}
    </GlassmorphicCard>
  );
}
