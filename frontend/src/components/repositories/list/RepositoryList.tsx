import type { PaginationInfo, Repository } from '@/types/repository';

import { FolderOpen, Plus } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import RepositoryListItem from './RepositoryListItem';
import RepositoryPagination from './RepositoryPagination';

type Props = {
  repositories: Repository[];
  pagination: PaginationInfo;
};

export default function RepositoryList({ repositories, pagination }: Props) {
  const isPagination = repositories.length > 0 && pagination.totalPages > 1;

  return (
    <section className="container mx-auto flex max-w-4xl flex-grow flex-col py-4">
      <div className="flex-grow">
        {repositories.length > 0 ? (
          <ul role="list" className="divide-y">
            {repositories.map((repository) => (
              <RepositoryListItem key={repository.id} repository={repository} />
            ))}
          </ul>
        ) : (
          <div className="py-12 text-center">
            <div className="mb-4">
              <FolderOpen className="mx-auto h-12 w-12" />
            </div>
            <h3 className="mb-2 text-lg font-medium">No repositories</h3>
            <p className="mb-6 text-sm text-muted-foreground">Add a repository to start typing.</p>
            <Button variant="outline" asChild>
              <Link href="/repositories/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Repository
              </Link>
            </Button>
          </div>
        )}
      </div>

      {isPagination && <RepositoryPagination pagination={pagination} />}
    </section>
  );
}
