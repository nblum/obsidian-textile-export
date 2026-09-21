import { moment, Notice, Plugin, TFile, type Menu, type MenuItem } from "obsidian";
import {
	createTranslator,
	resolveLanguage,
	type TranslationVariables,
	type Translator,
} from "./i18n.ts";
import { convertMarkdownToTextile } from "./textile-converter.ts";
import { TextileExportSettingTab } from "./settings-tab.ts";
import {
	DEFAULT_SETTINGS,
	isLanguagePreference,
	readTextileExportSettings,
	type TextileExportSettings,
} from "./settings.ts";

/** Adds an "Export to Textile" entry to the file context menu that copies the note's
 * content to the clipboard, converted to Textile markup. */
export default class TextileExportPlugin extends Plugin {
	preferences: TextileExportSettings = { ...DEFAULT_SETTINGS };
	private translator: Translator = createTranslator("en");

	/** Loads settings, registers the settings tab and the file context menu entry. */
	override async onload(): Promise<void> {
		await this.loadSettings();
		this.addSettingTab(new TextileExportSettingTab(this.app, this));

		this.registerEvent(
			this.app.workspace.on("file-menu", (menu: Menu, file) => {
				if (!(file instanceof TFile) || file.extension !== "md") {
					return;
				}
				menu.addItem((item: MenuItem) => {
					item
						.setTitle(this.translate("menu.export"))
						.setIcon("clipboard-copy")
						.onClick(() => {
							void this.exportFileToTextile(file);
						});
				});
			}),
		);
	}

	/** Translates one UI key using the active language. */
	translate(key: string, variables: TranslationVariables = {}): string {
		return this.translator(key, variables);
	}

	/** Applies a language preference; menu titles are translated on demand, so nothing else to refresh. */
	updateLanguage(preference: string): void {
		this.preferences.language = isLanguagePreference(preference) ? preference : "auto";
		this.translator = createTranslator(resolveLanguage(this.preferences.language, moment.locale()));
	}

	/** Loads persisted settings while retaining defaults for missing or invalid values. */
	async loadSettings(): Promise<void> {
		const saved: unknown = await this.loadData();
		this.preferences = readTextileExportSettings(saved);
		this.translator = createTranslator(resolveLanguage(this.preferences.language, moment.locale()));
	}

	/** Persists the current plugin settings. */
	async saveSettings(): Promise<void> {
		await this.saveData(this.preferences);
	}

	/** Reads a note, converts it to Textile markup, and copies the result to the clipboard. */
	private async exportFileToTextile(file: TFile): Promise<void> {
		try {
			const markdown = await this.app.vault.cachedRead(file);
			const textileText = convertMarkdownToTextile(markdown, {
				imagesAsThumbnails: this.preferences.imagesAsThumbnails,
			});
			await navigator.clipboard.writeText(textileText);
			new Notice(this.translate("notice.exported", { name: file.basename }));
		} catch (error) {
			console.error("Textile Export: failed to export note", error);
			new Notice(this.translate("notice.exportFailed"));
		}
	}
}
