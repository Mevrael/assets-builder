# Bunny Assets Builder 0.1.6 (Alpha)

[Website](https://bunnyjs.com) [![NPM downloads/month](http://img.shields.io/npm/dm/assets-builder.svg?style=flat-square)](https://www.npmjs.org/package/assets-builder) [![NPM version](http://img.shields.io/npm/v/assets-builder.svg?style=flat-square)](https://www.npmjs.org/package/assets-builder)

#### Node scripts and custom CLI made easy

**Forget about huge Webpack configs and many dependencies. Just run `node build all -p` to build your production project.**

![Image: Bunny Assets Builder help example](https://cloud.githubusercontent.com/assets/7879528/21471736/be9fc9e2-cac4-11e6-914e-875d71e4791f.png)

![Image: CSS command example](https://cloud.githubusercontent.com/assets/7879528/21471737/bea09a02-cac4-11e6-9deb-309ce7867e3a.png)

### Why Bunny Assets Builder?

* Only one dependency instead of many;
* Just install and it works;
* Easily extendable and configurable;
* Many times faster then Gulp or Webpack;
* No learning curve;
* Use the flexibility of Node.js scripts instead of Gulp/Webpack;
* Write own Node CLI;
* Can be used in Laravel projects replacing laravel elixir.
* Use ES6/ES7, Future CSS today without installing and configuring a lot of complicated tools!

**Assets Builder is an Object-Oriented JavaScript API** allowing writing custom Node.js scripts and own CLI easily. To add new cmd just do:
```javascript
CLI.registerCmd('hello', 'Say hello', [], () => {
  console.log('Hello, world!');
})
```
and you may use now new command by running `node build hello`;

By defaults Assets Builder allows building modern web projects out of the box:
- Transpile ES6 to ES5 using Babel and Rollup;
- Transpile Future CSS (CSS4) with PostCSS and CSSNext;
- Compress, minify assets for production by adding `-p` flag;

### Coming soon:
- Many projects don't have documentation because there are no easy way to add it to existing projects. With Bunny Assets Builder you will be able to generate projects docs from .md files with GitHub syntax highlighting.
- SVG today is a general practice used in any application. Building SVG sprite is a painful work, soon it will be changed;

## Installation

1. `npm install assets-builder --save`;
2. Create file in the project root - `build.js`;
3. Import assets-builder, init and run it. You may add custom commands between init() and run().
```javascript

const CLI = require('assets-builder');

CLI.init();

CLI.run();

```

## Configuration

**By default Bunny Assets Builder uses Laravel PHP framework's folder structure** and is compatible with manifest/elixir function. It can be used instead of laravel elixir.

```javascript
module.exports = {

  srcPath: 'resources/assets',
  buildPath: 'public/build',

  srcPathJs: 'resources/assets/js',
  buildPathJs: 'public/build',

  srcPathCss: 'resources/assets/css',
  buildPathCss: 'public/build',

  versionManifestPath: 'public/build/rev-manifest.json',

  allCmds: [
    'css',
    'js',
    'version app.css app.js',
  ],

};
```

**Version Manifest file** is a JSON file generated with `node build version` which can be used by an application to get versioned file path (with random hash added at the end). For example, in Laravel having this rev-manifest.json: `{"app.js":"app-quovy03k4.js","app.css":"app-lobywqy2g.css"}` calling `elixir('app.js')` from view would return `app-quovy03k4.js`.

**allCmds** is an array of commands which should be executed in defined order using `node build all` or `node build all -p`.

### Extending and injecting custom Config

1. Create folder for Node scripts, for example, `node_scripts`;
2. Create `Config.js`
3. Import original Config, change it and export new one:
```javascript
const BaseConfig = require('assets-builder/node_scripts/config');

module.exports = Object.assign({}, BaseConfig, {

  srcPath: 'test_scripts',
  buildPath: 'test_scripts/build',

  srcPathJs: 'test_scripts',
  buildPathJs: 'test_scripts/build',

  srcPathCss: 'test_scripts',
  buildPathCss: 'test_scripts/build',

  versionManifestPath: 'test_scripts/build/rev-manifest.json',

});
```

Now in main `build.js` replace config:
```javascript
const CLI = require('assets-builder');
const ProjectConfig = require('./node_scripts/config'); // add this

CLI.Config = ProjectConfig; // add this

CLI.init();

CLI.run();
```

## Usage

Type `node build` to view the list of available commands.

List of global flags can be used in any command:
- `-p` - will execute a command in Production mode, for example, to minify JS and CSS, and to remove comments.

List of default commands:

![Image: Bunny Assets Builder help example](https://cloud.githubusercontent.com/assets/7879528/21471736/be9fc9e2-cac4-11e6-914e-875d71e4791f.png)

If no argument specified JS will use `app`, CSS will use `app` and Version will use `app.js app.css`.

`node build css index -p` - will, for example, bundle index.css file in the `CLI.Config.srcPathCss` and save it to `CLI.Config.buildPathCss/index.css`.

Version command will copy files from `Config.CLI.buildPath` directory.

## Custom commands

To create simple custom command use `CLI.registerCmd(name, description, [params in description], callback)`

callback will be called with params: (args, isProduction, Config) when command executed in Terminal.

In `build.js` register new cmd after `init()` and before `run()`:
```javascript
const CLI = require('assets-builder');

CLI.init();

CLI.registerCmd('hi', 'My first command', [], (args, isProduction, Config) => {
   console.log('My 1st cmd :)');
});

CLI.run();
```

## Custom "all" command (Sequence of commands)

```javascript
CLI.registerAllCmd('css-admin', 'Bundle and version admin CSS', [], [
  'css admin',
  'version admin.css'
]);
```

## Custom Node scripts

For more complicated commands it is recommended to write Node scripts and store them in a single directory, for example, `node_scripts`.

Last argument in `CLI.registerCmd()` may accept also an object which has `run()` method which will accept same 3 arguments as callback.

For example, let's create a simple node script:
```javascript
// node_scripts/hello.js

const colors = require('colors/safe');

const Hello = {
  srcPath: '',
  buildPath: '',
  isProduction: false,

  run(args, isProduction, Config) {
    this.srcPath = Config.srcPathJs;
    this.buildPath = Config.buildPathJs;
    this.isProduction = isProduction;

    const name = args.length === 0 ? 'Mev-Rael' : args[0];

    return this.sayHello(name);
  },

  sayHello(name) {
    console.log(colors.green(`Hello, ${name}`);
  }
};
```

and register our new script in `build.js`:

```javascript
// build.js

const CLI = require('./node_scripts/cli');
const Hello = require('./node_scripts/hello');

CLI.init();

CLI.registerCmd('hello', 'Say hello', ['<name>'], Hello);

CLI.run();

```

Now `node build hello` will print `Hello, Mev-Rael` or `node build hello John` will print `Hello, John`.

Node scripts are much more flexible then any Gulp or Webpack plugins. Storing each script in separate file will make your build process maintanable and enjoyable.
