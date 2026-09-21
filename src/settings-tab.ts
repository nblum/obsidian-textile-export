import { PluginSettingTab, Setting, type App, type Plugin, type SettingDefinitionItem } from "obsidian";
import type { TranslationVariables } from "./i18n.ts";
import { DEFAULT_SETTINGS, isLanguagePreference, type TextileExportSettings } from "./settings.ts";

const AUTHOR_WEBSITE_URL = "https://blum-nico.de";
const GITHUB_REPOSITORY_URL = "https://github.com/nblum/obsidian-textile-export";
const GITHUB_FEEDBACK_URL = `${GITHUB_REPOSITORY_URL}/issues/new`;

/** Plugin members the settings tab needs; keeps the tab independent of the plugin class. */
export interface TextileExportSettingsHost {
	preferences: TextileExportSettings;
	saveSettings(): Promise<void>;
	translate(key: string, variables?: TranslationVariables): string;
	updateLanguage(preference: string): void;
}

type TextileExportSettingsPlugin = Plugin & TextileExportSettingsHost;

/** Renders and persists the Textile Export settings controls. */
export class TextileExportSettingTab extends PluginSettingTab {
	private readonly plugin: TextileExportSettingsPlugin;

	/** Stores the plugin instance used by the settings controls. */
	constructor(app: App, plugin: TextileExportSettingsPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	/** Returns the settings rendered by Obsidian 1.13 and newer. */
	override getSettingDefinitions(): SettingDefinitionItem[] {
		return [
			{
				name: this.plugin.translate("settings.about.name"),
				desc: this.createAboutDescription(),
				searchable: false,
			},
			{
				name: this.plugin.translate("settings.language.name"),
				desc: this.plugin.translate("settings.language.description"),
				control: {
					type: "dropdown",
					key: "language",
					defaultValue: DEFAULT_SETTINGS.language,
					options: {
						auto: this.plugin.translate("settings.language.auto"),
						de: this.plugin.translate("settings.language.de"),
						en: this.plugin.translate("settings.language.en"),
					},
				},
			},
			{
				name: this.plugin.translate("settings.thumbnails.name"),
				desc: this.plugin.translate("settings.thumbnails.description"),
				control: {
					type: "toggle",
					key: "imagesAsThumbnails",
					defaultValue: DEFAULT_SETTINGS.imagesAsThumbnails,
				},
			},
		];
	}

	/** Persists a declarative setting change and applies its runtime side effects. */
	override async setControlValue(key: string, value: unknown): Promise<void> {
		if (key === "language" && isLanguagePreference(value)) {
			this.plugin.updateLanguage(value);
		} else if (key === "imagesAsThumbnails" && typeof value === "boolean") {
			this.plugin.preferences.imagesAsThumbnails = value;
		} else {
			return;
		}
		await this.plugin.saveSettings();
	}

	/** Builds the legacy settings UI for Obsidian versions before declarative settings. */
	override display(): void {
		this.renderSettings();
	}

	/** Renders the legacy controls; called again after a language change so labels follow the new language. */
	private renderSettings(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName(this.plugin.translate("settings.about.name"))
			.setDesc(this.createAboutDescription());

		new Setting(containerEl)
			.setName(this.plugin.translate("settings.language.name"))
			.setDesc(this.plugin.translate("settings.language.description"))
			.addDropdown((dropdown) =>
				dropdown
					.addOption("auto", this.plugin.translate("settings.language.auto"))
					.addOption("de", this.plugin.translate("settings.language.de"))
					.addOption("en", this.plugin.translate("settings.language.en"))
					.setValue(this.plugin.preferences.language)
					.onChange(async (value) => {
						if (!isLanguagePreference(value)) {
							return;
						}
						this.plugin.updateLanguage(value);
						await this.plugin.saveSettings();
						this.renderSettings();
					}),
			);

		new Setting(containerEl)
			.setName(this.plugin.translate("settings.thumbnails.name"))
			.setDesc(this.plugin.translate("settings.thumbnails.description"))
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.preferences.imagesAsThumbnails).onChange(async (value) => {
					this.plugin.preferences.imagesAsThumbnails = value;
					await this.plugin.saveSettings();
				}),
			);
	}

	/** Builds the localized about text and its external links. */
	private createAboutDescription(): DocumentFragment {
		return createFragment((fragment) => {
			fragment.appendText(this.plugin.translate("settings.about.description"));
			fragment.createEl("br");
			fragment.appendText(this.plugin.translate("settings.about.support"));
			fragment.createEl("br");
			this.appendExternalLink(fragment, this.plugin.translate("settings.about.website"), AUTHOR_WEBSITE_URL);
			fragment.appendText(" · ");
			this.appendExternalLink(fragment, this.plugin.translate("settings.about.star"), GITHUB_REPOSITORY_URL);
			fragment.appendText(" · ");
			this.appendExternalLink(fragment, this.plugin.translate("settings.about.feedback"), GITHUB_FEEDBACK_URL);
		});
	}

	/** Appends an external link that opens without access to the Obsidian window. */
	private appendExternalLink(parent: DocumentFragment, label: string, href: string): void {
		parent.createEl("a", {
			text: label,
			href,
			attr: {
				target: "_blank",
				rel: "noopener",
			},
		});
	}
}
