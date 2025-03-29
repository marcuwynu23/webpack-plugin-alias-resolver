"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class AliasResolverPlugin {
    constructor(options = {}) {
        this.alias = options.alias || "@/";
        this.baseDir = path_1.default.resolve(options.baseDir || "dist");
        this.targetDir = path_1.default.resolve(options.targetDir || "dist");
        this.fileTypes = this.normalizeFileTypes(options.fileTypes);
    }
    normalizeFileTypes(fileTypes) {
        if (!fileTypes)
            return ["js"];
        if (typeof fileTypes === "string") {
            if (fileTypes === "both")
                return ["js", "ts"];
            return [fileTypes.replace(/^\./, "").toLowerCase()];
        }
        return fileTypes.map((ext) => ext.replace(/^\./, "").toLowerCase());
    }
    shouldProcessFile(filePath) {
        const ext = path_1.default.extname(filePath).replace(/^\./, "").toLowerCase();
        return this.fileTypes.includes(ext);
    }
    toRelativeImport(currentFilePath, targetPath) {
        const relPath = path_1.default.relative(path_1.default.dirname(currentFilePath), targetPath);
        return "./" + relPath.replace(/\\/g, "/").replace(/\.js$/, "");
    }
    fixFile(filePath) {
        let content = fs_1.default.readFileSync(filePath, "utf8");
        const regex = new RegExp(`(?:from\\s+['"]${this.alias}(.*?)['"]|require\\(['"]${this.alias}(.*?)['"]\\))`, "g");
        const updated = content.replace(regex, (_match, esImport, requireImport) => {
            const importPath = esImport || requireImport;
            if (!importPath)
                return _match;
            const targetPath = path_1.default.resolve(this.baseDir, `${importPath}.js`);
            if (!fs_1.default.existsSync(targetPath)) {
                console.warn(`⚠️ Cannot resolve: ${filePath} -> ${this.alias}${importPath}`);
                return _match;
            }
            const relative = this.toRelativeImport(filePath, targetPath);
            return _match.startsWith("from")
                ? `from '${relative}'`
                : `require('${relative}')`;
        });
        fs_1.default.writeFileSync(filePath, updated, "utf8");
    }
    walk(dir) {
        for (const item of fs_1.default.readdirSync(dir)) {
            const fullPath = path_1.default.join(dir, item);
            if (fs_1.default.statSync(fullPath).isDirectory()) {
                this.walk(fullPath);
            }
            else if (this.shouldProcessFile(fullPath)) {
                this.fixFile(fullPath);
            }
        }
    }
    apply(compiler) {
        compiler.hooks.beforeRun.tap("AliasResolverPlugin", () => {
            console.log(`🔧 [AliasResolverPlugin] Rewriting ${this.alias} imports in [${this.fileTypes.join(", ")}] files...`);
            this.walk(this.targetDir);
            console.log("✅ [AliasResolverPlugin] Import rewriting complete.");
        });
    }
}
exports.default = AliasResolverPlugin;
