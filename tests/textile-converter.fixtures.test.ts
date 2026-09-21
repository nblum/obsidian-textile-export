import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { convertMarkdownToTextile } from "../src/textile-converter.ts";

/** Directory holding `<name>.md` inputs and their expected `<name>.textile` outputs. */
const FIXTURE_DIR = fileURLToPath(new URL("./fixtures/", import.meta.url));

/** Lists fixture base names (without extension) in sorted order so test order is deterministic. */
function listFixtureNames(): string[] {
	return readdirSync(FIXTURE_DIR)
		.filter((file) => file.endsWith(".md"))
		.map((file) => file.slice(0, -".md".length))
		.sort();
}

/** Reads a fixture file as UTF-8 text. */
function readFixture(fileName: string): string {
	return readFileSync(`${FIXTURE_DIR}${fileName}`, "utf8");
}

describe("convertMarkdownToTextile fixtures", () => {
	const names = listFixtureNames();

	test("discovers the fixture files", () => {
		// Guards against a wrong path silently turning the suite into zero fixture tests.
		assert.ok(names.length > 0, `no .md fixtures found in ${FIXTURE_DIR}`);
	});

	for (const name of names) {
		test(`converts ${name}.md to ${name}.textile`, () => {
			const actual = convertMarkdownToTextile(readFixture(`${name}.md`));
			assert.equal(actual, readFixture(`${name}.textile`));
		});
	}
});
