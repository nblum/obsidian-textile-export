import type { LanguagePreference } from "./i18n.ts";

/** Persisted Textile Export preferences. */
export interface TextileExportSettings {
	language: LanguagePreference;
	/** Export local images as Redmine `{{thumbnail(...)}}` macros instead of Textile image markup. */
	imagesAsThumbnails: boolean;
}

export const DEFAULT_SETTINGS: TextileExportSettings = {
	language: "auto",
	imagesAsThumbnails: false,
};

/** Returns whether a persisted value is a supported language preference. */
export function isLanguagePreference(value: unknown): value is LanguagePreference {
	return value === "auto" || value === "de" || value === "en";
}

/** Reads persisted settings and applies safe defaults to missing or invalid values. */
export function readTextileExportSettings(value: unknown): TextileExportSettings {
	const savedSettings = typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};

	return {
		language: isLanguagePreference(savedSettings.language) ? savedSettings.language : DEFAULT_SETTINGS.language,
		imagesAsThumbnails:
			typeof savedSettings.imagesAsThumbnails === "boolean"
				? savedSettings.imagesAsThumbnails
				: DEFAULT_SETTINGS.imagesAsThumbnails,
	};
}
