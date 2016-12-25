
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
