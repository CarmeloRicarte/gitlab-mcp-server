#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const distFile = join(import.meta.dirname, "..", "dist", "index.js");
const shebang = "#!/usr/bin/env node\n";

const content = readFileSync(distFile, "utf-8");

if (!content.startsWith("#!")) {
	writeFileSync(distFile, shebang + content);
	console.log("✓ Shebang added to dist/index.js");
} else {
	console.log("✓ Shebang already present in dist/index.js");
}
