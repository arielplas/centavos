// Cliente de la API de Centavos para la app web (docs/app-web.md §7). Todo el
// contrato vive aquí: rutas, cuerpos, respuestas y errores. Las pantallas no
// llaman a `fetch`.
//
// Reglas (§7.1):
//   - Base `${NEXT_PUBLIC_API_URL}/api`; el navegador llama directo a la API.
//   - `credentials: "omit"`: la autenticación es un Bearer, nunca una cookie.
//   - Se lee el `code` de la respuesta también en los 429: RATE_LIMIT,
//     AUTH_CODE_LOCKED y AUTH_RESET_CODE_LOCKED son cosas distintas.
//   - Nunca se expone `error.message` (está en inglés y es para quien
//     programa): el texto sale del código (components/app/copy/errorText.ts).
//   - Las llamadas de auth (`login`, `signup`…) van sin Bearer y no refrescan.
//     Las demás llevan el access token y, ante un 401 de token vencido, piden
//     un refresh y se repiten UNA sola vez.
//
// Este módulo no guarda ningún token. De dónde sale el access token y cómo se
// refresca lo decide la sesión (lib/app/session.ts), que se registra con
// `setAuthHandlers`; así `api.ts` no importa la sesión y no hay ciclo.
//
// Los tipos salen de centavos-app/src/lib/api.ts (origin/main) y se comprobaron
// contra centavos.api/src/routes/* y lib/*-core.ts. Donde difieren, manda la API
// (ver las notas «API:»).

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");

/** `NEXT_PUBLIC_API_URL` está puesta. Si no, la app web muestra `app.unavailable`. */
export const API_CONFIGURED = API_URL !== "";

/**
 * Endpoint MCP que se agrega en Claude: el origen de la API + `/mcp`, sin un
 * `/api` ni barras al final de la variable. Vacío si la API no está configurada.
 */
export const MCP_URL = API_CONFIGURED ? `${API_URL.replace(/\/api$/, "")}/mcp` : "";

// ─── Errores ──────────────────────────────────────────────────────────────

/** Códigos que la API puede responder y la app web sabe explicar (docs/errors.md de la API). */
export const API_ERROR_CODES = [
  "BAD_JSON",
  "VALIDATION",
  "RATE_LIMIT",
  "ROUTE_NOT_FOUND",
  "NOT_IMPLEMENTED",
  "INTERNAL",
  "IDEMPOTENCY_IN_PROGRESS",
  "IDEMPOTENCY_KEY_REUSED",
  "AUTH_UNAUTHORIZED",
  "AUTH_INVALID_ACCESS_TOKEN",
  "AUTH_INVALID_CREDENTIALS",
  "AUTH_REFRESH_TOKEN_NOT_FOUND",
  "AUTH_REFRESH_TOKEN_REVOKED",
  "AUTH_REFRESH_TOKEN_EXPIRED",
  "AUTH_EMAIL_TAKEN",
  "AUTH_EMAIL_UNVERIFIED",
  "AUTH_EMAIL_ALREADY_VERIFIED",
  "AUTH_USER_NOT_FOUND",
  "AUTH_CODE_NOT_FOUND",
  "AUTH_CODE_EXPIRED",
  "AUTH_CODE_INVALID",
  "AUTH_CODE_TOO_MANY_ATTEMPTS",
  "AUTH_CODE_LOCKED",
  "GOOGLE_AUTH_DISABLED",
  "AUTH_GOOGLE_TOKEN_INVALID",
  "AUTH_GOOGLE_EMAIL_UNVERIFIED",
  "AUTH_GOOGLE_ACCOUNT_CONFLICT",
  "APPLE_AUTH_DISABLED",
  "AUTH_APPLE_TOKEN_INVALID",
  "AUTH_APPLE_EMAIL_MISSING",
  "AUTH_APPLE_EMAIL_UNVERIFIED",
  "AUTH_APPLE_ACCOUNT_CONFLICT",
  "AUTH_APPLE_CODE_INVALID",
  "AUTH_RESET_CODE_NOT_FOUND",
  "AUTH_RESET_CODE_EXPIRED",
  "AUTH_RESET_CODE_INVALID",
  "AUTH_RESET_CODE_TOO_MANY_ATTEMPTS",
  "AUTH_RESET_CODE_LOCKED",
  "AUTH_RESET_TOKEN_INVALID",
  "PROFILE_USER_NOT_FOUND",
  "BUDGET_NOT_FOUND",
  "PREMIUM_REQUIRED",
  "EXPENSE_NOT_FOUND",
  "SUBSCRIPTION_NOT_FOUND",
  "ONBOARDING_ALREADY_DONE",
  /** 503 de `/me/connections*` cuando el conector no está configurado en la API. */
  "MCP_DISABLED",
  /** 403 de `link-code`: la cuenta no está en `MCP_ALLOWED_USERS`. */
  "CONNECTOR_NOT_AVAILABLE",
  "CONNECTION_NOT_FOUND",
] as const;

