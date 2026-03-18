'use client';

import { cn } from '@/lib/utils';

interface PopularSearchTagsProps {
  tags?: string[];
  onTagClick?: (tag: string) => void;
  className?: string;
}

const DEFAULT_TAGS = ['Amoksisilin', 'Metformin', 'Kunyit', 'INR Lab', 'BMI'];

export function PopularSearchTags({
  tags = DEFAULT_TAGS,
  onTagClick,
  className,
}: PopularSearchTagsProps) {
  return (
    <div className={cn('flex items-center justify-center gap-2 flex-wrap mt-3', className)}>
      <span className="text-xs text-muted-foreground">Populer:</span>
      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          className="search-tag"
          onClick={() => onTagClick?.(tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}