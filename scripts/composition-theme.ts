import type { LanguageRegistration } from "shiki";
import { createHighlighterCoreSync } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import light from "shiki/themes/github-light.mjs";
import dark from "shiki/themes/github-dark.mjs";

// The guide owns this small notation. It is not a TypeScript API declaration.
export const grammar = {
  repository: {},
  name: "axiomatic-composition",
  scopeName: "source.axiomatic",
  patterns: [
    {
      name: "string.quoted.double.axiomatic",
      begin: '"',
      end: '"',
      patterns: [
        { name: "constant.character.escape.axiomatic", match: "\\\\." },
      ],
    },
    {
      name: "entity.name.function.axiomatic",
      match: "\\b[A-Z][A-Za-z]*(?=\\()",
    },
  ],
} satisfies LanguageRegistration;
const highlighter = createHighlighterCoreSync({
  themes: [light, dark],
  langs: [grammar],
  engine: createJavaScriptRegexEngine(),
});
export function compositionTokens(source: string) {
  return highlighter.codeToTokensWithThemes(source, {
    lang: "axiomatic-composition",
    themes: { light: "github-light", dark: "github-dark" },
  });
}
