
const BaseConfig = require('./config');

module.exports = Object.assign({}, BaseConfig, {

  srcPath: 'test_scripts',
  buildPath: 'test_scripts/build',

  srcPathJs: 'test_scripts',
  buildPathJs: 'test_scripts/build',

  srcPathCss: 'test_scripts',
  buildPathCss: 'test_scripts/build',

  versionManifestPath: 'test_scripts/build/rev-manifest.json',

});
