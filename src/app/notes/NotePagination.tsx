'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { Pagination } from '@/components/ui/pagination';

interface NotePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  kategori?: string;
}

export function NotePagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  kategori,
}: NotePaginationProps) {
  const router = useRouter();
  const pathname = usePathname();

  const buildUrl = useCallback(
    (page: number, limit: number) => {
      const params = new URLSearchParams();
      if (kategori) params.set('kategori', kategori);
      params.set('page', page.toString());
      params.set('limit', limit.toString());
      return `${pathname}?${params.toString()}`;
    },
    [pathname, kategori]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      router.push(buildUrl(page, itemsPerPage));
    },
    [router, buildUrl, itemsPerPage]
  );

  const handleLimitChange = useCallback(
    (limit: number) => {
      router.push(buildUrl(1, limit));
    },
    [router, buildUrl]
  );

  if (totalPages <= 1) {
    return (
      <Pagination
        currentPage={1}
        totalPages={1}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={() => {}}
        onLimitChange={handleLimitChange}
      />
    );
  }

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
      onPageChange={handlePageChange}
      onLimitChange={handleLimitChange}
    />
  );
}