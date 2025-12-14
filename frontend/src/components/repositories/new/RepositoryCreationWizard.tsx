'use client';

import type { WizardData, WizardStep } from '@/types';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import CreationConfirmStep from './steps/CreationConfirmStep';
import ExtensionSelectionStep from './steps/ExtensionSelectionStep';
import UrlInputStep from './steps/UrlInputStep';

const stepsInfo: { key: WizardStep; title: string; description: string }[] = [
  {
    key: 'url',
    title: 'Step 1: Repository URL',
    description: 'Enter the GitHub repository URL.',
  },
  {
    key: 'extension',
    title: 'Step 2: Extensions',
    description: 'Select the extensions you want to type.',
  },
  {
    key: 'confirm',
    title: 'Step 3: Confirm & Create',
    description: 'Review the settings and create the repository.',
  },
];

export default function RepositoryCreationWizard() {
  const [currentStep, setCurrentStep] = useState<WizardStep>('url');
  const [wizardData, setWizardData] = useState<WizardData>({
    url: '',
    selectedExtensions: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const getCurrentStepIndex = () => stepsInfo.findIndex((stepInfo) => stepInfo.key === currentStep);

  const handleNext = (data: Partial<WizardData>) => {
    setWizardData((prev) => ({ ...prev, ...data }));

    const currentStepIndex = getCurrentStepIndex();
    if (currentStepIndex < stepsInfo.length - 1) {
      setCurrentStep(stepsInfo[currentStepIndex + 1].key);
    }
  };

  const handleBack = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setCurrentStep(stepsInfo[currentIndex - 1].key);
    }
  };

  const handleComplete = async (repositoryId: string) => {
    router.push(`/repositories/${repositoryId}`);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'url':
        return (
          <UrlInputStep
            initialUrl={wizardData.url}
            onNext={handleNext}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        );
      case 'extension':
        return (
          <ExtensionSelectionStep
            repositoryPreview={wizardData.repositoryPreview!}
            initialSelectedExtensions={wizardData.selectedExtensions}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 'confirm':
        return (
          <CreationConfirmStep
            wizardData={wizardData}
            onBack={handleBack}
            onComplete={handleComplete}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        );
      default:
        return null;
    }
  };

  const currentStepIndex = getCurrentStepIndex();
  const currentStepInfo = stepsInfo[currentStepIndex];
  const progress = ((currentStepIndex + 1) / stepsInfo.length) * 100;

  return (
    <div
      className={`
        mx-auto max-w-2xl space-y-6 px-4
        sm:px-6
      `}
    >
      <div className="overflow-x-auto">
        <Card className="min-w-[360px]">
          <CardHeader className="space-y-4">
            <div
              className={`
                flex flex-col space-y-3
                sm:flex-row sm:items-center sm:justify-between sm:space-y-0
              `}
            >
              <div className="min-w-0 flex-1">
                <CardTitle className="break-words">{currentStepInfo.title}</CardTitle>
                <CardDescription className="break-words">{currentStepInfo.description}</CardDescription>
              </div>
              <div className="flex-shrink-0 text-sm text-muted-foreground">
                {currentStepIndex + 1} / {stepsInfo.length}
              </div>
            </div>
            <Progress value={progress} className="w-full" />
          </CardHeader>
          <CardContent
            className={`
              px-4
              sm:px-6
            `}
          >
            {renderCurrentStep()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
