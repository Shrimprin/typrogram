import type { Metadata } from 'next';

import PageLayout from '@/components/common/PageLayout';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'This page describes the terms of service for Typrogram.',
};

export default function TermsOfService() {
  return (
    <PageLayout title="Terms of Service" backHref="/">
      <div className="min-h-screen bg-background py-4">
        <div
          className={`
            container mx-auto max-w-4xl px-0
            sm:px-8
          `}
        >
          <div className="max-w-none rounded-sm border border-border/50 bg-card/50 p-8">
            <p className="text-foreground">
              Thank you very much for using Typrogram (hereinafter, &quot;the Service&quot;). Users are kindly requested
              to follow the Terms of Use when using the Service.
            </p>

            <section className="mt-8">
              <h2 className="mb-4 border-b border-primary/30 pb-2 text-2xl font-bold text-foreground">
                Article 1 (Application)
              </h2>
              <ol className="list-decimal space-y-2 pl-6 text-foreground">
                <li>These Terms of Use apply to all relationships between users and the Service.</li>
                <li>
                  In addition to these Terms of Use, we may establish various rules and regulations (hereinafter,
                  &quot;Individual Provisions&quot;) regarding the use of the Service. These Individual Provisions,
                  regardless of their name, shall constitute a part of these Terms of Use.
                </li>
                <li>
                  In the event of any conflict between the provisions of these Terms of Use and the Individual
                  Provisions, the Individual Provisions shall prevail unless otherwise specified.
                </li>
              </ol>
            </section>

            <section className="mt-8">
              <h2 className="mb-4 border-b border-primary/30 pb-2 text-2xl font-bold text-foreground">
                Article 2 (User Registration)
              </h2>
              <ol className="list-decimal space-y-2 pl-6 text-foreground">
                <li>
                  User registration will be completed when we approve an application for registration by an applicant.
                </li>
                <li>
                  We may not approve an application for registration if we judge it inappropriate, and we will not
                  disclose reasons for rejection.
                  <ul className="mt-2 list-disc space-y-1 pl-6">
                    <li>If false information is provided in the registration application</li>
                    <li>If the application is from a person who has violated these Terms of Use in the past</li>
                    <li>In other cases where we judge the registration to be inappropriate</li>
                  </ul>
                </li>
              </ol>
            </section>

            <section className="mt-8">
              <h2 className="mb-4 border-b border-primary/30 pb-2 text-2xl font-bold text-foreground">
                Article 3 (Management of User ID and Password)
              </h2>
              <p className="text-foreground">
                Regarding the handling of GitHub accounts and passwords, the Service follows the Terms of Use of GitHub,
                Inc.
              </p>
            </section>

            <section className="mt-8">
              <h2 className="mb-4 border-b border-primary/30 pb-2 text-2xl font-bold text-foreground">
                Article 4 (Usage Fees and Payment Methods)
              </h2>
              <p className="text-foreground">
                Users can use the Service free of charge. Therefore, there are no provisions regarding payment of fees.
              </p>
            </section>

            <section className="mt-8">
              <h2 className="mb-4 border-b border-primary/30 pb-2 text-2xl font-bold text-foreground">
                Article 5 (Prohibited Acts)
              </h2>
              <p className="mb-2 text-foreground">
                Users must not engage in the following acts when using the Service:
              </p>
              <ol className="list-decimal space-y-2 pl-6 text-foreground">
                <li>Acts that violate laws or public order and morals</li>
                <li>Acts related to criminal activities</li>
                <li>
                  Acts that infringe intellectual property rights such as copyrights, trademarks, and other rights
                  included in the Service
                </li>
                <li>
                  Acts that destroy or disturb the functions of the Service&apos;s servers or networks, or those of
                  other users or third parties
                </li>
                <li>Acts that commercially exploit information obtained through the Service</li>
                <li>Acts that may interfere with the operation of the Service</li>
                <li>Acts of unauthorized access or attempts thereof</li>
                <li>Acts of collecting or accumulating personal information of other users</li>
                <li>Acts of using the Service for fraudulent purposes</li>
                <li>Acts that cause disadvantage, damage, or discomfort to other users or third parties</li>
                <li>Acts of impersonating other users</li>
                <li>
                  Acts of advertising, promotion, solicitation, or business activities on the Service without
                  authorization
                </li>
                <li>Acts of providing benefits directly or indirectly to antisocial forces</li>
                <li>Other acts judged to be inappropriate</li>
              </ol>
            </section>

            <section className="mt-8">
              <h2 className="mb-4 border-b border-primary/30 pb-2 text-2xl font-bold text-foreground">
                Article 6 (Suspension of Service Provision)
              </h2>
              <ol className="list-decimal space-y-2 pl-6 text-foreground">
                <li>
                  We may discontinue or halt the provision of the Service without prior notice to users if we judge it
                  is difficult to provide the Service in any of the following cases:
                  <ul className="mt-2 list-disc space-y-1 pl-6">
                    <li>
                      When carrying out maintenance, inspection, or updating of the computer system relating to the
                      Service
                    </li>
                    <li>
                      When it becomes difficult to provide the Service due to force majeure such as earthquakes,
                      lightning, fire, power outages, or natural disasters
                    </li>
                    <li>When computers or communication lines stop due to accidents</li>
                    <li>In other cases where we judge it difficult to provide the Service</li>
                  </ul>
                </li>
                <li>
                  We accept no liability for disadvantage or damage a user or a third party incurs arising from the
                  discontinued or halted provision of the Service.
                </li>
              </ol>
            </section>

            <section className="mt-8">
              <h2 className="mb-4 border-b border-primary/30 pb-2 text-2xl font-bold text-foreground">
                Article 7 (Restriction of Use and Deregistration)
              </h2>
              <ol className="list-decimal space-y-2 pl-6 text-foreground">
                <li>
                  If a user falls under any of the following cases, we may restrict the user&apos;s use of the Service
                  or terminate the user&apos;s registration without prior notice:
                  <ul className="mt-2 list-disc space-y-1 pl-6">
                    <li>If the user violates any provision of these Terms of Use</li>
                    <li>If it is found that the registration information contains false facts</li>
                    <li>If the user does not respond to our contact for a certain period</li>
                    <li>If there is no use of the Service for a certain period since the last use</li>
                    <li>In other cases where we judge the use of the Service to be inappropriate</li>
                  </ul>
                </li>
                <li>
                  We shall bear no liability for any damages incurred by users arising from actions taken under this
                  article.
                </li>
              </ol>
            </section>

            <section className="mt-8">
              <h2 className="mb-4 border-b border-primary/30 pb-2 text-2xl font-bold text-foreground">
                Article 8 (Withdrawal)
              </h2>
              <p className="text-foreground">
                Users may withdraw from the Service by following the withdrawal procedures specified by the Service.
              </p>
            </section>

            <section className="mt-8">
              <h2 className="mb-4 border-b border-primary/30 pb-2 text-2xl font-bold text-foreground">
                Article 9 (Disclaimer of Warranties and Limitation of Liability)
              </h2>
              <ol className="list-decimal space-y-2 pl-6 text-foreground">
                <li>
                  We do not guarantee that there are no factual or legal defects in the Service (including deficiencies
                  relating to safety, reliability, accuracy, integrity, efficacy, compatibility with specific purposes,
                  security; errors; bugs; infringement of rights).
                </li>
                <li>
                  We bear no liability for any damages users incur through the Service except in cases of intentional or
                  gross negligence. However, if the contract between the Service and users (including these Terms of
                  Use) constitutes a consumer contract as defined by the Consumer Contract Act, this disclaimer shall
                  not apply.
                </li>
                <li>
                  We bear no liability for transactions, communications, disputes, etc. that arise between users and
                  other users or third parties in relation to the Service.
                </li>
              </ol>
            </section>

            <section className="mt-8">
              <h2 className="mb-4 border-b border-primary/30 pb-2 text-2xl font-bold text-foreground">
                Article 10 (Changes in Service Content)
              </h2>
              <p className="text-foreground">
                We may change, add, or discontinue the content of the Service with prior notice to users, and users
                shall consent to this.
              </p>
            </section>

            <section className="mt-8">
              <h2 className="mb-4 border-b border-primary/30 pb-2 text-2xl font-bold text-foreground">
                Article 11 (Changes to Terms of Use)
              </h2>
              <ol className="list-decimal space-y-2 pl-6 text-foreground">
                <li>
                  We reserve the right to modify these Terms of Use without requiring individual user consent in the
                  following cases:
                  <ul className="mt-2 list-disc space-y-1 pl-6">
                    <li>If the modification of the Terms of Use conforms to the general interest of the users</li>
                    <li>
                      If the modification of the Terms of Use is not contrary to the purpose of this agreement, and it
                      is reasonable in light of the necessity of the modification, reasonableness of the modified
                      content, and other circumstances pertaining to the modification
                    </li>
                  </ul>
                </li>
                <li>
                  When modifying the Terms of Use, we will notify users in advance of the modification, the contents of
                  the modified Terms of Use, and the effective date of the modification.
                </li>
              </ol>
            </section>

            <section className="mt-8">
              <h2 className="mb-4 border-b border-primary/30 pb-2 text-2xl font-bold text-foreground">
                Article 12 (Handling of Personal Information)
              </h2>
              <p className="text-foreground">
                Personal information acquired through the use of the Service shall be handled appropriately in
                accordance with the &quot;Privacy Policy&quot;.
              </p>
            </section>

            <section className="mt-8">
              <h2 className="mb-4 border-b border-primary/30 pb-2 text-2xl font-bold text-foreground">
                Article 13 (Notice or Contact)
              </h2>
              <p className="text-foreground">
                We give notice to and make contact with users by methods specified by us.
              </p>
            </section>

            <section className="mt-8">
              <h2 className="mb-4 border-b border-primary/30 pb-2 text-2xl font-bold text-foreground">
                Article 14 (Prohibition of Assignment of Rights and Obligations)
              </h2>
              <p className="text-foreground">
                Users must not assign or provide as collateral their position under the usage contract or their rights
                or obligations under these Terms of Use to a third party without prior written consent.
              </p>
            </section>

            <section className="mt-8">
              <h2 className="mb-4 border-b border-primary/30 pb-2 text-2xl font-bold text-foreground">
                Article 15 (Governing Law and Jurisdiction)
              </h2>
              <ol className="list-decimal space-y-2 pl-6 text-foreground">
                <li>The interpretation of these Terms of Use is governed by the laws of Japan.</li>
                <li>
                  In the event of any disputes arising from the Service, the court having jurisdiction over the location
                  of the Service&apos;s head office shall have agreed exclusive jurisdiction.
                </li>
              </ol>
            </section>

            <section className="mt-8">
              <div className="border-t border-border/50 pt-6">
                <p className="text-muted-foreground">Established on October 2025</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
