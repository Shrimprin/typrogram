'use client';

import type { RepositoryPreview, WizardData } from '@/types';

import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronRightIcon, LoaderCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { axiosGet } from '@/utils/axios';
import { extractErrorMessage } from '@/utils/error-handler';

type FormValues = {
  url: string;
};

const schema = z.object({
  url: z
    .string()
    .nonempty('URL is required.')
    .url('Enter a valid URL.')
    .regex(/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/, 'Enter a valid GitHub repository URL.'),
});

type UrlInputStepProps = {
  initialUrl: string;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onNext: (data: Partial<WizardData>) => void;
};

export default function UrlInputStep({ initialUrl, isLoading, setIsLoading, onNext }: UrlInputStepProps) {
  const [errorMessage, setErrorMessage] = useState<string>();
  const { data: session } = useSession();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      url: initialUrl,
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setErrorMessage(undefined);

    try {
      const accessToken = session?.user?.accessToken;
      const url = '/api/repositories/preview';
      const postData = { repository_preview: { url: data.url } };
      const res = await axiosGet(url, accessToken, postData);
      const repositoryPreview: RepositoryPreview = res.data;

      onNext({
        url: data.url,
        repositoryPreview,
        selectedExtensions: repositoryPreview.extensions,
      });
    } catch (error) {
      setErrorMessage(extractErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>GitHub Repository URL</FormLabel>
              <FormControl>
                <Input placeholder="https://github.com/username/repository" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {errorMessage && (
          <div className="text-sm whitespace-pre-line text-destructive">
            <div className="inline-block text-left">{errorMessage}</div>
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit" variant="outline" disabled={isLoading}>
            <span>Next</span>
            {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ChevronRightIcon className="h-4 w-4" />}
          </Button>
        </div>
      </form>
    </Form>
  );
}
