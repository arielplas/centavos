import type { ReactNode } from "react";

/** One numbered section of a legal document. */
export type LegalSectionContent = {
  title: string;
  body: ReactNode;
};

/**
 * A legal document in one language. Section numbers and the table of contents
 * are derived from `sections`, so the TOC can never drift out of sync with the
 * body (it did before: a section added mid-document left the TOC off by one).
 */
export type LegalDoc = {
  /** Page title: used for the <h1>, the <title> and Open Graph. */
  title: string;
  /** Meta description. */
  description: string;
  /** Last-updated date, already written out in this document's language. */
  updated: string;
  intro: ReactNode;
  sections: LegalSectionContent[];
};
