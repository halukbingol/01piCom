// @ts-check
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

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
        patterns: [{ from: 'src/styles/style.css', to: 'style.css' }],
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
