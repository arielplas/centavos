import type { LegalDoc } from "../types";

// Translation of terms.es.tsx, which is the source of truth. Keep the sections
// in the same order and with the same numbering: cross-references inside the
// text ("see section 12") and the #seccion-N anchors are shared between both
// languages.

export const termsEn: LegalDoc = {
  title: "Terms and Conditions",
  description:
    "Terms and Conditions for the Centavos app: your digital notebook for expenses, budgets, savings jars and subscriptions. No banks, no real money, no fine print hidden away.",
  updated: "June 11, 2026",
  intro: (
    <p>
      These terms govern your use of the <b className="text-ink">Centavos</b> app (available for
      iOS and Android) and of the related services we offer from{" "}
      <a href="https://centavos.mx" className="text-mandarina-deep underline underline-offset-2">centavos.mx</a>.
      We wrote them as plainly as we could — no fine print hidden away. If anything is unclear,
      write to us at hola@centavos.mx and we will gladly explain it.
    </p>
  ),
  sections: [
    {
      title: "Acceptance of these terms",
      body: (
        <p>
          By creating an account or using Centavos you accept these Terms and Conditions and our{" "}
          <a href="/app/privacidad?lang=en">Privacy Notice</a>. If you disagree with any part of
          them, the right thing to do is not to use the app. It really is that simple.
        </p>
      ),
    },
    {
      title: "What the service is",
      body: (
        <>
          <p>
            Centavos is a <b>personal digital notebook</b> for keeping track of your expenses,
            budgets, savings jars and subscriptions. You enter everything by hand; we store it,
            organise it and show it back to you nicely.
          </p>
          <p>So there is no confusion, here is what Centavos is <b>not</b>:</p>
          <ul>
            <li><b>It is not a regulated financial service.</b> We are not a bank, a fintech, a SOFIPO or a credit institution.</li>
            <li><b>It does not connect to your bank accounts</b> or to any financial institution.</li>
            <li><b>It does not process payments or move real money.</b> The amounts you record are just your own notes.</li>
            <li><b>It does not provide financial, tax or investment advice.</b></li>
          </ul>
          <p>It is a notebook with superpowers. Real money never passes through here.</p>
        </>
      ),
    },
    {
      title: "Eligibility and sign-up",
      body: (
        <>
          <p>To use Centavos you need to:</p>
          <ul>
            <li>Be at least <b>13 years old</b>.</li>
            <li>Sign up with accurate details (your name and an email address that is really yours).</li>
            <li>Keep <b>a single account</b> per person.</li>
          </ul>
          <p>
            If we detect duplicate accounts or false details, we may ask you to correct them or
            suspend the account (see section 12).
          </p>
        </>
      ),
    },
    {
      title: "Your account and security",
      body: (
        <>
          <p>
            Your password is yours and nobody else&rsquo;s. You are responsible for keeping it safe
            and for all activity that happens in your account.
          </p>
          <ul>
            <li>If you suspect someone else got into your account, tell us right away at hola@centavos.mx.</li>
            <li>You can sign out at any time from Settings; that invalidates the session on that device.</li>
            <li>We will never ask you for your password by email or by any other means.</li>
          </ul>
        </>
      ),
    },
    {
      title: "Centavos+ (paid subscription)",
      body: (
        <>
          <p>
            Centavos is free to use. <b>Centavos+</b> is an optional subscription that removes ads
            and unlocks extra features; what it includes is listed in the app itself, under
            Settings › Centavos+.
          </p>
          <ul>
            <li>
              <b>Plans and price.</b> It is offered as a <b>monthly</b> and an <b>annual</b> plan.
              The price of each one, in your local currency and including taxes where they apply, is
              shown to you on the purchase screen <b>before</b> you confirm. Prices may change; if
              that happens, the change applies from your next period onwards and we give you as much
              notice as the store requires.
            </li>
            <li>
              <b>The store charges you, not us.</b> The purchase is processed through your{" "}
              <b>Apple ID</b> (App Store) or <b>Google Play</b> account, depending on your device.
              We never see or store your card details.
            </li>
            <li>
              <b>It renews by itself.</b> The subscription is an <b>auto-renewing</b> one. You are
              charged when you confirm the purchase and it then renews for the same period, unless
              you cancel at least <b>24 hours before</b> the current period ends. The renewal is
              charged within the 24 hours before the period ends.
            </li>
            <li>
              <b>How to cancel.</b> From your account settings in the store: on iOS, system Settings
              › your name › Subscriptions; on Android, Google Play › Subscriptions. Cancelling stops
              future renewals and <b>you keep Centavos+ until the period you already paid for
              ends</b>. We cannot cancel the subscription for you.
            </li>
            <li>
              <b>Free trials.</b> If an offer includes a free trial, any unused part of it is
              forfeited when you buy the subscription, where the store sets it up that way.
            </li>
            <li>
              <b>Refunds.</b> These are handled by the store under its own policies (Apple or
              Google), not by Centavos.
            </li>
            <li>
              <b>If your subscription ends</b>, your account and everything you entered are still
              there: you go back to the free plan, with ads and without the Centavos+ features.
              Nothing is deleted because you stopped paying.
            </li>
          </ul>
          <p>
            By buying Centavos+ you accept these Terms and the{" "}
            <a href="/app/privacidad?lang=en">Privacy Notice</a>, as well as the terms of the store
            where you made the purchase.
          </p>
        </>
      ),
    },
    {
      title: "Acceptable use",
      body: (
        <>
          <p>We want Centavos to be a healthy place. So the following is not allowed:</p>
          <ul>
            <li><b>Scraping</b>, bulk data extraction or automated access (bots) to the app or to our API.</li>
            <li><b>Reverse engineering</b>, decompiling or attempting to extract the source code.</li>
            <li>Using the app or its content for <b>commercial purposes</b> without our written permission.</li>
            <li>Attempting to access <b>other people&rsquo;s accounts</b> or systems that are not yours.</li>
            <li>Using the app for any <b>unlawful activity</b>.</li>
          </ul>
          <p>Breaching this section can lead to your account being suspended or closed.</p>
        </>
      ),
    },
    {
      title: "Your content",
      body: (
        <>
          <p>
            Everything you enter in Centavos — expenses, budgets, savings jars, subscriptions,
            notes — <b>is yours</b>. Full stop.
          </p>
          <p>
            So the app can work, you grant us a <b>limited, non-exclusive, revocable licence</b> to
            store, process and display <b>your own content within your own experience</b> in the
            app. Nothing more. We do not publish your content, we do not share it with other users
            and we do not reuse it for commercial purposes.
          </p>
          <p>If you delete your account, the licence ends (see section 12 and the Privacy Notice).</p>
        </>
      ),
    },
    {
      title: "Centavos’ intellectual property",
      body: (
        <p>
          The Centavos name, the logo, the app&rsquo;s code, the design, the illustrations and the
          copy belong to Centavos and are protected by the applicable intellectual property laws.
          Using the app does not transfer any right over them to you.
        </p>
      ),
    },
    {
      title: "This is not financial advice",
      body: (
        <>
          <p>
            <b>Centavos does not provide financial, tax, legal or investment advice of any
            kind.</b> The information you see in the app comes from what you entered yourself, and
            any figure, chart or summary is for information and personal organisation only.
          </p>
          <p>
            The decisions you make with your money are yours and your own responsibility. If you
            need professional advice, go to a certified person or institution.
          </p>
        </>
      ),
    },
    {
      title: "Service availability",
      body: (
        <p>
          We do our best to keep Centavos available at all times, but we cannot guarantee
          uninterrupted or error-free operation. From time to time we will carry out maintenance,
          updates or improvements that may pause the service temporarily. Where possible, we will
          let you know inside the app.
        </p>
      ),
    },
    {
      title: "Changes to the service and to these terms",
      body: (
        <p>
          Centavos evolves: we may add, change or withdraw features. We may also update these
          terms. If a change is material, we will notify you inside the app. If you keep using
          Centavos after that notice, we take it that you accept the updated terms.
        </p>
      ),
    },
    {
      title: "Suspension and termination",
      body: (
        <>
          <p>
            <b>You can leave whenever you want.</b> You can delete your account at any time from
            Settings inside the app — no strange paperwork, no awkward questions.
          </p>
          <p>
            We may suspend or close your account if you breach these terms, if we detect fraud or
            misuse, or if the law requires us to. Where it is reasonable, we will warn you first so
            you can put things right.
          </p>
        </>
      ),
    },
    {
      title: "Limitation of liability",
      body: (
        <>
          <p>
            To the maximum extent permitted by Mexican law, Centavos will not be liable for
            indirect, incidental or consequential damages, loss of profit, loss of opportunity, or
            for data loss arising from unforeseeable circumstances or force majeure, third-party
            failures (such as hosting or connectivity providers) or causes beyond our reasonable
            control.
          </p>
          <p>
            Nothing in these terms limits rights the law gives you as a consumer and that cannot be
            waived.
          </p>
        </>
      ),
    },
    {
      title: "Indemnity",
      body: (
        <p>
          If you use Centavos improperly or in breach of these terms and that leads to third-party
          claims against Centavos, you agree to hold us harmless and to cover the reasonable
          damages and costs (including legal fees) arising from your breach.
        </p>
      ),
    },
    {
      title: "Governing law and jurisdiction",
      body: (
        <p>
          These terms are governed by the laws of the <b>United Mexican States</b>. For any
          dispute, the parties submit to the jurisdiction of the competent courts of{" "}
          <b>Mexico City</b>, waiving any other jurisdiction that might apply to them by reason of
          their present or future domicile.
        </p>
      ),
    },
    {
      title: "Severability",
      body: (
        <p>
          If any clause of these terms turns out to be invalid or unenforceable, the rest remains
          fully valid. The affected clause will be interpreted in the way that best reflects its
          original intent within what the law allows.
        </p>
      ),
    },
    {
      title: "Contact",
      body: (
        <p>
          Questions, comments or something that does not add up? Write to us at{" "}
          <a href="mailto:hola@centavos.mx">hola@centavos.mx</a>. We read everything.
        </p>
      ),
    },
  ],
};
