import fs from "node:fs";
import ts from "typescript";
import openapiTS, { astToString } from "openapi-typescript";

const BLOB = ts.factory.createTypeReferenceNode(
    ts.factory.createIdentifier("Blob")
);

async function main() {
    const ast = await openapiTS(
        new URL("http://localhost:5117/openapi/v1.json"),
        {
            transform(schemaObject) {
                if (schemaObject.format === "binary") {
                    return BLOB;
                }
            },
        }
    );

    const contents = astToString(ast);
    fs.writeFileSync("./lib/api/schema.d.ts", contents);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});