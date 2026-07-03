import type { Metadata } from 'next';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: 'Privacy Policy — SoEnglish',
};

export default function PrivacyPage() {
  const updated = '27 June 2026';

  return (
    <main className={styles.page}>
      <article className={styles.article}>
        <h1>Privacy Policy</h1>
        <p className={styles.meta}>Last updated: {updated}</p>

        <section>
          <h2>1. Who we are</h2>
          <p>
            SoEnglish ("we", "us") operates the SoEnglish platform — a school management system for
            English-language schools. Your school admin manages your account within the platform.
          </p>
        </section>

        <section>
          <h2>2. What data we collect</h2>
          <ul>
            <li>
              <strong>Account data</strong> — name, email address, password hash, role within your
              school.
            </li>
            <li>
              <strong>Usage data</strong> — lessons, vocabulary cards, quiz attempts, speaking
              submissions, chat messages, and related timestamps.
            </li>
            <li>
              <strong>Technical data</strong> — IP address, browser type, and server request logs
              (retained up to 90 days).
            </li>
            <li>
              <strong>Analytics</strong> — if you consent below, we use PostHog (EU servers) to
              collect anonymised product-usage events (page views, feature interactions). No
              personally identifiable data is sent to PostHog unless you are logged in and have
              consented.
            </li>
          </ul>
        </section>

        <section>
          <h2>3. How we use your data</h2>
          <ul>
            <li>To provide and improve the platform.</li>
            <li>To send lesson reminders and school notifications (opt-out in profile settings).</li>
            <li>To calculate progress and generate vocabulary/quiz content.</li>
            <li>To comply with legal obligations (tax, financial records — retained 7 years).</li>
          </ul>
        </section>

        <section>
          <h2>4. Cookies and analytics</h2>
          <p>
            We use a strictly necessary session cookie (<code>access_token</code>) to keep you
            logged in — this cookie does not require consent. We also offer optional analytics
            cookies (PostHog) to understand how the product is used. You can accept or decline these
            via the banner shown on your first visit. You can change your choice at any time by
            clearing your browser&apos;s local storage for this site.
          </p>
        </section>

        <section>
          <h2>5. Data sharing</h2>
          <p>
            We do not sell your data. We share data only with sub-processors necessary to operate
            the service:
          </p>
          <ul>
            <li>
              <strong>Stripe</strong> — payment processing (school billing only; student data is not
              shared with Stripe).
            </li>
            <li>
              <strong>PostHog</strong> — analytics (EU region; only if you consent).
            </li>
            <li>
              <strong>Cloud hosting provider</strong> — infrastructure (data stored in the EU).
            </li>
          </ul>
        </section>

        <section>
          <h2>6. Your rights (GDPR)</h2>
          <p>
            If you are located in the EEA or Ukraine, you have the right to access, correct, or
            erase your personal data. To request a data export or account deletion, go to{' '}
            <strong>Profile → Account → Export my data</strong> or{' '}
            <strong>Profile → Account → Delete my account</strong>. We will respond within 30 days.
          </p>
        </section>

        <section>
          <h2>7. Data retention</h2>
          <p>
            Account data is retained while your account is active. Upon deletion, personal
            identifiers (email, name, avatar) are anonymised immediately; financial and audit records
            are retained for 7 years as required by law.
          </p>
        </section>

        <section>
          <h2>8. Contact</h2>
          <p>
            Questions? Email <a href="mailto:privacy@soenglish.app">privacy@soenglish.app</a>.
          </p>
        </section>
      </article>
    </main>
  );
}
