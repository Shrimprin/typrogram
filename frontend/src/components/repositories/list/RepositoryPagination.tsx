'use client';

import type { PaginationInfo } from '@/types/repository';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { PAGINATION } from '@/constants/pagination';
import { useSearchParams } from 'next/navigation';

type Props = {
  pagination: PaginationInfo;
};

export default function RepositoryPagination({ pagination }: Props) {
  const searchParams = useSearchParams();
  const { currentPage, totalPages } = pagination;

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    return `/repositories?${params.toString()}`;
  };

  const createPageLink = (page: number) => (
    <PaginationItem key={page}>
      <PaginationLink href={createPageUrl(page)} isActive={currentPage === page}>
        {page}
      </PaginationLink>
    </PaginationItem>
  );

  const renderFirstPageIfNeeded = (startPage: number): React.JSX.Element[] => {
    const pageItems: React.JSX.Element[] = [];

    if (startPage > PAGINATION.MIN_PAGE) {
      pageItems.push(createPageLink(1));

      if (startPage > 2) {
        pageItems.push(<PaginationEllipsis key="start-ellipsis" />);
      }
    }

    return pageItems;
  };

  const renderCurrentPageRange = (startPage: number, endPage: number): React.JSX.Element[] => {
    const pageItems: React.JSX.Element[] = [];

    for (let page = startPage; page <= endPage; page++) {
      pageItems.push(createPageLink(page));
    }

    return pageItems;
  };

  const renderLastPageIfNeeded = (endPage: number): React.JSX.Element[] => {
    const pageItems: React.JSX.Element[] = [];

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageItems.push(<PaginationEllipsis key="end-ellipsis" />);
      }

      pageItems.push(createPageLink(totalPages));
    }

    return pageItems;
  };

  const renderPageNumbers = () => {
    const startPage = Math.max(PAGINATION.MIN_PAGE, currentPage - PAGINATION.PAGE_RANGE);
    const endPage = Math.min(totalPages, currentPage + PAGINATION.PAGE_RANGE);

    return [
      ...renderFirstPageIfNeeded(startPage),
      ...renderCurrentPageRange(startPage, endPage),
      ...renderLastPageIfNeeded(endPage),
    ];
  };

  return (
    <div className="flex items-center justify-between pt-4">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={pagination.hasPrev ? createPageUrl(currentPage - 1) : '#'}
              className={!pagination.hasPrev ? 'pointer-events-none text-muted-foreground' : ''}
            />
          </PaginationItem>

          {renderPageNumbers()}

          <PaginationItem>
            <PaginationNext
              href={pagination.hasNext ? createPageUrl(currentPage + 1) : '#'}
              className={!pagination.hasNext ? 'pointer-events-none text-muted-foreground' : ''}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
