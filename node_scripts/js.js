
const fs = require('fs');
const path = require('path');
const readLine = require('readline');
const stream = require('stream');

const colors = require('colors/safe');

const rollup = require('rollup');
const babel = require('rollup-plugin-babel');
const resolve = require('rollup-plugin-node-resolve');
// const eslint = require('rollup-plugin-eslint');
const uglify = require('uglify-js');

const plugins = [
  // eslint(),

  babel({
    babelrc: false,
    externalHelpers: true,
    // exclude: 'node_modules/!**',
    presets: [
      [
        'es2015',
        {
          modules: false,
        },
      ],
      'stage-0',
    ],
    plugins: ['external-helpers'],
  }),

  resolve({
    browser: true,
    main: true,
  }),
];

const JS = {
  srcPath: '',
  buildPath: '',
  isProduction: false,
  plugins: plugins,

  run(args, isProduction, Config) {
    this.srcPath = Config.srcPathJs;
    this.buildPath = Config.buildPathJs;
    this.isProduction = isProduction;

    const entryFile = args.length === 0 ? 'app' : args[0];

    return this.makeFile(entryFile);
  },

  removeLines(file) {
    return new Promise((resolve) => {

      const instream = fs.createReadStream(file);
      const outstream = new stream();
      const rl = readLine.createInterface(instream, outstream);

      const lines = [];

      rl.on('line', (line) => {
        if (line.indexOf('import') !== 0 && line.indexOf('export') !== 0) {
          lines.push(line);
        }
      });

      rl.on('close', () => {
        const str = fs.createWriteStream(file);
        lines.forEach((line) => {
          str.write(`${line}\n`);
        });
        str.end();
        str.on('close', () => {
          resolve();
        });
      });
    });
  },

  makeFile(appEntryFile, file = null, destFile = null, excludeFiles = []) {
    return new Promise((res, reject) => {
      if (file === null) {
        file = `${this.srcPath}/${appEntryFile}.js`;
      }
      if (destFile === null) {
        destFile = `${this.buildPath}/${appEntryFile}.js`;
      }

      const external = excludeFiles.map(item => path.resolve(item));

      console.log(colors.yellow(`    Bundling JS file: ${file}`));
      rollup.rollup({
        dest: destFile,
        entry: file,
        external,
        treeshake: false,
        plugins: this.plugins,
        sourceMap: true,
      }).then((bundle) => {
        const rollupDone = bundle.generate();
        fs.writeFileSync(destFile, rollupDone.code);

        return this.removeLines(destFile);
      }).then(() => {
        if (this.isProduction) {
          const minified = uglify.minify(destFile, {
            compress: {
              drop_console: true,
            },
          });
          fs.writeFile(destFile, minified.code, 'utf-8', (err) => {
            if (err) {
              reject(err);
            } else {
              console.log(colors.green(`    Minified JS Bundle created: ${destFile}`));
              res();
            }
          });
        } else {
          console.log(colors.green(`    JS Bundle created: ${destFile}`));
          res();
        }
      }).catch((e) => {
        reject(e);
      });
    });
  },

};

module.exports = JS;
