import type { RepositoryPreview } from '@/types';

import { Card } from '@/components/ui/card';
import { Github } from 'lucide-react';

type RepositoryCardProps = {
  repositoryPreview: Pick<RepositoryPreview, 'name' | 'url'>;
};

export default function RepositoryCard({ repositoryPreview }: RepositoryCardProps) {
  return (
    <Card className="p-4" variant="interactive">
      <a href={repositoryPreview.url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3">
        <Github className="h-5 w-5 text-muted-foreground" />
        <div>
          <span className="font-medium">{repositoryPreview.name}</span>
          <p className="text-sm text-muted-foreground">{repositoryPreview.url}</p>
        </div>
      </a>
    </Card>
  );
}
