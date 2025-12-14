import { IconKeyboard } from '@tabler/icons-react';
import { Github } from 'lucide-react';
import Image from 'next/image';

import { SignIn } from '@/components/auth/AuthButton';
import FeatureCard from '@/components/welcome/FeatureCard';

export default function Home() {
  return (
    <>
      <section className="relative flex-1 overflow-hidden bg-background">
        <div
          className={`
            absolute inset-0 animate-pulse
            bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]
            bg-[size:50px_50px]
          `}
        />

        <div
          className={`
            absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full
            bg-primary/10 blur-3xl
          `}
        />
        <div
          className={`
            absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full
            bg-secondary/10 blur-3xl delay-1000
          `}
        />

        <div className="relative z-10 container mx-auto flex min-h-[50vh] items-center justify-center px-6">
          <div className="mx-auto text-center">
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <Image src="/logo.svg" alt="Typrogram Logo" width={512} height={512} />
              </div>
            </div>
            <h1 className="mb-6 text-5xl font-bold text-foreground">
              Practice Typing Through{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Real Code
              </span>
            </h1>
            <p className="mb-8 text-xl text-foreground">Import code from GitHub repository and practice typing it.</p>
            <div className="flex justify-center">
              <SignIn provider="github" large>
                Sign in with GitHub to Start
              </SignIn>
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-background py-16">
        <div className="relative z-10 container mx-auto px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">How to Use Typrogram</h2>
            <p className="mb-16 text-lg text-muted-foreground">
              Get started with just 2 simple steps to improve your typing skills.
            </p>
          </div>

          <div
            className={`
              grid gap-8
              md:grid-cols-2
            `}
          >
            <FeatureCard
              step={1}
              title="Import GitHub Repository"
              description="Input a GitHub repository URL you want to practice with. Select the extensions you want to type and import the source code."
              videoSrc="/demo/step1_import-repository.mp4"
              thumbnailSrc="/demo/step1_thumbnail.png"
              icon={<Github className="h-8 w-8 flex-shrink-0 text-primary" />}
              borderColor="hover:border-primary/50"
              bgColor="bg-primary/20 group-hover:bg-primary/30"
              textColor="text-primary"
            />

            <FeatureCard
              step={2}
              title="Start Typing Practice"
              description="Select the file and begin typing. You can track your accuracy and speed in real-time."
              videoSrc="/demo/step2_typing.mp4"
              thumbnailSrc="/demo/step2_thumbnail.png"
              icon={<IconKeyboard className="h-8 w-8 flex-shrink-0 text-secondary" />}
              borderColor="hover:border-secondary/50"
              bgColor="bg-secondary/20 group-hover:bg-secondary/30"
              textColor="text-secondary"
            />
          </div>
        </div>
      </section>
    </>
  );
}
