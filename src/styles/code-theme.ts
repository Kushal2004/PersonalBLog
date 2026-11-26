// Syntax colors from the original blog's light and dark CSS variable themes.
export function microCodeTheme(type: "dark" | "light") {
	const dark = type === "dark";
	const foreground = dark ? "#fafafa" : "#09090b";
	const tokens: [string[], string][] = [
		[
			[
				"keyword.operator.accessor",
				"meta.group.braces.round.function.arguments",
				"meta.template.expression",
				"markup.fenced_code meta.embedded.block",
			],
			foreground,
		],
		[["string", "markup.fenced_code", "markup.inline"], "#00a99a"],
		[["comment", "string.quoted.docstring.multi"], "#a19595"],
		[
			[
				"constant.numeric",
				"constant.language",
				"constant.other.placeholder",
				"constant.character.format.placeholder",
				"variable.language.this",
				"variable.other.object",
				"variable.other.class",
				"variable.other.constant",
				"meta.property-name",
				"meta.property-value",
				"support",
			],
			dark ? "#b3cceb" : "#2b70c5",
		],
		[
			[
				"keyword",
				"storage.modifier",
				"storage.type",
				"storage.control.clojure",
				"entity.name.function.clojure",
				"entity.name.tag.yaml",
				"support.function.node",
				"support.type.property-name.json",
				"punctuation.separator.key-value",
				"punctuation.definition.template-expression",
			],
			"#f47067",
		],
		[["variable.parameter.function"], "#4e8fdf"],
		[
			[
				"support.function",
				"entity.name.type",
				"entity.other.inherited-class",
				"meta.function-call",
				"meta.instance.constructor",
				"entity.other.attribute-name",
				"entity.name.function",
				"constant.keyword.clojure",
			],
			dark ? "#6eafad" : "#429996",
		],
		[
			[
				"entity.name.tag",
				"string.quoted",
				"string.regexp",
				"string.interpolated",
				"string.template",
				"string.unquoted.plain.out.yaml",
				"keyword.other.template",
			],
			dark ? "#bf7db6" : "#ae42a0",
		],
		[
			[
				"punctuation.definition.arguments",
				"punctuation.definition.dict",
				"punctuation.separator",
				"meta.function-call.arguments",
			],
			"#8996a3",
		],
		[
			[
				"markup.underline.link",
				"punctuation.definition.metadata.markdown",
				"meta.link.inline.markdown",
			],
			"#8d85ff",
		],
		[["beginning.punctuation.definition.list.markdown"], "#00a99a"],
		[
			[
				"punctuation.definition.string.begin.markdown",
				"punctuation.definition.string.end.markdown",
				"string.other.link.title.markdown",
				"string.other.link.description.markdown",
			],
			"#f47067",
		],
	];
	return {
		name: `micro-${type}`,
		type,
		colors: {
			"editor.foreground": foreground,
			"editor.background": dark ? "#09090b" : "#fafafa",
		},
		tokenColors: [
			{ scope: ["emphasis", "markup.italic.markdown"], settings: { fontStyle: "italic" } },
			{
				scope: ["strong", "markup.heading.markdown", "markup.bold.markdown"],
				settings: { fontStyle: "bold" },
			},
			...tokens.map(([scope, color]) => ({ scope, settings: { foreground: color } })),
		],
	};
}
