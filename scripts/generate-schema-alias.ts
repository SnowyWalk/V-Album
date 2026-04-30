import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const PROJECT_ROOT = process.cwd();
const SCHEMA_PATH = path.join(PROJECT_ROOT, "lib", "api", "schema.d.ts");
const ALIAS_PATH = path.join(PROJECT_ROOT, "lib", "api", "schema-alias.ts");

type Section = {
    title: string;
    names: string[];
};

function getSchemaNames(sourceFile: ts.SourceFile): string[] {
    const schemaNames: string[] = [];

    for (const statement of sourceFile.statements) {
        if (!ts.isInterfaceDeclaration(statement) || statement.name.text !== "components") {
            continue;
        }

        for (const member of statement.members) {
            if (!ts.isPropertySignature(member) || member.name?.getText(sourceFile) !== "schemas") {
                continue;
            }

            if (!member.type || !ts.isTypeLiteralNode(member.type)) {
                continue;
            }

            for (const schemaMember of member.type.members) {
                if (!ts.isPropertySignature(schemaMember)) {
                    continue;
                }

                const name = schemaMember.name?.getText(sourceFile);
                if (!name) {
                    continue;
                }

                schemaNames.push(name.replace(/^["']|["']$/g, ""));
            }
        }
    }

    return schemaNames;
}

function buildSections(schemaNames: string[]): Section[] {
    const sortedNames = [...schemaNames].sort((a, b) => a.localeCompare(b));

    return [
        {
            title: "Request",
            names: sortedNames.filter((name) => name.endsWith("Request")),
        },
        {
            title: "Response",
            names: sortedNames.filter((name) => name.endsWith("Response")),
        },
        {
            title: "Etc",
            names: sortedNames.filter(
                (name) => !name.endsWith("Request") && !name.endsWith("Response")
            ),
        },
    ];
}

function renderAliasFile(sections: Section[]): string {
    const lines = [
        'import type { components } from "@/lib/api/schema";',
        "",
        'type schema = components["schemas"];',
    ];

    for (const section of sections) {
        lines.push("", `// ${section.title}`);

        if (section.names.length === 0) {
            continue;
        }

        for (const name of section.names) {
            lines.push(`export type ${name} = schema["${name}"];`);
        }
    }

    lines.push("");
    return `${lines.join("\n")}\n`;
}

export function generateSchemaAlias() {
    const schemaSource = fs.readFileSync(SCHEMA_PATH, "utf8");
    const sourceFile = ts.createSourceFile(
        SCHEMA_PATH,
        schemaSource,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS
    );

    const schemaNames = getSchemaNames(sourceFile);
    if (schemaNames.length === 0) {
        throw new Error(`No schemas found in ${SCHEMA_PATH}`);
    }

    const output = renderAliasFile(buildSections(schemaNames));
    fs.writeFileSync(ALIAS_PATH, output);
}

if (import.meta) {
    generateSchemaAlias();
}
