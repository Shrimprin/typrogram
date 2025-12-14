'use client';

import type { WizardData } from '@/types';

import { CheckCircle, ChevronLeftIcon, File, LoaderCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { axiosPost } from '@/utils/axios';
import { extractErrorMessage } from '@/utils/error-handler';
import RepositoryCard from '../common/RepositoryCard';

type CreationConfirmStepProps = {
  wizardData: WizardData;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onBack: () => void;
  onComplete: (repositoryId: string) => void;
};

export default function CreationConfirmStep({
  wizardData,
  isLoading,
  setIsLoading,
  onBack,
  onComplete,
}: CreationConfirmStepProps) {
  const [errorMessage, setErrorMessage] = useState<string>();
  const { data: session } = useSession();

  const handleCreate = async () => {
    setIsLoading(true);
    setErrorMessage(undefined);

    try {
      const accessToken = session?.user?.accessToken;
      const extensions = wizardData.repositoryPreview!.extensions.map((ext) => ({
        name: ext.name,
        isActive: wizardData.selectedExtensions.some((selectedExt) => selectedExt.name === ext.name),
      }));

      const response = await axiosPost('/api/repositories', accessToken, {
        repository: {
          url: wizardData.url,
          extensionsAttributes: extensions,
        },
      });

      onComplete(response.data.id);
    } catch (error) {
      setErrorMessage(extractErrorMessage(error));
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Repository</h2>
        </div>
        <RepositoryCard repositoryPreview={wizardData.repositoryPreview!} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Selected Extensions</h2>
        </div>
        <div
          className={`
            grid grid-cols-2 gap-3
            md:grid-cols-3
            lg:grid-cols-4
          `}
        >
          {wizardData.selectedExtensions.map((extension) => (
            <Card key={extension.name} className="p-3">
              <div className="flex items-center gap-2">
                <File className="h-4 w-4 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{extension.name}</div>
                  <div className="text-xs text-muted-foreground">{extension.fileCount} files</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <CheckCircle className="h-5 w-5 flex-shrink-0 text-primary" />
        <div>
          <p className="font-medium">Create repository?</p>
          <p className="text-sm text-muted-foreground">
            The repository will be created and you can start typing immediately.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="text-sm whitespace-pre-line text-destructive">
          <div className="inline-block text-left">{errorMessage}</div>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isLoading}>
          <ChevronLeftIcon className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleCreate} variant="primary" disabled={isLoading}>
          {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
          Create
        </Button>
      </div>
    </div>
  );
}
