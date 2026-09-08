// @ts-check
const fs = require('fs');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

/**
 * Enforce the invariant the download pane depends on: a content's `id` (from its
 * `index.ts`) must equal its directory name. The pane builds asset URLs as
 * `contents/<ContentModule.id>/assets/…`, while CopyWebpackPlugin copies each
 * content's `assets/` tree to `dist/contents/<dir-name>/assets/…` — so a mismatch
 * silently 404s every download link. Fail the build instead.
 */
function assertContentIdsMatchDirs() {
  const contentsDir = path.resolve(__dirname, 'src/contents');
  for (const dirent of fs.readdirSync(contentsDir, { withFileTypes: true })) {
    if (!dirent.isDirectory()) {
      continue;
    }
    const indexPath = path.join(contentsDir, dirent.name, 'index.ts');
    if (!fs.existsSync(indexPath)) {
      continue;
    }
    const match = fs
      .readFileSync(indexPath, 'utf8')
      .match(/\bid:\s*['"]([^'"]+)['"]/);
    if (match === null) {
      throw new Error(
        `[content] ${dirent.name}/index.ts has no \`id:\` field.`,
      );
    }
    if (match[1] !== dirent.name) {
      throw new Error(
        `[content] id '${match[1]}' in ${dirent.name}/index.ts does not match ` +
          `its directory name '${dirent.name}'. The download pane resolves ` +
          `asset URLs by directory name, so the two must be identical — ` +
          `rename one to match the other. See docs/adding_content.md ` +
          `("Renaming a content").`,
      );
    }
  }
}

/**
 * Page registry. Each entry becomes:
 *   - its own JS bundle (one webpack entry point), and
 *   - its own HTML file (one HtmlWebpackPlugin) that loads ONLY its bundle.
 *
 * To add a new page/content, add one object here and create the matching
 * `src/pages/<name>.ts` entry module. See docs/ADDING_CONTENT.md.
 */
const pages = [
  {
    name: 'index',
    entry: './src/pages/index.ts',
    template: './src/templates/index.html',
    title: 'directAccess',
  },
];

module.exports = (_env, argv) => {
  const isProd = argv.mode === 'production';

  assertContentIdsMatchDirs();

  return {
    entry: pages.reduce((acc, page) => {
      acc[page.name] = page.entry;
      return acc;
    }, /** @type {Record<string, string>} */ ({})),

    output: {
      filename: '[name].[contenthash].js',
      path: path.resolve(__dirname, 'dist'),
      clean: true,
    },

    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          // Content artifacts (config/code/highlight/description) are imported
          // as raw source strings. Scoped to src/contents so it never affects
          // real modules elsewhere.
          test: /\.(txt|html|java|py|js|ts\.txt|csv)$/,
          type: 'asset/source',
          include: path.resolve(__dirname, 'src/contents'),
          exclude: /board\.ts$/,
        },
      ],
    },

    resolve: {
      extensions: ['.ts', '.js'],
    },

    plugins: [
      ...pages.map(
        (page) =>
          new HtmlWebpackPlugin({
            filename: `${page.name}.html`,
            template: page.template,
            // `chunks` restricts this HTML file to its own bundle only, so each
            // page loads solely its own content bundle.
            chunks: [page.name],
            title: page.title,
            inject: 'body',
            minify: isProd,
          }),
      ),
      // Copy the external stylesheet verbatim into dist so CSS stays external
      // (not inlined into the JS bundle).
      new CopyWebpackPlugin({
        patterns: [
          { from: 'src/styles/style.css', to: 'style.css' },
          { from: 'src/assets/01pi.svg', to: '01pi.svg' },
          // Optional raster fallback for browsers without SVG-favicon support.
          { from: 'src/assets/01pi.ico', to: '01pi.ico', noErrorOnMissing: true },
          // Each content's `assets/` tree, served for the download pane at
          // `contents/<id>/assets/<path>` (id === content directory name).
          {
            from: 'src/contents',
            to: 'contents',
            filter: (resourcePath) =>
              resourcePath.split(path.sep).includes('assets'),
            globOptions: { ignore: ['**/.DS_Store'] },
            noErrorOnMissing: true,
          },
        ],
      }),
    ],

    devServer: {
      static: path.resolve(__dirname, 'dist'),
      port: 8080,
      open: true,
    },

    devtool: isProd ? 'source-map' : 'eval-source-map',
  };
};
