import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";
import { createTranslator, resolveLanguage } from "../src/i18n.ts";

interface TranslationTable {
	[key: string]: string;
}

/** Loads one translation table for structural assertions. */
function readTranslations(language: "de" | "en"): TranslationTable {
	return JSON.parse(readFileSync(new URL(`../locales/${language}.json`, import.meta.url), "utf8")) as TranslationTable;
}

/** Extracts deterministic placeholder names from one translation value. */
function readPlaceholders(value: string): string[] {
	return [...value.matchAll(/\{([a-zA-Z0-9_.-]+)\}/g)].map((match) => match[1] ?? "").sort();
}

describe("i18n", () => {
	test("German and English expose identical translation keys", () => {
		const germanKeys = Object.keys(readTranslations("de")).sort();
		const englishKeys = Object.keys(readTranslations("en")).sort();
		assert.deepEqual(germanKeys, englishKeys);
	});

	test("matching translations expose identical placeholders", () => {
		const german = readTranslations("de");
		const english = readTranslations("en");
		for (const key of Object.keys(english).sort()) {
			assert.deepEqual(readPlaceholders(german[key] ?? ""), readPlaceholders(english[key] ?? ""), key);
		}
	});

	test("translates named variables in both languages", () => {
		assert.equal(createTranslator("en")("notice.exported", { name: "Note" }), 'Copied "Note" as Textile markup.');
		assert.equal(createTranslator("de")("notice.exported", { name: "Notiz" }), "„Notiz“ wurde als Textile-Markup kopiert.");
	});

	test("falls back to the key for unknown translations", () => {
		assert.equal(createTranslator("de")("unknown.key"), "unknown.key");
	});

	test("resolves explicit and automatic languages", () => {
		assert.equal(resolveLanguage("de", "en-US"), "de");
		assert.equal(resolveLanguage("en", "de-DE"), "en");
		assert.equal(resolveLanguage("auto", "de-AT"), "de");
		assert.equal(resolveLanguage("auto", "fr-FR"), "en");
	});
});
