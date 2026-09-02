import { Notice, Plugin, TFile, type Menu, type MenuItem } from "obsidian";
import { convertMarkdownToRedmine } from "./redmine-converter.ts";

/** Adds an "Export to Redmine" entry to the file context menu that copies the note's
 * content to the clipboard, converted to Redmine wiki (Textile) markup. */
export default class RedmineExportPlugin extends Plugin {
	/** Registers the file context menu entry. */
	override onload(): void {
		this.registerEvent(
			this.app.workspace.on("file-menu", (menu: Menu, file) => {
				if (!(file instanceof TFile) || file.extension !== "md") {
					return;
				}
				menu.addItem((item: MenuItem) => {
					item
						.setTitle("Export to Redmine")
						.setIcon("clipboard-copy")
						.onClick(() => {
							void this.exportFileToRedmine(file);
						});
				});
			}),
		);
	}

	/** Reads a note, converts it to Redmine wiki markup, and copies the result to the clipboard. */
	private async exportFileToRedmine(file: TFile): Promise<void> {
		try {
			const markdown = await this.app.vault.cachedRead(file);
			const redmineText = convertMarkdownToRedmine(markdown);
			await navigator.clipboard.writeText(redmineText);
			new Notice(`Copied "${file.basename}" as Redmine markup.`);
		} catch (error) {
			console.error("Redmine Export: failed to export note", error);
			new Notice("Redmine Export failed. See console for details.");
		}
	}
}
