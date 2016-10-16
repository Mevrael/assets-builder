
const core = require('./node_scripts/core');
const Config = require('./node_scripts/config');

function main() {
  "use strict";
  if (core.args.length === 0) {
    console.log(`
  ${core.colors.yellow(('Bunny Builder 1.0'))}
  
  Current configuration:`);

    for (let key in Config) {
      console.log(`    ${core.colors.cyan(key)}: ${Config[key]}`)
    }


    console.log(`
  Commands:
    ${core.colors.cyan('node build js <file="app.js">')} - Bundle JS with Rollup and Babel
    ${core.colors.cyan('node build css <file="app.css">')} - Bundle CSS with PostCSS and CSSNext
    ${core.colors.cyan('node build version <file1> <file2> ...')} - Version file by adding random hash in it's name and update manifest file
    ${core.colors.cyan('node build all')} - Bundle JS and CSS
    ${core.colors.cyan('node build svg')} - Create an SVG sprite
    ${core.colors.cyan('node build docs')} - Generate Project documentation from .md files
    ${core.colors.cyan('node build images')} - Compress images
    
  Params:
    ${core.colors.cyan('-p')} - execute JS or CSS command in Production mode to minify assets
`)
  }

  if (core.args[0] === 'js') {
    const buildJs = require('./node_scripts/js');
    const file = core.args[1] || 'app';
    buildJs(file);
  } else if (core.args[0] === 'css') {
    const buildCss = require('./node_scripts/css');
    const file = core.args[1] || 'app';
    buildCss(file);
  } else if (core.args[0] === 'all') {
    const buildCss = require('./node_scripts/css');
    const buildJs = require('./node_scripts/js');
    const file = core.args[1] || 'app';
    buildJs(file).then(() => {
      console.log();
      buildCss(file);
    });
  }
}

main();

module.exports = main;
