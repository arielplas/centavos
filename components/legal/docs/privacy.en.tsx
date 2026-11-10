import type { LegalDoc } from "../types";

// Translation of privacy.es.tsx, which is the source of truth. Keep the
// sections in the same order and with the same numbering: the #seccion-N
// anchors are shared between both languages.

export const privacyEn: LegalDoc = {
  title: "Privacy Notice",
  description:
    "Privacy Notice for the Centavos app under Mexico's LFPDPPP: what data we collect, what we use it for, how we protect it and how to exercise your ARCO rights.",
  updated: "June 11, 2026",
  intro: (
    <p>
      At <b className="text-ink">Centavos</b>{" "}
      your trust is worth more than any piece of data.
      This notice explains, under Mexico&rsquo;s Federal Law on the Protection of Personal Data
      Held by Private Parties (LFPDPPP) and its Regulations, what information we collect when you
      use our app, what we use it for, who we share it with (spoiler: almost nobody) and how you
      can exercise your rights.
    </p>
  ),
  sections: [
    {
      title: "Data controller",
      body: (
        <p>
          The party responsible for processing your personal data is <b>Centavos</b>, whose
          website is <a href="https://centavos.mx">https://centavos.mx</a>. For anything to do
          with privacy you can write to us at{" "}
          <a href="mailto:hola@centavos.mx">hola@centavos.mx</a>.
        </p>
      ),
    },
    {
      title: "Personal data we collect",
      body: (
        <>
          <p>We collect only what the app needs in order to work:</p>
          <ul>
            <li>
              <b>Identification data:</b> your name and your email address, plus an internal user
              identifier (UUID), your preferred currency (MXN by default) and the date your account
              was created.
            </li>
            <li>
              <b>Authentication data:</b> your password (stored only in hashed form with bcrypt —
              never in plain text) and session tokens (short-lived access tokens and rotating
              refresh tokens).
            </li>
            <li>
              <b>Content you enter:</b> expenses (amount, category, note, date), budgets (category,
              monthly amount, name), savings jars (savings goals) and subscriptions (name, amount,
              frequency, next charge). You enter all of it by hand; Centavos does not obtain it
              from any other source.
            </li>
            <li>
              <b>Technical data:</b> server logs, your IP address where applicable and basic device
              information, for security and for operating the service.
            </li>
          </ul>
          <p>
            <b>We do not collect sensitive personal data</b> as defined in article 3, section VI of
            the LFPDPPP (such as ethnic origin, health status, religious beliefs or political
            opinions). We also do not use third-party analytics or advertising SDKs in the app.
          </p>
        </>
      ),
    },
    {
      title: "Purposes of the processing",
      body: (
        <>
          <p><b>Primary purposes</b> (necessary in order to provide the service):</p>
          <ul>
            <li>Creating and administering your account.</li>
            <li>Letting you record and review your personal financial information in the app.</li>
            <li>Verifying your email address.</li>
            <li>Keeping you securely signed in.</li>
            <li>Giving you support when you write to us.</li>
            <li>Complying with applicable legal obligations.</li>
          </ul>
          <p>
            <b>Secondary purposes</b> (not necessary for the service — you can refuse them without
            any effect on your account):
          </p>
          <ul>
            <li>Improving the product on the basis of aggregated, anonymised data.</li>
            <li>Sending you news about the product (always with an option to unsubscribe).</li>
          </ul>
        </>
      ),
    },
    {
      title: "How to refuse the secondary purposes",
      body: (
        <p>
          If you do not want us to process your data for the secondary purposes, just send an email
          saying so to <a href="mailto:hola@centavos.mx">hola@centavos.mx</a>. Your refusal has no
          effect at all on normal use of the app.
        </p>
      ),
    },
    {
      title: "Data transfers",
      body: (
        <>
          <p>To run the service we use providers that process data on our behalf:</p>
          <ul>
            <li>
              <b>Transactional email provider:</b> to send you verification emails and account
              notices.
            </li>
          </ul>
          <p>
            These providers act as processors and handle the data only on our instructions.{" "}
            <b>We do not sell or transfer your personal data to third parties for commercial
            purposes.</b> Beyond the above, we would only share data if a competent authority
            required it of us under the law.
          </p>
        </>
      ),
    },
    {
      title: "ARCO rights",
      body: (
        <>
          <p>The law gives you rights over your data, known in Mexico as ARCO rights:</p>
          <ul>
            <li><b>Access:</b> knowing what data of yours we hold and how we use it.</li>
            <li><b>Rectification:</b> correcting inaccurate or out-of-date data.</li>
            <li><b>Cancellation:</b> asking us to delete your data once it is no longer needed.</li>
            <li><b>Objection:</b> objecting to your data being processed for specific purposes.</li>
          </ul>
          <p>
            To exercise them, send your request to{" "}
            <a href="mailto:hola@centavos.mx">hola@centavos.mx</a> with your name, the right you
            want to exercise and a copy of an official ID proving your identity (or that of your
            legal representative). We will reply within the maximum of <b>20 business days</b> the
            law sets, and where the request is granted, we will give effect to it within the
            following 15 days.
          </p>
          <p>
            You can also <b>withdraw your consent</b> at any time by the same means. And if you
            believe we did not handle your request properly, you have the right to file a complaint
            with <b>INAI</b>, Mexico&rsquo;s National Institute for Transparency, Access to
            Information and Personal Data Protection:{" "}
            <a href="https://www.inai.org.mx" target="_blank" rel="noopener noreferrer">
              https://www.inai.org.mx
            </a>.
          </p>
        </>
      ),
    },
    {
      title: "Cookies and similar technologies",
      body: (
        <>
          <p>
            <b>We do not use cookies in the mobile app.</b>{" "}
            To keep you signed in we use your
            device&rsquo;s secure storage (Keychain on iOS and EncryptedSharedPreferences on
            Android), where your session tokens are kept.
          </p>
          <p>
            On our website (centavos.mx) we use <b>strictly necessary cookies</b> only, for it to
            work.
          </p>
        </>
      ),
    },
    {
      title: "Security",
      body: (
        <>
          <p>We protect your data with reasonable administrative, technical and physical measures:</p>
          <ul>
            <li>TLS encryption for all information in transit.</li>
            <li>Passwords stored only in hashed form (bcrypt).</li>
            <li>Tokens kept in your device&rsquo;s encrypted storage.</li>
            <li>Strict access controls on our backend.</li>
          </ul>
          <p>
            We work to a reasonable best-effort standard; like any digital service, we cannot
            guarantee absolute security, but we can promise we take it very seriously.
          </p>
        </>
      ),
    },
    {
      title: "Data retention",
      body: (
        <p>
          We keep your data for as long as your account is active. If you delete your account (you
          can do it from Settings in the app), we delete your personal data within a reasonable
          period, except for anything we are legally required to keep.
        </p>
      ),
    },
    {
      title: "Minors",
      body: (
        <p>
          Centavos is intended for people over 13 years of age. If you are a parent or guardian and
          have any concern about a minor in your care using the app, write to us at{" "}
          <a href="mailto:hola@centavos.mx">hola@centavos.mx</a> and we will deal with your
          request.
        </p>
      ),
    },
    {
      title: "Changes to this notice",
      body: (
        <p>
          If this notice changes materially, we will notify you inside the app and/or by email. The
          version in force is always available at{" "}
          <a href="https://centavos.mx/app/privacidad">centavos.mx/app/privacidad</a>.
        </p>
      ),
    },
    {
      title: "Acceptance",
      body: (
        <p>
          By creating your account or continuing to use the app, you confirm that you are aware of
          this Privacy Notice and consent to your data being processed as described here.
        </p>
      ),
    },
    {
      title: "Last updated",
      body: <p>This notice was last updated on <b>June 11, 2026</b>.</p>,
    },
  ],
};