/**
 * El `error.code` de la API, o uno de los dos que pone este cliente:
 * `NETWORK` (sin respuesta: red, CORS, API sin configurar) y `UNKNOWN` (cuerpo
 * que no es el contrato, 5xx sin código o un código que no está en la lista; en
 * ese caso el original queda en `ApiError.rawCode`).
 */
export type ApiErrorCode = (typeof API_ERROR_CODES)[number] | "NETWORK" | "UNKNOWN";

const KNOWN_CODES: ReadonlySet<string> = new Set(API_ERROR_CODES);

export class ApiError extends Error {
  /** HTTP. 0 = sin respuesta (red, CORS). */
  readonly status: number;
  readonly code: ApiErrorCode;
  /** Solo si `code === "UNKNOWN"` y la API sí mandó un código: el que mandó. */
  readonly rawCode?: string;
  /** `VALIDATION`: nombre del campo → regla (en inglés; se traduce, no se muestra). */
  readonly fields?: Record<string, unknown>;
  /** `AUTH_EMAIL_UNVERIFIED`: la cuenta que hay que verificar. */
  readonly userId?: string;
  /** `AUTH_EMAIL_UNVERIFIED`: el secreto del intento de registro. Puede faltar en cuentas viejas. */
  readonly signupToken?: string;

  constructor(
    status: number,
    code: ApiErrorCode,
    extra: { rawCode?: string; fields?: Record<string, unknown>; userId?: string; signupToken?: string } = {},
  ) {
    // El mensaje es el código: nada del texto de la API llega a la pantalla.
    super(code);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.rawCode = extra.rawCode;
    this.fields = extra.fields;
    this.userId = extra.userId;
    this.signupToken = extra.signupToken;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/** El refresh token ya no sirve: hay que volver a entrar (§5.6). */
export const REFRESH_FAILURE_CODES: readonly ApiErrorCode[] = [
  "AUTH_REFRESH_TOKEN_NOT_FOUND",
  "AUTH_REFRESH_TOKEN_REVOKED",
  "AUTH_REFRESH_TOKEN_EXPIRED",
];

/** El access token venció o no sirve: se refresca y se repite la llamada (§5.6). */
const ACCESS_EXPIRED_CODES: readonly ApiErrorCode[] = ["AUTH_INVALID_ACCESS_TOKEN", "AUTH_UNAUTHORIZED"];

export function isAccessTokenExpired(error: ApiError): boolean {
  return error.status === 401 && ACCESS_EXPIRED_CODES.includes(error.code);
}

// ─── Gancho de sesión ──────────────────────────────────────────────────────

export type AuthHandlers = {
  /** El access token en memoria, o null si no hay sesión. */
  getAccessToken: () => string | null;
  /**
   * Pide un access token nuevo. La sesión lo comparte entre llamadas
   * simultáneas (una sola promesa). Lanza `ApiError` si ya no hay sesión.
   */
  refresh: () => Promise<string>;
  /** El refresh falló de verdad: la sesión terminó. Se llama una vez por llamada que la vio caer. */
  onAuthFailure: (error: ApiError) => void;
};

let handlers: AuthHandlers | null = null;

/** La sesión se registra aquí al montarse y se da de baja (`null`) al desmontarse. */
export function setAuthHandlers(next: AuthHandlers | null): void {
  handlers = next;
}

// ─── Transporte ────────────────────────────────────────────────────────────

type Query = Record<string, string | number | boolean | undefined>;

type RequestOptions = {
  method?: "GET" | "POST" | "DELETE";
  query?: Query;
  body?: unknown;
  /** Lleva `Authorization: Bearer` y refresca ante un 401. Por defecto no. */
  auth?: boolean;
  headers?: Record<string, string>;
  /** Para el cierre de sesión, que no debe perderse si la pestaña se cierra. */
  keepalive?: boolean;
  signal?: AbortSignal;
};

function buildUrl(path: string, query?: Query): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) params.set(key, String(value));
  }
  const qs = params.toString();
  return `${API_URL}/api${path}${qs ? `?${qs}` : ""}`;
}

