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
export default class AliasResolverPlugin {
    alias: string;
    baseDir: string;
    targetDir: string;
    fileTypes: string[];
    constructor(options?: PluginOptions);
    normalizeFileTypes(fileTypes?: string | string[]): string[];
    shouldProcessFile(filePath: string): boolean;
    toRelativeImport(currentFilePath: string, targetPath: string): string;
    fixFile(filePath: string): void;
    walk(dir: string): void;
    apply(compiler: MinimalCompiler): void;
}
export {};
