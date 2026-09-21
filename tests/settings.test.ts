import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { DEFAULT_SETTINGS, isLanguagePreference, readTextileExportSettings } from "../src/settings.ts";

describe("settings", () => {
	test("uses defaults for missing settings", () => {
		assert.deepEqual(readTextileExportSettings(null), DEFAULT_SETTINGS);
		assert.deepEqual(readTextileExportSettings("garbage"), DEFAULT_SETTINGS);
	});

	test("loads a persisted language preference", () => {
		assert.equal(readTextileExportSettings({ language: "de" }).language, "de");
		assert.equal(readTextileExportSettings({ language: "en" }).language, "en");
	});

	test("falls back to automatic for unsupported language values", () => {
		assert.equal(readTextileExportSettings({ language: "fr" }).language, "auto");
		assert.equal(readTextileExportSettings({ language: 1 }).language, "auto");
	});

	test("keeps thumbnails disabled by default and loads a persisted value", () => {
		assert.equal(DEFAULT_SETTINGS.imagesAsThumbnails, false);
		assert.equal(readTextileExportSettings({ imagesAsThumbnails: true }).imagesAsThumbnails, true);
	});

	test("falls back to the default for a non-boolean thumbnail value", () => {
		assert.equal(readTextileExportSettings({ imagesAsThumbnails: "yes" }).imagesAsThumbnails, false);
		assert.equal(readTextileExportSettings({ imagesAsThumbnails: 1 }).imagesAsThumbnails, false);
	});

	test("recognizes only supported language preferences", () => {
		assert.equal(isLanguagePreference("auto"), true);
		assert.equal(isLanguagePreference("fr"), false);
		assert.equal(isLanguagePreference(undefined), false);
	});
});