function toApiError(status: number, body: unknown): ApiError {
  const error = (body as { error?: Record<string, unknown> } | null)?.error;
  const raw = typeof error?.code === "string" ? error.code : "";
  const fields =
    error?.fields && typeof error.fields === "object" ? (error.fields as Record<string, unknown>) : undefined;
  const userId = typeof error?.userId === "string" ? error.userId : undefined;
  const signupToken = typeof error?.signupToken === "string" ? error.signupToken : undefined;

  if (raw && KNOWN_CODES.has(raw)) {
    return new ApiError(status, raw as ApiErrorCode, { fields, userId, signupToken });
  }
  return new ApiError(status, "UNKNOWN", { rawCode: raw || undefined, fields, userId, signupToken });
}

async function once<T>(path: string, options: RequestOptions, token: string | null): Promise<T> {
  if (!API_CONFIGURED) throw new ApiError(0, "NETWORK");

  const hasBody = options.body !== undefined;
  let response: Response;
  try {
    response = await fetch(buildUrl(path, options.query), {
      method: options.method ?? "GET",
      headers: {
        accept: "application/json",
        ...(hasBody ? { "content-type": "application/json" } : {}),
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      body: hasBody ? JSON.stringify(options.body) : undefined,
      // Nunca se mandan ni se guardan cookies: la autenticación es un Bearer.
      credentials: "omit",
      keepalive: options.keepalive,
      signal: options.signal,
    });
  } catch {
    throw new ApiError(0, "NETWORK");
  }

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) throw toApiError(response.status, body);
  if (body === null || typeof body !== "object") throw new ApiError(response.status, "UNKNOWN");
  return body as T;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!options.auth) return once<T>(path, options, null);

  const token = handlers?.getAccessToken() ?? null;
  try {
    if (token === null) throw new ApiError(401, "AUTH_UNAUTHORIZED");
    return await once<T>(path, options, token);
  } catch (error) {
    if (!(error instanceof ApiError) || !isAccessTokenExpired(error) || !handlers) throw error;
    // Refresh y una sola repetición, como el interceptor de la app (§5.6).
    let fresh: string;
    try {
      fresh = await handlers.refresh();
    } catch (refreshError) {
      const failure = refreshError instanceof ApiError ? refreshError : new ApiError(0, "NETWORK");
      // Sin red no se pierde la sesión: solo falla esta llamada.
      if (failure.code !== "NETWORK") handlers.onAuthFailure(failure);
      throw failure;
    }
    return once<T>(path, options, fresh);
  }
}

// ─── Utilidades ────────────────────────────────────────────────────────────

/** La zona horaria IANA del navegador. Todas las llamadas con fechas la llevan (§7.2). */
export function timezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

/** Una clave para `Idempotency-Key`; una por intento y se reusa en los reintentos. */
export function newIdempotencyKey(): string {
  return crypto.randomUUID();
}

// ─── Tipos: usuario y sesión ───────────────────────────────────────────────

export type Plan = "free" | "premium";
export type PlanStatus = "active" | "grace" | "canceled" | "expired" | "none";
export type PlanInterval = "monthly" | "annual";

