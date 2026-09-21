import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { convertMarkdownToTextile } from "../src/textile-converter.ts";

describe("convertMarkdownToTextile", () => {
	test("strips YAML frontmatter", () => {
		const input = "---\ntitle: Foo\ntags: [a, b]\n---\nHello world";
		assert.equal(convertMarkdownToTextile(input), "Hello world");
	});

	test("converts ATX headings", () => {
		assert.equal(convertMarkdownToTextile("# Title"), "h1. Title");
		assert.equal(convertMarkdownToTextile("### Sub"), "h3. Sub");
	});

	test("separates a heading from a directly following list item with a blank line", () => {
		assert.equal(
			convertMarkdownToTextile("## Ziel\n* Abnahme des Lieferumfangs f"),
			"h2. Ziel\n\n* Abnahme des Lieferumfangs f",
		);
	});

	test("separates a heading from a directly following paragraph and from a preceding line", () => {
		assert.equal(convertMarkdownToTextile("Intro\n# Title\nText"), "Intro\n\nh1. Title\n\nText");
	});

	test("keeps existing blank lines around headings without doubling them", () => {
		assert.equal(convertMarkdownToTextile("Intro\n\n# Title\n\nText"), "Intro\n\nh1. Title\n\nText");
	});

	test("separates consecutive headings with a single blank line", () => {
		assert.equal(convertMarkdownToTextile("# One\n## Two"), "h1. One\n\nh2. Two");
	});

	test("converts bold, italic and combined emphasis", () => {
		assert.equal(convertMarkdownToTextile("**bold**"), "*bold*");
		assert.equal(convertMarkdownToTextile("__bold__"), "*bold*");
		assert.equal(convertMarkdownToTextile("*italic*"), "_italic_");
		assert.equal(convertMarkdownToTextile("_italic_"), "_italic_");
		assert.equal(convertMarkdownToTextile("***both***"), "_*both*_");
	});

	test("does not re-interpret an already-converted bold run as italic", () => {
		assert.equal(convertMarkdownToTextile("**bold** and *italic*"), "*bold* and _italic_");
	});

	test("converts inline code without touching its contents", () => {
		assert.equal(convertMarkdownToTextile("Use `*not bold*` here"), "Use @*not bold*@ here");
	});

	test("converts strikethrough", () => {
		assert.equal(convertMarkdownToTextile("~~gone~~"), "-gone-");
	});

	test("converts links and does not corrupt underscores inside the URL", () => {
		assert.equal(
			convertMarkdownToTextile("[Docs](https://example.com/foo_bar_baz)"),
			'"Docs":https://example.com/foo_bar_baz',
		);
	});

	test("converts images with and without alt text", () => {
		assert.equal(convertMarkdownToTextile("![Alt](img.png)"), "!img.png(Alt)!");
		assert.equal(convertMarkdownToTextile("![](img.png)"), "!img.png!");
	});

	test("converts Obsidian wikilinks to plain text", () => {
		assert.equal(convertMarkdownToTextile("See [[Some Note]]"), "See Some Note");
		assert.equal(convertMarkdownToTextile("See [[Some Note|alias]]"), "See alias");
	});

	test("converts unordered and ordered lists with nesting", () => {
		const input = "- one\n  - nested\n1. first\n2. second";
		assert.equal(convertMarkdownToTextile(input), "* one\n** nested\n# first\n# second");
	});

	test("converts a blockquote paragraph with a single leading marker", () => {
		const input = "> line one\n> line two";
		assert.equal(convertMarkdownToTextile(input), "bq. line one\nline two");
	});

	test("converts a fenced code block with a language to Textile <pre><code>", () => {
		const input = "```ts\nconst a = 1;\n```";
		assert.equal(
			convertMarkdownToTextile(input),
			'<pre><code class="ts">\nconst a = 1;\n</code></pre>',
		);
	});

	test("converts a fenced code block without a language to a plain <pre> block", () => {
		const input = "```\nplain text\n```";
		assert.equal(convertMarkdownToTextile(input), "<pre>\nplain text\n</pre>");
	});

	test("converts a Markdown table to Textile table syntax", () => {
		const input = "| A | B |\n| --- | --- |\n| 1 | 2 |";
		assert.equal(convertMarkdownToTextile(input), "|_. A |_. B |\n| 1 | 2 |");
	});

	test("emits Redmine thumbnail macros for local images when enabled", () => {
		const options = { imagesAsThumbnails: true };
		assert.equal(convertMarkdownToTextile("![Alt](shots/menu.png)", options), "{{thumbnail(menu.png)}}");
		assert.equal(convertMarkdownToTextile("![Alt|300](menu.png)", options), "{{thumbnail(menu.png, size=300)}}");
		assert.equal(convertMarkdownToTextile("![[shots/menu.png]]", options), "{{thumbnail(menu.png)}}");
		assert.equal(convertMarkdownToTextile("![[menu.png|400]]", options), "{{thumbnail(menu.png, size=400)}}");
	});

	test("uses the width as thumbnail size and falls back to the height", () => {
		const options = { imagesAsThumbnails: true };
		assert.equal(convertMarkdownToTextile("![[menu.png|300x200]]", options), "{{thumbnail(menu.png, size=300)}}");
		assert.equal(convertMarkdownToTextile("![alt|x](menu.png)", options), "{{thumbnail(menu.png)}}");
	});

	test("keeps remote images as Textile images when thumbnails are enabled", () => {
		const options = { imagesAsThumbnails: true };
		assert.equal(
			convertMarkdownToTextile("![Remote|200](https://example.com/pic_1.png)", options),
			"!{width:200px}https://example.com/pic_1.png(Remote)!",
		);
	});

	test("converts thumbnails inside tables and lists", () => {
		const options = { imagesAsThumbnails: true };
		assert.equal(convertMarkdownToTextile("- ![[a.png|50]]", options), "* {{thumbnail(a.png, size=50)}}");
		assert.equal(
			convertMarkdownToTextile("| P |\n| --- |\n| ![[a.png]] |", options),
			"|_. P |\n| {{thumbnail(a.png)}} |",
		);
	});

	test("leaves non-image embeds untouched when thumbnails are enabled", () => {
		const options = { imagesAsThumbnails: true };
		assert.equal(convertMarkdownToTextile("![[Some Note]]", options), "!Some Note");
	});

	test("keeps escaped pipes inside table cells so image sizes survive", () => {
		assert.equal(
			convertMarkdownToTextile("| P |\n| --- |\n| ![[a.png\\|50]] |"),
			"|_. P |\n| !{width:50px}a.png! |",
		);
	});

	test("does not read an image embed with a size followed by a rule as a table", () => {
		const input = "![[Bildschirmfoto vom 2026-09-19 14-57-55.png|540]]\n---";
		assert.equal(
			convertMarkdownToTextile(input),
			"!{width:540px}Bildschirmfoto vom 2026-09-19 14-57-55.png!\n---",
		);
	});

	test("requires header and separator rows to have the same column count", () => {
		assert.equal(convertMarkdownToTextile("a | b\n---"), "a | b\n---");
		assert.equal(convertMarkdownToTextile("| a | b |\n| --- | --- |\n| 1 | 2 |"), "|_. a |_. b |\n| 1 | 2 |");
	});

	test("emits plain Textile images by default", () => {
		assert.equal(convertMarkdownToTextile("![[a.png|50]]"), "!{width:50px}a.png!");
		assert.equal(convertMarkdownToTextile("![[a.png|50]]", { imagesAsThumbnails: false }), "!{width:50px}a.png!");
	});
});
