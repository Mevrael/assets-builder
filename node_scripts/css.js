
const fs = require('fs');

const colors = require('colors/safe');

const postcss = require('postcss');
const cssnext = require('postcss-cssnext');
const cssimport = require('postcss-import');
const CleanCSS = require('clean-css');
const stylelint = require('stylelint');
const reporter = require('postcss-reporter');

const CSS = {

  srcPath: '',
  buildPath: '',
  isProduction: false,

  run(args, isProduction, Config) {
    this.srcPath = Config.srcPathJs;
    this.buildPath = Config.buildPathJs;
    this.isProduction = isProduction;

    const file = args.length === 0 ? 'app' : args[0];

    return this.makeFile(file);
  },

  makeFile(file) {
    return new Promise((resolve, reject) => {
      const srcPath = `${this.srcPath}/${file}.css`;
      const destPath = `${this.buildPath}/${file}.css`;
      const input = fs.readFileSync(srcPath, 'utf8');
      console.log(colors.yellow(`    Bundling CSS file: ${srcPath}`));
      postcss()
        .use(stylelint)
        .use(cssimport)
        .use(cssnext)
        .use(reporter({ clearMessages: true }))
        .process(input, {
          from: srcPath,
          to: destPath,
        })
        .then((result) => {
          let text = result.css;
          if (this.isProduction) {
            text = new CleanCSS().minify(result.css).styles;
          }
          fs.writeFileSync(destPath, text);
          console.log(colors.green(`    CSS bundle created: ${destPath}`));
          resolve();
        })
        .catch((e) => {
          reject(e);
        });
    });
  },

};

module.exports = CSS;
