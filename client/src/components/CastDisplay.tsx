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
    <div className="bg-white rounded-xl border border-fc-gray-200 p-4">
      <div className="flex items-start space-x-3 mb-4">
        <div className="w-10 h-10 bg-fc-purple rounded-full flex-shrink-0 flex items-center justify-center">
          <User className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-fc-gray-900">@{cast.authorUsername}</span>
            <span className="text-fc-gray-500 text-sm">·</span>
            <span className="text-fc-gray-500 text-sm">{formatTimestamp(cast.timestamp)}</span>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-base leading-relaxed text-fc-gray-900">
          {cast.content}
        </p>
      </div>

      <div className="flex items-center space-x-6 text-fc-gray-500 text-sm">
        <div className="flex items-center space-x-1">
          <i className="fas fa-heart text-xs" aria-hidden="true"></i>
          <span>{cast.likesCount}</span>
        </div>
        <div className="flex items-center space-x-1">
          <i className="fas fa-retweet text-xs" aria-hidden="true"></i>
          <span>{cast.recastsCount}</span>
        </div>
        <div className="flex items-center space-x-1">
          <i className="fas fa-comment text-xs" aria-hidden="true"></i>
          <span>{cast.repliesCount}</span>
        </div>
      </div>
    </div>
  );
}
