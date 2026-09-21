import deTranslations from "../locales/de.json" with { type: "json" };
import enTranslations from "../locales/en.json" with { type: "json" };

export type Language = "de" | "en";
export type LanguagePreference = "auto" | Language;
export type TranslationVariables = Record<string, string | number>;
type TranslationTable = Record<string, string>;
export type Translator = (key: string, variables?: TranslationVariables) => string;

const TRANSLATIONS: Record<Language, TranslationTable> = {
	de: deTranslations,
	en: enTranslations,
};

/** Detects German locales and uses English for every other locale. */
function detectSystemLanguage(locale = ""): Language {
	const fallbackLocale = Intl.DateTimeFormat().resolvedOptions().locale || "en";
	const detectedLocale = (locale.length > 0 ? locale : fallbackLocale).toLowerCase();
	return detectedLocale.startsWith("de") ? "de" : "en";
}

/** Resolves an automatic or explicit language preference. */
export function resolveLanguage(preference: LanguagePreference, locale = ""): Language {
	return preference === "de" || preference === "en" ? preference : detectSystemLanguage(locale);
}

/** Creates a translator with English fallback and named variable interpolation. */
export function createTranslator(language: Language): Translator {
	const dictionary = TRANSLATIONS[language];
	return (key, variables = {}) => {
		const template = dictionary[key] ?? TRANSLATIONS.en[key] ?? key;
		return template.replace(/\{([a-zA-Z0-9_.-]+)\}/g, (placeholder, variableName: string) => {
			const variableValue = variables[variableName];
			return variableValue === undefined ? placeholder : String(variableValue);
		});
	};
}
