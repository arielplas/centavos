import type { LegalDoc } from "../types";

// Translation of claude.es.tsx, which is the source of truth. Keep the sections
// in the same order: the #seccion-N anchors are shared between both languages.

export const claudeEn: LegalDoc = {
  title: "Centavos in Claude",
  description:
    "Connect your Centavos account to Claude to log expenses and review your budgets and subscriptions from a conversation. How to connect, what it can do, limits and help.",
  updated: "November 19, 2026",
  intro: (
    <p>
      With the <b className="text-ink">Centavos</b> connector for Claude, Anthropic&rsquo;s
      assistant, you can log an expense, ask how much you have spent this month or adjust your
      budgets and subscriptions by writing to Claude, on the web, in the desktop app or on your
      phone. Your data stays in Centavos: Claude only reads or changes it when you ask.
    </p>
  ),
  sections: [
    {
      title: "What you can do",
      body: (
        <>
          <ul>
            <li><b>See:</b> your expenses (by date, category or note), a summary of what you have
              spent, your budgets and your subscriptions.</li>
            <li><b>Log:</b> new expenses, in a budget or without one.</li>
            <li><b>Organize:</b> move an expense to another budget; create, edit or delete budgets
              and subscriptions; delete expenses.</li>
          </ul>
          <p>
            Claude asks your permission before it changes or deletes anything (you can tell it to
            always allow it). The connector moves no
            money, does not connect to your bank and gives no financial advice: it works with what
            you record in Centavos.
          </p>
        </>
      ),
    },
    {
      title: "Before you start",
      body: (
        <ul>
          <li>A Centavos account and the app on your phone, version 1.12 or later.</li>
          <li>
            A Claude account (<a href="https://claude.ai">claude.ai</a>). Custom connectors are
            available on every plan; the free plan allows one.
          </li>
        </ul>
      ),
    },
    {
      title: "How to connect",
      body: (
        <ol>
          <li>
            In the Centavos app go to <b>Settings → Connect to Claude</b> and tap{" "}
            <b>Open claude.ai</b>. To do it by hand, in Claude go to <b>Customize → Connectors → Add
            custom connector</b> and use the URL <code>https://api.centavos.mx/mcp</code>.
          </li>
          <li>
            Claude warns you that the connector comes from an external link: check that the name is
            &ldquo;Centavos&rdquo; and the URL is <code>https://api.centavos.mx/mcp</code>, then
            continue.
          </li>
          <li>
            When you connect, Claude opens a Centavos page that asks for a code. In the app tap{" "}
            <b>Generate code</b> and then <b>Copy code</b>. The code works once and expires in 10
            minutes.
          </li>
          <li>
            Paste the code, check that the account shown is yours and tap <b>Connect</b>. You go
            back to Claude with Centavos ready.
          </li>
        </ol>
      ),
    },
    {
      title: "Things you can ask",
      body: (
        <ul>
          <li>&ldquo;Log 185 pesos for tacos al pastor under food.&rdquo;</li>
          <li>&ldquo;How much have I spent this week, and how are my budgets doing?&rdquo;</li>
          <li>&ldquo;What did I spend the most on this month? Group it by category.&rdquo;</li>
          <li>&ldquo;Show me my subscriptions and what I pay in total each month.&rdquo;</li>
          <li>&ldquo;Create a 3,000 a month budget for groceries.&rdquo;</li>
          <li>&ldquo;Move yesterday&rsquo;s Uber expense to my transport budget.&rdquo;</li>
        </ul>
      ),
    },
    {
      title: "Limits",
      body: (
        <>
          <ul>
            <li>
              <b>Free plan:</b> Claude can log up to 30 expenses every 30 days and read the last 30
              days of expenses and the current month&rsquo;s budgets. Nothing new is limited in the
              app. Centavos+ raises these limits.
            </li>
            <li>
              <b>Shared budgets:</b> expenses in a shared budget are logged from the app, because
              they are split among its members. Claude can still see them.
            </li>
            <li>
              <b>Currency:</b> Claude logs in your account&rsquo;s or your budget&rsquo;s currency;
              it does not convert amounts.
            </li>
          </ul>
        </>
      ),
    },
    {
      title: "Privacy and security",
      body: (
        <ul>
          <li>
            You don&rsquo;t need your password to connect: the code comes from your app, where you
            are already signed in, and nobody else can generate it.
          </li>
          <li>
            Claude only sees your account when you ask it something that needs it, and Centavos does
            not receive your conversations with Claude.
          </li>
          <li>
            When you connect, we notify your phone. If it wasn&rsquo;t you, disconnect it from the
            app.
          </li>
          <li>
            What is shared with Anthropic is described in the{" "}
            <a href="/app/privacidad?lang=en">Privacy Notice</a>, under &ldquo;Data transfers&rdquo;.
          </li>
        </ul>
      ),
    },
    {
      title: "Disconnecting",
      body: (
        <p>
          In the app, <b>Settings → Connect to Claude → Disconnect</b>. You can also remove the
          connector in Claude, under <b>Customize → Connectors</b>. Claude loses access immediately;
          your expenses and budgets stay in Centavos.
        </p>
      ),
    },
    {
      title: "Troubleshooting",
      body: (
        <ul>
          <li>
            <b>&ldquo;That code isn&rsquo;t valid or has expired&rdquo;:</b> each code works once
            and lasts 10 minutes. Generate a new one in the app and paste it again.
          </li>
          <li>
            <b>&ldquo;A connector with this URL already exists&rdquo;:</b> Centavos is already added
            in Claude. Open it under <b>Customize → Connectors</b> and tap <b>Connect</b> instead of
            adding it again.
          </li>
          <li>
            <b>I don&rsquo;t see &ldquo;Connect to Claude&rdquo; in Settings:</b> update the app to
            version 1.12 or later.
          </li>
          <li>
            <b>Claude says it has no access to Centavos:</b> the connection was disconnected or
            expired. Connect again from Claude with a new code.
          </li>
          <li>
            <b>Claude says you reached the limit:</b> on the free plan it is 30 expenses every 30
            days from Claude. You can keep logging in the app.
          </li>
        </ul>
      ),
    },
    {
      title: "Support",
      body: (
        <p>
          Write to <a href="mailto:hola@centavos.mx">hola@centavos.mx</a> or use{" "}
          <a href="/app/soporte">centavos.mx/app/soporte</a>. We usually reply within one or two
          business days. For a security issue, put &ldquo;Security&rdquo; in the subject.
        </p>
      ),
    },
  ],
};