/**
 * El `user` mínimo de las respuestas de `/auth/*` (§5.8). API: `onboarded` falta
 * en `reset-password` (se toma como «ya configurado» hasta `GET /me`), `createdAt`
 * solo viene en `verify` y `emailHidden` solo en `apple`.
 */
export type AuthUser = {
  id: string;
  name: string;
  email: string;
  currency: string;
  onboarded?: boolean;
  createdAt?: string;
  emailHidden?: boolean;
};

/** `GET /me` completo (`routes/profile.ts → mapUser`). */
export type Me = {
  id: string;
  name: string;
  email: string;
  currency: string;
  imageUrl?: string;
  createdAt: string;
  onboarded: boolean;
  /** `"es"` o `"en"`. */
  language: string;
  emailHidden: boolean;
  plan: Plan;
  planStatus: PlanStatus;
  planInterval?: PlanInterval;
  planExpiresAt?: string;
  /** `"trial"`, `"normal"`, `"promotional"`… */
  planPeriodType?: string;
  promoExpiresAt?: string;
  trialConsumedAt?: string;
  trialEligible: boolean;
};

/** Lo que la sesión sabe de la persona: lo de `/auth/*`, completado con `/me` cuando llega. */
export type SessionUser = AuthUser & Partial<Omit<Me, keyof AuthUser>>;

export type Tokens = { accessToken: string; refreshToken: string };
export type LoginResponse = Tokens & { user: AuthUser };
export type SocialLoginResponse = LoginResponse & { isNewUser: boolean };

// ─── Auth (sin Bearer, sin refresh) ────────────────────────────────────────

/** `POST /auth/login`. 403 `AUTH_EMAIL_UNVERIFIED` trae `userId` y `signupToken?` en el error. */
export function login(input: { email: string; password: string }): Promise<LoginResponse> {
  return request("/auth/login", { method: "POST", body: input });
}

/**
 * `POST /auth/signup`. Con la API en producción trae `signupToken`; con
 * `AUTH_AUTO_VERIFY_EMAIL=true` (solo local) trae `emailVerified: true` y no
 * hay código: se llama `login` (§5.2).
 */
export type SignupResponse = { userId: string; message: string; signupToken?: string; emailVerified?: boolean };
export function signup(input: { name: string; email: string; password: string }): Promise<SignupResponse> {
  return request("/auth/signup", { method: "POST", body: input });
}

/** `POST /auth/verify`: abre la sesión directamente con los tokens de la respuesta (§5.2). */
export type VerifyResponse = LoginResponse;
export function verifyEmail(input: { userId: string; code: string; signupToken?: string }): Promise<VerifyResponse> {
  const { signupToken, ...rest } = input;
  // Sin token no se manda la llave (cuentas viejas).
  return request("/auth/verify", { method: "POST", body: signupToken ? { ...rest, signupToken } : rest });
}

/** `POST /auth/resend`. Un 429 `RATE_LIMIT` aquí se muestra con `screen: "resend-code"`. */
export function resendCode(input: { userId: string; signupToken?: string }): Promise<{ message: string }> {
  const { signupToken, ...rest } = input;
  return request("/auth/resend", { method: "POST", body: signupToken ? { ...rest, signupToken } : rest });
}

/** `POST /auth/forgot-password`: siempre 200, exista la cuenta o no (§5.3). */
export function forgotPassword(email: string): Promise<{ message: string }> {
  return request("/auth/forgot-password", { method: "POST", body: { email } });
}

/** `POST /auth/verify-reset-code` → `resetToken` (JWT de 10 minutos). */
export function verifyResetCode(input: { email: string; code: string }): Promise<{ resetToken: string }> {
  return request("/auth/verify-reset-code", { method: "POST", body: input });
}

/**
 * `POST /auth/reset-password`: abre sesión y revoca las demás, incluidas las
 * conexiones de Claude. API: su `user` no trae `onboarded`.
 */
export function resetPassword(input: { resetToken: string; newPassword: string }): Promise<LoginResponse> {
  return request("/auth/reset-password", { method: "POST", body: input });
}

