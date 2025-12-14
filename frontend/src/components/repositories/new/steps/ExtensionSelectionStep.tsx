'use client';

import type { Extension, RepositoryPreview, WizardData } from '@/types';

import { CheckSquare, ChevronLeftIcon, ChevronRightIcon, File, Square } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import RepositoryCard from '../common/RepositoryCard';

type ExtensionSelectionStepProps = {
  repositoryPreview: RepositoryPreview;
  initialSelectedExtensions: Extension[];
  onNext: (data: Partial<WizardData>) => void;
  onBack: () => void;
};

export default function ExtensionSelectionStep({
  repositoryPreview,
  initialSelectedExtensions,
  onNext,
  onBack,
}: ExtensionSelectionStepProps) {
  const [selectedExtensions, setSelectedExtensions] = useState<Extension[]>(initialSelectedExtensions);

  const selectedNameSet = useMemo(() => new Set(selectedExtensions.map((e) => e.name)), [selectedExtensions]);
  const isExtensionSelected = (extension: Extension) => selectedNameSet.has(extension.name);

  const handleExtensionToggle = (extension: Extension) => {
    setSelectedExtensions((prev) => {
      const isSelected = isExtensionSelected(extension);

      if (isSelected) {
        return prev.filter((selectedExtension) => selectedExtension.name !== extension.name);
      } else {
        return [...prev, extension];
      }
    });
  };

  const handleSelectAll = () => {
    setSelectedExtensions([...repositoryPreview.extensions]);
  };

  const handleDeselectAll = () => {
    setSelectedExtensions([]);
  };

  const handleNext = () => {
    onNext({ selectedExtensions });
  };

  const totalFiles = repositoryPreview.extensions.reduce((sum, ext) => sum + (ext.fileCount || 0), 0);
  const selectedFiles = selectedExtensions.reduce((sum, ext) => sum + (ext.fileCount || 0), 0);

  return (
    <div className="space-y-6">
      <RepositoryCard repositoryPreview={repositoryPreview} />

      <div
        className={`
          flex flex-col space-y-3
          md:flex-row md:items-center md:justify-between md:space-y-0
        `}
      >
        <div className="text-sm text-muted-foreground">
          {selectedExtensions.length} / {repositoryPreview.extensions.length} extensions selected ({selectedFiles} /{' '}
          {totalFiles} files)
        </div>
        <div>
          <div
            className={`
              flex flex-col space-y-2
              md:flex-row md:space-y-0 md:space-x-2
            `}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className={`
                w-full
                md:w-auto
              `}
            >
              <CheckSquare className="mr-2 h-4 w-4" />
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeselectAll}
              className={`
                w-full
                md:w-auto
              `}
            >
              <Square className="mr-2 h-4 w-4" />
              Deselect All
            </Button>
          </div>
        </div>
      </div>

      <div
        className={`
          grid grid-cols-1 gap-3
          md:grid-cols-2
        `}
      >
        {repositoryPreview.extensions.map((extension) => (
          <Card
            key={extension.name}
            variant={isExtensionSelected(extension) ? 'selectedInteractive' : 'interactive'}
            className="p-4"
            onClick={() => handleExtensionToggle(extension)}
          >
            <div className="flex items-center space-x-3">
              <Checkbox checked={isExtensionSelected(extension)} onChange={() => handleExtensionToggle(extension)} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{extension.name}</span>
                  <span className="text-sm text-muted-foreground">{extension.fileCount ?? 0} files</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {repositoryPreview.extensions.length === 0 && (
        <Card className="p-8 text-center">
          <File className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 font-medium">No files found</h3>
          <p className="text-sm text-muted-foreground">This repository has no files.</p>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeftIcon className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleNext} variant="outline" disabled={selectedExtensions.length === 0}>
          Next
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
