
const core = require('./core');
const Config = require('./config');

const fs = require('fs');
const postcss = require('postcss');
const cssnext = require('postcss-cssnext');
const cssimport = require('postcss-import');

if (core.isProduction) {
  const CleanCSS = require('clean-css');
}

const ASSETS_FOLDER_CSS = Config.srcPathCss;
const PUBLIC_BUILD_FOLDER = Config.buildPathCss;

function buildCss(file) {
  return new Promise((resolve, reject) => {
    const srcPath = `${ASSETS_FOLDER_CSS}/${file}.css`;
    const destPath = `${PUBLIC_BUILD_FOLDER}/${file}.css`;
    const input = fs.readFileSync(srcPath, 'utf8');
    console.log(core.colors.yellow(`Bundling CSS file: ${srcPath}`));
    postcss()
      .use(cssimport)
      .use(cssnext)
      .process(input, {
        from: srcPath,
        to: destPath,
      })
      .then((result) => {
        let text = result.css;
        if (core.isProduction) {
          text = new CleanCSS().minify(result.css).styles;
        }
        fs.writeFileSync(destPath, text);
        console.log(core.colors.green(`  CSS bundle created: ${destPath}`));
        resolve();
      }).catch(e => {
        console.error(core.colors.red(`Error: ${e.message}`));
        reject();
    });
  })
}

module.exports = buildCss;
