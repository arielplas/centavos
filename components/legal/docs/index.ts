// Registry of the legal documents that exist in both languages.

import type { SiteLang } from "@/lib/lang";
import type { LegalDoc } from "../types";
import { termsEs } from "./terms.es";
import { termsEn } from "./terms.en";
import { privacyEs } from "./privacy.es";
import { privacyEn } from "./privacy.en";

export const TERMS: Record<SiteLang, LegalDoc> = { es: termsEs, en: termsEn };
export const PRIVACY: Record<SiteLang, LegalDoc> = { es: privacyEs, en: privacyEn };
