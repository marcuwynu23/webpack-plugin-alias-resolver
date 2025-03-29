import fs from "fs";
import path from "path";

type MinimalCompiler = {
  hooks: {
    beforeRun: {
      tap: (pluginName: string, callback: () => void) => void;
    };
  };
};
type PluginOptions = {
  alias?: string;
  baseDir?: string;
  targetDir?: string;
  fileTypes?: string | string[];
};

class AliasResolverPlugin {
  alias: string;
  baseDir: string;
  targetDir: string;
  fileTypes: string[];

  constructor(options: PluginOptions = {}) {
    this.alias = options.alias || "@/";
    this.baseDir = path.resolve(options.baseDir || "dist");
    this.targetDir = path.resolve(options.targetDir || "dist");

    this.fileTypes = this.normalizeFileTypes(options.fileTypes);
  }

  normalizeFileTypes(fileTypes?: string | string[]): string[] {
    if (!fileTypes) return ["js"];
    if (typeof fileTypes === "string") {
      if (fileTypes === "both") return ["js", "ts"];
      return [fileTypes.replace(/^\./, "").toLowerCase()];
    }
    return fileTypes.map((ext) => ext.replace(/^\./, "").toLowerCase());
  }

  shouldProcessFile(filePath: string): boolean {
    const ext = path.extname(filePath).replace(/^\./, "").toLowerCase();
    return this.fileTypes.includes(ext);
  }

  toRelativeImport(currentFilePath: string, targetPath: string): string {
    const relPath = path.relative(path.dirname(currentFilePath), targetPath);
    return "./" + relPath.replace(/\\/g, "/").replace(/\.js$/, "");
  }
  fixFile(filePath: string): void {
    let content = fs.readFileSync(filePath, "utf8");

    const regex = new RegExp(
      `(?:from\\s+['"]${this.alias}(.*?)['"]|require\\(['"]${this.alias}(.*?)['"]\\))`,
      "g"
    );

    const updated = content.replace(
      regex,
      (
        _match: string,
        esImport: string | undefined,
        requireImport: string | undefined
      ): string => {
        const importPath = esImport || requireImport;
        if (!importPath) return _match;

        const targetPath = path.resolve(this.baseDir, `${importPath}.js`);

        if (!fs.existsSync(targetPath)) {
          console.warn(
            `⚠️ Cannot resolve: ${filePath} -> ${this.alias}${importPath}`
          );
          return _match;
        }

        const relative = this.toRelativeImport(filePath, targetPath);
        return _match.startsWith("from")
          ? `from '${relative}'`
          : `require('${relative}')`;
      }
    );

    fs.writeFileSync(filePath, updated, "utf8");
  }

  walk(dir: string): void {
    for (const item of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, item);
      if (fs.statSync(fullPath).isDirectory()) {
        this.walk(fullPath);
      } else if (this.shouldProcessFile(fullPath)) {
        this.fixFile(fullPath);
      }
    }
  }

  apply(compiler: MinimalCompiler): void {
    compiler.hooks.beforeRun.tap("AliasResolverPlugin", () => {
      console.log(
        `🔧 [AliasResolverPlugin] Rewriting ${
          this.alias
        } imports in [${this.fileTypes.join(", ")}] files...`
      );
      this.walk(this.targetDir);
      console.log("✅ [AliasResolverPlugin] Import rewriting complete.");
    });
  }
}

module.exports = AliasResolverPlugin;
module.exports.default = AliasResolverPlugin;
