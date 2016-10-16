
const isProduction = require('./core').isProduction;
const Config = require('./config');
const colors = require('colors/safe');

const rollup = require('rollup');
const babel = require('rollup-plugin-babel');
const resolve = require('rollup-plugin-node-resolve');
const eslint = require('rollup-plugin-eslint');
const uglify = require('uglify-js');
const fs = require("fs");
const path = require("path");

const ASSETS_FOLDER_JS = Config.srcPathJs;
const PUBLIC_BUILD_FOLDER = Config.buildPathJs;

const plugins = [
  eslint(),

  babel({
    babelrc: false,
    //exclude: 'node_modules/!**',
    presets: [
      'es2015-rollup',
      'stage-0'
    ]
  }),

  resolve({
    browser: true,
    main: true
  })
];

function removeLines(file) {

  return new Promise(resolve => {
    const fs = require('fs');
    const readline = require('readline');
    const stream = require('stream');

    const instream = fs.createReadStream(file);
    const outstream = new stream;
    const rl = readline.createInterface(instream, outstream);

    const lines = [];

    rl.on('line', function(line) {

      if (line.indexOf('import') !== 0 && line.indexOf('export') !== 0) {
        lines.push(line);
      }

    });

    rl.on('close', function() {

      const str = fs.createWriteStream(file);
      lines.forEach(line => {
        str.write(line + "\n");
      });
      str.end();
      str.on('close', () => {
        resolve();
      })

    });
  })

}

function buildJs(appEntryFile, file = null, destFile = null, excludeFiles = []) {
  return new Promise((res, reject) => {
    if (file === null) {
      file = ASSETS_FOLDER_JS + '/' + appEntryFile + '.js';
    }
    if (destFile === null) {
      destFile = PUBLIC_BUILD_FOLDER + '/' + appEntryFile + '.js';
    }

    const external = excludeFiles.map(item => path.resolve(item));

    console.log(colors.yellow('Bundling JS file: ' + file));
    rollup.rollup({
      dest: destFile,
      entry: file,
      external: external,
      treeshake: false,
      plugins: plugins,
      sourceMap: true
    }).then((bundle) => {
      const rollupDone = bundle.generate();
      fs.writeFileSync(destFile, rollupDone.code);

      return removeLines(destFile);
    }).then(() => {
      if (isProduction) {
        const minified = uglify.minify(destFile, {
          compress: {
            drop_console: true,
          }
        });
        fs.writeFile(destFile, minified.code, 'utf-8');
      }
      console.log(colors.green(`  ${isProduction ? 'Minified ' : ''}JS Bundle created: ${destFile}`));
      res();
    }).catch(function(e) {
      console.error(colors.red(`  Error: ${e.message}`));
      reject();
    });
  });
}

module.exports = buildJs;