/** `POST /auth/google`: 200 cuenta existente, 201 cuenta nueva (`isNewUser`). */
export function loginWithGoogle(idToken: string): Promise<SocialLoginResponse> {
  return request("/auth/google", { method: "POST", body: { idToken } });
}

/**
 * `POST /auth/apple`. `nonce` es el valor CRUDO (la API lo hashea y compara con
 * el claim). `name` solo si Apple lo mandó: nunca vacío.
 */
export function loginWithApple(input: { idToken: string; nonce: string; name?: string }): Promise<SocialLoginResponse> {
  const name = input.name?.trim();
  return request("/auth/apple", {
    method: "POST",
    body: { idToken: input.idToken, nonce: input.nonce, ...(name ? { name } : {}) },
  });
}

/** `POST /auth/refresh`: rota el refresh token (el anterior queda revocado). Sin `user`. */
export function refreshTokens(refreshToken: string): Promise<Tokens> {
  return request("/auth/refresh", { method: "POST", body: { refreshToken } });
}

/** `POST /auth/logout`: 200 aunque el token ya no exista. */
export function logout(refreshToken: string, init: { keepalive?: boolean; signal?: AbortSignal } = {}): Promise<{ message: string }> {
  return request("/auth/logout", { method: "POST", body: { refreshToken }, ...init });
}

// ─── Tipos: datos ──────────────────────────────────────────────────────────

export type Pagination = { total: number; limit: number; offset: number };

export type InstallmentFrequency = "weekly" | "monthly";
export type SplitKind = "even" | "exact" | "percent" | "shares";

export type Expense = {
  id: string;
  amount: number;
  /** Clave de categoría (`food`…). La etiqueta sale de `categories:*`, no de la API. */
  category: string;
  note?: string;
  /** ISO. */
  date: string;
  budgetId?: string;
  /** Dónde se anotó: la app o el conector de Claude. */
  source?: "app" | "claude";
  /** Fotos del gasto; ausente o 0 = ninguna. */
  imageCount?: number;
  /** Quién lo anotó. En un presupuesto compartido, quien responde es `payerId`. */
  createdBy?: string;
  payerId?: string;
  splitKind?: SplitKind;
  /** Lo que le toca a quien pregunta, si el gasto se dividió. */
  yourShare?: number;
  /** API: siempre viene. */
  hasInstallments: boolean;
  installmentPlanId?: string;
  currentInstallment?: number;
  totalInstallments?: number;
  installmentFrequency?: InstallmentFrequency;
};

/** `period` gana sobre `from`/`to` (§7.3). */
export type ExpensesQuery = {
  period?: "today" | "7d" | "30d";
  /** `YYYY-MM-DD` o ISO, leído en `timezone`. */
  from?: string;
  to?: string;
  category?: string;
  /** Busca en la nota. */
  notes?: string;
  /** Por defecto 100 en la app (máximo 500). */
  limit?: number;
  offset?: number;
};

export type ExpensesResponse = {
  expenses: Expense[];
  /** De TODO el filtro, no solo de esta página. */
  totalSpent: number;
  pagination: Pagination;
};

export type Budget = {
  id: string;
  name: string;
  category?: string;
  /** Tope mensual. `null` = sin límite: no entra en los totales ni en el estado. */
  monthly: number | null;
  spent: number;
  /** ISO 4217. Un presupuesto en otra moneda que la de la persona se lista pero no suma. */
  currency: string;
  imageUrl?: string;
  role?: "admin" | "member";
  shared?: boolean;
  /** Congelado: de solo lectura (venció el Centavos+ de su admin). */
  frozen?: boolean;
};

/** `month` (1–12) y `year` (2000–2100) van juntos o no van (400 `VALIDATION` si solo uno). */
export type BudgetsQuery = {
  month?: number;
  year?: number;
  /** `true` = compartidos, `false` = solos, sin él = todos. También acota los totales. */
  shared?: boolean;
  /** Por defecto 50, máximo 200. */
  limit?: number;
  offset?: number;
};

export type BudgetsResponse = {
  budgets: Budget[];
  totalOfBudgets: number;
  totalSpent: number;
  totalRemaining: number;
  pagination: Pagination;
};

