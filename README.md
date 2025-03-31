# webpack-plugin-alias-resolver

🔧 A Webpack plugin that rewrites alias-based imports (like `@/`) into relative paths during build time. Useful for TypeScript or Babel outputs that retain unresolved alias paths.

---

## 📦 Installation

```bash
npm install --save-dev @marcuwynu23/webpack-plugin-alias-resolver
```

> Webpack is a peer dependency. Ensure it's installed:

```bash
npm install --save-dev webpack
```

---

## 🚀 Usage

### Add to your `webpack.config.js`:

```ts
import AliasResolverPlugin from "@marcuwynu23/webpack-plugin-alias-resolver";

export default {
  // ...your config
  plugins: [
    new AliasResolverPlugin({
      alias: "@/",
      baseDir: "js-generated", // folder where alias actually resolves to
      targetDir: "js-generated", // folder to scan and fix
      fileTypes: ["js", "ts", "json"], // file extensions to rewrite
    }),
  ],
};
```

---

## ⚙️ Options

| Option      | Type                 | Default  | Description                                                                            |
| ----------- | -------------------- | -------- | -------------------------------------------------------------------------------------- |
| `alias`     | `string`             | `"@/"`   | The alias prefix used in your imports (`@/`, `~/`, etc.)                               |
| `baseDir`   | `string`             | `"dist"` | Where the alias path actually resolves to (usually output dir)                         |
| `targetDir` | `string`             | `"dist"` | Directory to scan and rewrite imports in                                               |
| `fileTypes` | `string \| string[]` | `"js"`   | File types to rewrite. Use `"js"`, `"ts"`, `"both"`, or an array like `["js", "json"]` |

---

## ✨ What It Does

This plugin searches files inside `targetDir` and rewrites lines like:

```ts
import { thing } from "@/utils/helper";
```

➡️ into:

```ts
import { thing } from "../../utils/helper";
```

This is useful when you're compiling code and the final output still contains unresolved aliases.

---

## 💡 Example Project Structure

```
project/
├── src/
│   └── utils/helper.ts
├── js-generated/
│   └── utils/helper.js       ← compiled output
├── webpack.config.js
```

---

## 🧪 TypeScript Support

This plugin is fully written in TypeScript and ships with type declarations.

---

## 📝 License

MIT © 2025 Mark Wayne Menorca
