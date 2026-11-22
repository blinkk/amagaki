---
title: Localization & Strings
order: 4
description: API reference for Locale, LocaleSet, TranslationString, and LocalizableData.
---
# Localization & Strings

## `Locale`

Represents a locale (e.g. `en`, `de`, `ja`, `ar`). Obtain cached instances via `pod.locale('de')`.

| Member | Type / Signature | Description |
| --- | --- | --- |
| `id` | `string` | Locale identifier string (e.g. `'en'`, `'fr_CA'`, `'ar'`). |
| `podPath` | `string` | Path to the locale's translation catalog (`/locales/{id}.yaml`). |
| `rtl` | `boolean` | `true` for right-to-left languages (Arabic, Hebrew, Persian, Urdu, etc.). |
| `translations` | `Record<string, string>` | Loaded mapping of source strings to translated strings from `/locales/{id}.yaml`. |
| `recordedStrings` | `Map<TranslationString, Set<Document>>` | Missing strings recorded during the current build and the documents that requested them. |
| `getTranslation(value, location?)` | `string` | Resolves the translation for a string or `TranslationString` (respecting `prefer` fallback), recording missing translations when absent. |
| `toTranslationString(value)` | `TranslationString` | Normalizes a raw string or `TranslationString` into a `TranslationString`. |
| `recordMissingString(string, location?)` | `void` | Records a string missing from `translations` for build reporting and `--write-locales`. |

```typescript
const de = pod.locale('de');
const heading = de.getTranslation('Welcome');
if (de.rtl) {
  // Handle right-to-left layout
}
```

---

## `LocaleSet`

A `Set<Locale>` subclass with helper construction from locale code strings:

```typescript
const locales = LocaleSet.fromIds(['en', 'de', 'ja'], pod);
```

---

## `TranslationString`

Represents a translatable string, created via `pod.string(options, locale?)` or `!pod.string` in YAML.

### `StringOptions`

| Property | Type | Description |
| --- | --- | --- |
| `value` | `string` | Canonical source string (used as the lookup key and fallback). |
| `prefer` | `string` (optional) | Updated source string to prefer once a translation exists for it, falling back to `value`'s translation until then. |

### Methods

| Member | Signature | Description |
| --- | --- | --- |
| `localize(locale: Locale)` | `TranslationString` | Returns a copy bound to `locale`. |
| `toString()` | `string` | Resolves the translated string in `this.locale` (or returns `prefer ?? value` if unlocalized). |

```yaml
# YAML example with preferred string fallback:
cta: !pod.string
  value: Get started
  prefer: Start building
```

---

## `LocalizableData`

Backing class for the `!IfLocale` YAML tag. Stores a map of locale IDs (plus optional `default`) and resolves the appropriate branch for a document's locale via `localize(locale: Locale)`.

```yaml
bannerImage: !IfLocale
  default: /static/images/hero-en.png
  ja: /static/images/hero-ja.png
  de: /static/images/hero-de.png
```