export type BudgetDetailQuery = { month?: number; year?: number; limit?: number; offset?: number };

export type BudgetSettlement = {
  id: string;
  fromUser: string;
  fromUserName: string;
  toUser: string;
  toUserName: string;
  amount: number;
  note?: string;
  /** ISO. */
  settledAt: string;
};

export type BudgetDetailResponse = {
  budget: Budget;
  /** Los gastos del mes que suman `budget.spent`, del más nuevo al más viejo. */
  expenses: Expense[];
  totalExpensesCount: number;
  pagination: Pagination;
  /** `[]` en un presupuesto solo. */
  settlements: BudgetSettlement[];
};

export type Subscription = {
  id: string;
  name: string;
  emoji: string;
  amount: number;
  frequency: "monthly" | "yearly";
  /** ISO. */
  nextCharge: string;
  category: string;
  note?: string;
  active: boolean;
  history?: { id: string; date: string; amount: number }[];
};

export type SubscriptionsQuery = { limit?: number; offset?: number };

export type SubscriptionsResponse = {
  subscriptions: Subscription[];
  activeSubscriptions: number;
  projectedMonthlyCost: number;
  projectedYearlyCost: number;
  pagination: Pagination;
};

export type PulseStatus = "green" | "yellow" | "red";

export type PulseBudget = {
  id: string;
  name: string;
  category?: string;
  monthly: number | null;
  currency: string;
  imageUrl?: string;
  spent: number;
};

/** API: los gastos recientes no traen datos de pagos a meses (la app los declara opcionales). */
export type PulseExpense = {
  id: string;
  amount: number;
  category: string;
  note?: string;
  date: string;
  imageCount: number;
};

export type PulseResponse = {
  status: PulseStatus;
  spentToday: number;
  /** Los últimos 7 días corridos. La app no lo usa; `spentThisWeek` es lunes a domingo. */
  spentLast7: number;
  spentThisWeek: number;
  spentThisMonth: number;
  totalBudget: number;
  totalSpent: number;
  subscriptionsMonthly: number;
  recentExpenses: PulseExpense[];
  budgets: PulseBudget[];
};

export type CatalogCategory = { key: string; label: string; emoji: string };

// ─── Datos (con Bearer; refrescan ante un 401) ─────────────────────────────

/** `GET /me`. */
export function getMe(): Promise<Me> {
  return request("/me", { auth: true });
}

/** `GET /pulse`. */
export function getPulse(): Promise<PulseResponse> {
  return request("/pulse", { auth: true, query: { timezone: timezone() } });
}

/** `GET /expenses`. */
export function getExpenses(query: ExpensesQuery = {}, init: { signal?: AbortSignal } = {}): Promise<ExpensesResponse> {
  return request("/expenses", { auth: true, query: { ...query, timezone: timezone() }, ...init });
}

/** `GET /budgets`. */
export function getBudgets(query: BudgetsQuery = {}, init: { signal?: AbortSignal } = {}): Promise<BudgetsResponse> {
  return request("/budgets", { auth: true, query: { ...query, timezone: timezone() }, ...init });
}

/** `GET /budgets/:id`. 404 `BUDGET_NOT_FOUND` si no existe, no es de la persona o no es un UUID. */
export function getBudget(id: string, query: BudgetDetailQuery = {}, init: { signal?: AbortSignal } = {}): Promise<BudgetDetailResponse> {
  return request(`/budgets/${encodeURIComponent(id)}`, { auth: true, query: { ...query, timezone: timezone() }, ...init });
}

/** `GET /subscriptions`. */
export function getSubscriptions(query: SubscriptionsQuery = {}, init: { signal?: AbortSignal } = {}): Promise<SubscriptionsResponse> {
  return request("/subscriptions", { auth: true, query: { ...query, timezone: timezone() }, ...init });
}

/** `GET /categories`: pública y estática. La app web usa `categories:*`, no estas etiquetas. */
export async function getCategories(): Promise<CatalogCategory[]> {
  const { categories } = await request<{ categories: CatalogCategory[] }>("/categories");
  return categories;
}

