# professor-ary-support

Public support repository seed for First Words by Professor Ary.

## Purpose

Host public support and privacy pages required by app stores.

## Current app coverage

- `first-words`

## Locales currently included

- `en`
- `ca`
- `es`
- `fr`
- `de`
- `pt-br`

## Publishing with GitHub Pages

1. Create a public repository (for example, `professor-ary-support`).
2. Copy the contents of this folder to the root of that repository.
3. Push to `main`.
4. In repository settings, enable GitHub Pages from `main` branch and `/` root.
5. Use the generated URLs in App Store Connect / Play Console for support and privacy policy.

## Structure

- `index.md`: landing page.
- `first-words/<locale>/privacy-policy.md`
- `first-words/<locale>/support.md`

The markdown files include Jekyll front matter so GitHub Pages renders them as pages.

## Regeneration

Regenerate this seed from the canonical source with:

```bash
./scripts/sync-support-repo-seed.sh
```

Canonical source path:

- `aso/first-words/locales/*/{privacy-policy.md,support.md}`
