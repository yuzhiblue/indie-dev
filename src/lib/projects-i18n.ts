import type { CollectionEntry } from 'astro:content';

export interface LangInfo {
  /** BCP47 code, used for `<html lang>` and `hreflang` */
  code: string;
  /** Label shown in the language switcher */
  label: string;
}

/** Known languages. Add a new entry here to support another language. */
export const LANG_META: Record<string, LangInfo> = {
  zh: { code: 'zh-CN', label: '中文' },
  en: { code: 'en', label: 'English' },
  ja: { code: 'ja', label: '日本語' },
  ko: { code: 'ko', label: '한국어' },
  fr: { code: 'fr', label: 'Français' },
  de: { code: 'de', label: 'Deutsch' },
  es: { code: 'es', label: 'Español' },
  ru: { code: 'ru', label: 'Русский' },
};

export function langMeta(lang: string): LangInfo {
  return LANG_META[lang] ?? { code: lang, label: lang };
}

/**
 * Grouping key for translations of the same project.
 * Uses the explicit `i18nKey` field when present, otherwise strips a trailing
 * two-letter language suffix (e.g. `obstimer-en` -> `obstimer`).
 */
export function baseKeyOf(project: CollectionEntry<'projects'>): string {
  if (project.data.i18nKey) return project.data.i18nKey;
  return project.id.replace(/-([a-z]{2})$/, '');
}

/**
 * Return one representative per language group (prefers the `zh` version),
 * so list/index/pagination pages don't show the same project once per language.
 */
export function dedupeProjects(
  projects: CollectionEntry<'projects'>[]
): CollectionEntry<'projects'>[] {
  const rep = new Map<string, CollectionEntry<'projects'>>();
  for (const p of projects) {
    const k = baseKeyOf(p);
    const existing = rep.get(k);
    if (!existing || (existing.data.lang !== 'zh' && p.data.lang === 'zh')) {
      rep.set(k, p);
    }
  }
  return [...rep.values()];
}