// ─── Onboarding (D6, §5.8) ─────────────────────────────────────────────────

export type OnboardingCatalogBudget = {
  key: string;
  name: string;
  category: string;
  emoji: string;
  defaultMonthly: number;
};

export type OnboardingCatalogSubscription = {
  key: string;
  name: string;
  category: string;
  emoji: string;
  defaultAmount: number;
  frequency: "monthly" | "yearly";
};

export type OnboardingCatalog = {
  currency: string;
  language: string;
  budgets: OnboardingCatalogBudget[];
  subscriptions: OnboardingCatalogSubscription[];
};

/** `GET /onboarding/catalog`: ya viene localizado y con montos de la moneda. */
export function getOnboardingCatalog(query: { currency: string; language: string }): Promise<OnboardingCatalog> {
  return request("/onboarding/catalog", { auth: true, query });
}

export type OnboardingApplyBody =
  | {
      currency: string;
      language: string;
      purpose: "personal";
      /** Sin `monthly` se acepta el monto del catálogo. */
      budgets: { key: string; monthly?: number }[];
      subscriptions: { key: string; amount?: number }[];
    }
  | { currency: string; language: string; purpose: "trip"; tripName: string; invites: string[] };

export type OnboardingInviteStatus = "invited" | "invited_pending" | "already_member" | "failed";

export type OnboardingApplyResponse = {
  onboarded: boolean;
  purpose: "personal" | "trip";
  currency: string;
  language: string;
  created: {
    budgets: { id: string; name: string; monthly: number | null }[];
    subscriptions: { id: string; name: string }[];
  };
  /** Los que no cupieron bajo el tope de presupuestos (la API los salta, no los rechaza). */
  skippedBudgets?: string[];
  /** Solo en viajes. */
  invites?: { email: string; status: OnboardingInviteStatus }[];
};

/**
 * `POST /onboarding/apply` (201). Lleva `Idempotency-Key`: se genera UNA por
 * intento de terminar el wizard (`newIdempotencyKey()`) y se reusa en los
 * reintentos, para que un corte de red no lo aplique dos veces. 409
 * `ONBOARDING_ALREADY_DONE` si ya estaba configurada.
 */
export function applyOnboarding(body: OnboardingApplyBody, idempotencyKey: string): Promise<OnboardingApplyResponse> {
  return request("/onboarding/apply", { method: "POST", auth: true, body, headers: { "idempotency-key": idempotencyKey } });
}

/** `POST /onboarding/skip`: marca la cuenta como configurada sin sembrar nada. */
export function skipOnboarding(): Promise<{ onboarded: boolean; onboardingChoice: string }> {
  return request("/onboarding/skip", { method: "POST", auth: true });
}

// ─── Conectar con Claude (D5, §4.8) ────────────────────────────────────────

export type ClaudeConnection = {
  id: string;
  /** El host del cliente (`claude.ai`). */
  client: string;
  scopes: string[];
  createdAt: string;
  lastUsedAt: string | null;
};

export type ConnectionsResponse = {
  /** `false`: la cuenta no está en `MCP_ALLOWED_USERS`; la lista y desconectar siguen. */
  available: boolean;
  connections: ClaudeConnection[];
};

/** Secreto de un solo uso que se escribe en la página de Claude. No se guarda en ningún lado. */
export type LinkCode = { code: string; expiresAt: string };

/** `POST /me/connections/link-code` (201). 403 `CONNECTOR_NOT_AVAILABLE`; 10 cada 15 min (`RATE_LIMIT`). */
export function createLinkCode(): Promise<LinkCode> {
  return request("/me/connections/link-code", { method: "POST", auth: true });
}

/** `GET /me/connections`. */
export function getConnections(): Promise<ConnectionsResponse> {
  return request("/me/connections", { auth: true });
}

/** `DELETE /me/connections/:id`. 404 `CONNECTION_NOT_FOUND`. */
export function revokeConnection(id: string): Promise<{ revoked: boolean }> {
  return request(`/me/connections/${encodeURIComponent(id)}`, { method: "DELETE", auth: true });
}
