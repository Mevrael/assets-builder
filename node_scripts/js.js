
const isProduction = require('./core').isProduction;
const Config = require('./config');
const colors = require('colors/safe');

const rollup = require('rollup');
const babel = require('rollup-plugin-babel');
const resolve = require('rollup-plugin-node-resolve');
const eslint = require('rollup-plugin-eslint');
const uglify = require('uglify-js');
const fs = require("fs");

const ASSETS_FOLDER_JS = Config.srcPathJs;
const PUBLIC_BUILD_FOLDER = Config.buildPathJs;

const plugins = [
  eslint(),

  babel({
    babelrc: false,
    //exclude: 'node_modules/**',
    presets: [
      ["es2015", {"modules": false}],
      'stage-0'
    ]
  }),

  resolve({
    browser: true,
    main: true
  })
];

/*if (isProduction) {
  const uglify = require("rollup-plugin-uglify");
  plugins.push(uglify);
}*/

function buildJs(appEntryFile, file = null, destFile = null) {
  return new Promise((res, reject) => {
    if (file === null) {
      file = ASSETS_FOLDER_JS + '/' + appEntryFile + '.js';
    }
    if (destFile === null) {
      destFile = PUBLIC_BUILD_FOLDER + '/' + appEntryFile + '.js';
    }
    console.log(colors.yellow('Bundling JS file: ' + file));
    rollup.rollup({
      dest: destFile,
      entry: file,
      format: 'iife',
      //treeshake: false,
      plugins: plugins,
      sourceMap: true
    }).then(function(bundle) {
      // write bundle to a file and use the IIFE format so it executes immediately
      return bundle.write({
        format: 'cjs',
        dest: destFile
      });
    }).then(function() {
      if (isProduction) {
        const res = uglify.minify(destFile, {
          compress: {
            drop_console: true
          }
        });
        fs.writeFile(destFile, res.code, 'utf-8');
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
