import React from 'react';

interface SavedBadgeProps {
  count: number;
}

export default function SavedBadge({ count }: SavedBadgeProps) {
  return (
    <div className="saved-badge">
      {count} saved
    </div>
  );
}
