import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { convertMarkdownToRedmine } from "../src/redmine-converter.ts";

describe("convertMarkdownToRedmine", () => {
	test("strips YAML frontmatter", () => {
		const input = "---\ntitle: Foo\ntags: [a, b]\n---\nHello world";
		assert.equal(convertMarkdownToRedmine(input), "Hello world");
	});

	test("converts ATX headings", () => {
		assert.equal(convertMarkdownToRedmine("# Title"), "h1. Title");
		assert.equal(convertMarkdownToRedmine("### Sub"), "h3. Sub");
	});

	test("converts bold, italic and combined emphasis", () => {
		assert.equal(convertMarkdownToRedmine("**bold**"), "*bold*");
		assert.equal(convertMarkdownToRedmine("__bold__"), "*bold*");
		assert.equal(convertMarkdownToRedmine("*italic*"), "_italic_");
		assert.equal(convertMarkdownToRedmine("_italic_"), "_italic_");
		assert.equal(convertMarkdownToRedmine("***both***"), "_*both*_");
	});

	test("does not re-interpret an already-converted bold run as italic", () => {
		assert.equal(convertMarkdownToRedmine("**bold** and *italic*"), "*bold* and _italic_");
	});

	test("converts inline code without touching its contents", () => {
		assert.equal(convertMarkdownToRedmine("Use `*not bold*` here"), "Use @*not bold*@ here");
	});

	test("converts strikethrough", () => {
		assert.equal(convertMarkdownToRedmine("~~gone~~"), "-gone-");
	});

	test("converts links and does not corrupt underscores inside the URL", () => {
		assert.equal(
			convertMarkdownToRedmine("[Docs](https://example.com/foo_bar_baz)"),
			'"Docs":https://example.com/foo_bar_baz',
		);
	});

	test("converts images with and without alt text", () => {
		assert.equal(convertMarkdownToRedmine("![Alt](img.png)"), "!img.png(Alt)!");
		assert.equal(convertMarkdownToRedmine("![](img.png)"), "!img.png!");
	});

	test("converts Obsidian wikilinks to plain text", () => {
		assert.equal(convertMarkdownToRedmine("See [[Some Note]]"), "See Some Note");
		assert.equal(convertMarkdownToRedmine("See [[Some Note|alias]]"), "See alias");
	});

	test("converts unordered and ordered lists with nesting", () => {
		const input = "- one\n  - nested\n1. first\n2. second";
		assert.equal(convertMarkdownToRedmine(input), "* one\n** nested\n# first\n# second");
	});

	test("converts a blockquote paragraph with a single leading marker", () => {
		const input = "> line one\n> line two";
		assert.equal(convertMarkdownToRedmine(input), "bq. line one\nline two");
	});

	test("converts a fenced code block with a language to Redmine <pre><code>", () => {
		const input = "```ts\nconst a = 1;\n```";
		assert.equal(
			convertMarkdownToRedmine(input),
			'<pre><code class="ts">\nconst a = 1;\n</code></pre>',
		);
	});

	test("converts a fenced code block without a language to a plain <pre> block", () => {
		const input = "```\nplain text\n```";
		assert.equal(convertMarkdownToRedmine(input), "<pre>\nplain text\n</pre>");
	});

	test("converts a Markdown table to Textile table syntax", () => {
		const input = "| A | B |\n| --- | --- |\n| 1 | 2 |";
		assert.equal(convertMarkdownToRedmine(input), "|_. A |_. B |\n| 1 | 2 |");
	});
});
