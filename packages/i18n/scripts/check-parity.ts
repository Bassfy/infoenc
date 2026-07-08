/**
 * i18n parity gate (Phase 2 doc 02 §2.5). Fails CI if any message key exists in one locale but
 * not the other. Keeps Arabic and English co-equal by construction — a missing translation is a
 * build failure, not a silent English fallback in production.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const messagesDir = join(dirname(fileURLToPath(import.meta.url)), "..", "messages");
const locales = ["ar", "en"] as const;

function flatten(obj: Record<string, unknown>, prefix = ""): Set<string> {
  const keys = new Set<string>();
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      for (const nested of flatten(v as Record<string, unknown>, path)) keys.add(nested);
    } else {
      keys.add(path);
    }
  }
  return keys;
}

function loadLocaleKeys(locale: string): Set<string> {
  const dir = join(messagesDir, locale);
  const all = new Set<string>();
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".json"))) {
    const ns = file.replace(/\.json$/, "");
    const data = JSON.parse(readFileSync(join(dir, file), "utf8")) as Record<string, unknown>;
    for (const key of flatten(data)) all.add(`${ns}.${key}`);
  }
  return all;
}

const [ar, en] = locales.map(loadLocaleKeys);
const missingInAr = [...en!].filter((k) => !ar!.has(k));
const missingInEn = [...ar!].filter((k) => !en!.has(k));

if (missingInAr.length || missingInEn.length) {
  if (missingInAr.length) console.error(`Missing in ar:\n  ${missingInAr.join("\n  ")}`);
  if (missingInEn.length) console.error(`Missing in en:\n  ${missingInEn.join("\n  ")}`);
  console.error(`\ni18n parity check FAILED: ${missingInAr.length + missingInEn.length} key(s) out of sync.`);
  process.exit(1);
}

console.log(`i18n parity OK — ${en!.size} keys present in both locales.`);
