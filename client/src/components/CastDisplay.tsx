import { User } from "lucide-react";
import type { Cast } from "@shared/schema";

interface CastDisplayProps {
  cast: Cast;
}

export default function CastDisplay({ cast }: CastDisplayProps) {
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    }
  };

  return (
    <div className="bg-surface rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-start space-x-3 mb-4">
        <div className="w-12 h-12 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center">
          <User className="h-6 w-6 text-gray-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-text-primary">@{cast.authorUsername}</span>
            <span className="text-text-secondary text-sm">{formatTimestamp(cast.timestamp)}</span>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <p className="text-lg leading-relaxed text-text-primary">
          {cast.content}
        </p>
      </div>

      <div className="flex items-center space-x-6 text-text-secondary text-sm">
        <span>{cast.likesCount} likes</span>
        <span>{cast.recastsCount} recasts</span>
        <span>{cast.repliesCount} replies</span>
      </div>
    </div>
  );
}
