
const fs = require('fs');

const colors = require('colors/safe');

const Config = require('./config');
const CSS = require('./css');
const JS = require('./js');
const Version = require('./version');

const CLI = {

  Config,

  _cmds: {},

  init() {
    for (let prop in this) {
      if (prop.indexOf('init') === 0 && prop !== 'init') {
        this[prop]();
      }
    }
  },

  initJs() {
    this.registerCmd('js', 'Bundle JS with Rollup and Babel', ['<file>'], JS);
  },

  initCss() {
    this.registerCmd('css', 'Bundle CSS with PostCSS and CSSNext', ['<file>'], CSS);
  },

  initVersion() {
    this.registerCmd('version', 'Version file by adding random hash in it\'s name and update manifest file', [
      '<file1>', '<file2>', '...',
    ], Version);
  },

  initAll() {
    this.registerAllCmd('all', 'Bundle JS, CSS and run Version', [], this.Config.allCmds);
  },

  // initSvg() {
  //   this.registerCmd('svg', 'Generate SVG sprite from directory of SVG files');
  // },

  // initDocs() {
  //   this.registerCmd('docs', 'Generate Project documentation from .md files');
  // },

  // initImages() {
  //   this.registerCmd('images', 'Compress images');
  // },

  error(msg) {
    console.error(colors.red('  ' + msg));
    process.exit(0);
  },

  run(params = this.getArgs()) {
    return new Promise((resolve, reject) => {
      if (params.length === 0) {
        this.displayHelp();
        resolve();
      } else {
        const cmdName = params[0];
        const v = this.testCmdAndDisplayError(cmdName);
        if (v) {
          const timeStarted = Date.now();
          const cmd = this._cmds[cmdName].cmd;
          let cmdRes = null;

          const printFinishedTime = () => {
            console.log(colors.yellow('  Finished ' + colors.magenta(cmdName) + ' in ' + (Date.now() - timeStarted) + 'ms\n'));
          };

          console.log(colors.yellow('  Running ' + colors.magenta(cmdName) + '...'));
          if (typeof cmd === 'function') {
            cmdRes = cmd(this.getCmdArgs(params), this.isProduction(), this.Config);
          } else {
            cmdRes = cmd['run'](this.getCmdArgs(params), this.isProduction(), this.Config);
          }
          if (cmdRes instanceof Promise) {
            cmdRes.then(() => {
              printFinishedTime();
              resolve();
            }).catch(e => {
              console.error(colors.red(`    Error: ${e.message}`));
              reject();
              process.exit();
            });
          } else {
            printFinishedTime();
            resolve();
          }
        } else {
          resolve();
        }
      }
    });
  },

  runAll(allCmds) {
    const cmds = [];
    allCmds.forEach(argStr => {
      const args = argStr.split(' ');
      cmds.push(this.run.bind(this, args));
    });
    return cmds.reduce((p, fn) => p.then(fn), Promise.resolve());
  },

  getArgs() {
    const args = Array.from(process.argv);
    return args.splice(process.execArgv.length + 2);
  },

  getCmdArgs(params) {
    const args = params.splice(1);
    const newArgs = [];
    args.forEach(arg => {
      if (!this.isArgProduction(arg)) {
        newArgs.push(arg);
      }
    });
    return newArgs;
  },

  isProduction() {
    const args = this.getArgs();
    let isProduction = false;
    args.forEach(arg => {
      if (this.isArgProduction(arg)) {
        isProduction = true;
      }
    });
    return isProduction;
  },

  getBuilderVersion() {
    return JSON.parse(fs.readFileSync('package.json')).version;
  },

  isArgProduction(arg) {
    return arg === '-p' || arg === '-P' || arg === '--production';
  },

  displayHelp() {
    let stdout = '';
    stdout += colors.yellow(('Bunny Builder ' + this.getBuilderVersion())) + "\n";
    stdout += "\n";
    stdout += 'Commands:\n';
    stdout += ("\n");
    for (let cmd in this._cmds) {
      stdout += colors.yellow(`  node build ${this._cmds[cmd].name}`);
      this._cmds[cmd].params.forEach(param => {
        stdout += colors.magenta(' ' + param);
      });
      stdout += ' - ' + this._cmds[cmd].description + "\n";
    }

    stdout += '\n';
    stdout += 'Global arguments:\n';
    stdout += '\n';
    stdout += colors.cyan('  -p');
    stdout += ' - execute JS or CSS command in Production mode to minify assets';
    stdout += '\n';

    console.info(stdout);
  },

  testCmdAndDisplayError(cmd) {
    if (this._cmds[cmd] === undefined) {
      console.error(colors.red('  Command "'+ cmd +'" not registered'));
      return false;
    }
    return true;
  },

  /**
   * Register new CLI command
   *
   * @param {String} name
   * @param {String} description
   * @param {Array} params = []
   * @param {Object|Function} cmd - function to be called, Function - callback, Object - import
   * imported object must have run(args = [], isProduction) method
   */
  registerCmd(name, description, params = [], cmd) {
    if (cmd === undefined || (typeof cmd !== 'function' && cmd.run === undefined)) {
      this.error('Invalid cmd param in registerCmd('+name+') - must be a valid function or an object with run() method');
    } else {
      this._cmds[name] = {
        name,
        description,
        params,
        cmd,
      };
    }
  },

  registerAllCmd(name, description, params = [], allCmds) {
    this.registerCmd(name, description, params, () => {
      return this.runAll(allCmds);
    });
  }

};

module.exports = CLI;
