import type { Metadata } from 'next';

import PageLayout from '@/components/common/PageLayout';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'This page describes the privacy policy for Typrogram.',
};

export default function PrivacyPolicy() {
  return (
    <PageLayout title="Privacy Policy" backHref="/">
      <div className="bg-background min-h-screen py-4">
        <div
          className={`
            container mx-auto max-w-4xl px-0
            sm:px-8
          `}
        >
          <div
            className={`
              bg-card/50 border-border/50 prose prose-slate max-w-none rounded-sm border p-8
              dark:prose-invert
            `}
          >
            <p className="text-foreground">
              This Privacy Policy (hereinafter, &quot;this Policy&quot;) describes how we handle users&apos; personal
              information in the service provided by Typrogram (hereinafter, &quot;the Service&quot;).
            </p>

            <section className="mt-8">
              <h2 className="text-foreground border-primary/30 mb-4 border-b pb-2 text-2xl font-bold">
                Article 1 (Personal Information)
              </h2>
              <p className="text-foreground mb-2">
                When you register for and use the Service, we collect the following information and treat it as personal
                information:
              </p>
              <ol className="text-foreground list-decimal space-y-2 pl-6">
                <li>Information related to GitHub accounts</li>
                <li>Other logs generated when accessing the Service</li>
              </ol>
            </section>

            <section className="mt-8">
              <h2 className="text-foreground border-primary/30 mb-4 border-b pb-2 text-2xl font-bold">
                Article 2 (Purpose of Collecting and Using Personal Information)
              </h2>
              <p className="text-foreground mb-2">
                The purposes for which the Service collects and uses personal information are as follows:
              </p>
              <ol className="text-foreground list-decimal space-y-2 pl-6">
                <li>To provide and operate the Service</li>
                <li>To respond to inquiries from users (including identity verification)</li>
                <li>To provide necessary notifications such as maintenance and important announcements</li>
                <li>
                  To identify and refuse service to users who violate the Terms of Use or attempt to use the Service for
                  fraudulent or improper purposes
                </li>
                <li>To allow users to view, modify, or delete their registration information and usage status</li>
                <li>For purposes incidental to the above</li>
              </ol>
            </section>

            <section className="mt-8">
              <h2 className="text-foreground border-primary/30 mb-4 border-b pb-2 text-2xl font-bold">
                Article 3 (Changes to Purpose of Use)
              </h2>
              <ol className="text-foreground list-decimal space-y-2 pl-6">
                <li>
                  We may change the purpose of use of personal information only if it is reasonably recognized that the
                  changed purpose is related to the purpose before the change.
                </li>
                <li>
                  When we change the purpose of use, we will notify users of the changed purpose by the method specified
                  by us or publish it on this website.
                </li>
              </ol>
            </section>

            <section className="mt-8">
              <h2 className="text-foreground border-primary/30 mb-4 border-b pb-2 text-2xl font-bold">
                Article 4 (Provision of Personal Information to Third Parties)
              </h2>
              <ol className="text-foreground list-decimal space-y-2 pl-6">
                <li>
                  We will not provide personal information to third parties without prior consent from users, except in
                  the following cases. However, this excludes cases permitted by the Personal Information Protection Act
                  and other laws.
                  <ul className="mt-2 list-disc space-y-1 pl-6">
                    <li>
                      When it is necessary for the protection of human life, body, or property and it is difficult to
                      obtain consent from the person
                    </li>
                    <li>
                      When it is particularly necessary for improving public health or promoting the sound growth of
                      children and it is difficult to obtain consent from the person
                    </li>
                    <li>
                      When it is necessary to cooperate with national agencies, local governments, or persons entrusted
                      by them in executing affairs prescribed by laws and regulations, and obtaining consent from the
                      person may hinder the execution of such affairs
                    </li>
                  </ul>
                </li>
                <li>
                  Notwithstanding the provisions of the preceding paragraph, the following cases shall not be considered
                  as provision to third parties:
                  <ul className="mt-2 list-disc space-y-1 pl-6">
                    <li>
                      When we entrust all or part of the handling of personal information to the extent necessary to
                      achieve the purpose of use
                    </li>
                    <li>
                      When personal information is provided due to business succession resulting from a merger or other
                      reasons
                    </li>
                    <li>
                      When personal information is used jointly with specific persons, and the user has been notified in
                      advance or placed in a state where the user can easily know the fact, the items of personal
                      information to be used jointly, the scope of joint users, the purpose of use, and the name or
                      title of the person responsible for managing the personal information
                    </li>
                  </ul>
                </li>
              </ol>
            </section>

            <section className="mt-8">
              <h2 className="text-foreground border-primary/30 mb-4 border-b pb-2 text-2xl font-bold">
                Article 5 (Changes to Privacy Policy)
              </h2>
              <ol className="text-foreground list-decimal space-y-2 pl-6">
                <li>
                  The contents of this Policy may be changed without notice to users, except for matters otherwise
                  provided by laws and regulations or this Policy.
                </li>
                <li>
                  Unless otherwise specified by the Service, the revised Privacy Policy shall take effect when posted on
                  this website.
                </li>
              </ol>
            </section>

            <section className="mt-8">
              <div className="border-border/50 border-t pt-6">
                <p className="text-muted-foreground">Established on October 2025</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
