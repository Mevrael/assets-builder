
const fs = require('fs');
const path = require('path');

const colors = require('colors/safe');

const Version = {
  _manifestPath: '',
  _buildPath: '',

  /**
   * Generates a versioned file and updates or creates manifest file
   * @param {String|Array} file
   * @returns {Version}
   */
  run(args, isProduction, Config) {
    this._manifestPath = Config.versionManifestPath;
    this._buildPath = Config.buildPath;

    if (args.length === 0) {
      args = ['app.css', 'app.js'];
    }

    this._checkOriginalFileExists(args);

    let data = '';
    try {
      data = fs.readFileSync(this._manifestPath, 'utf8');
      data = JSON.parse(data);
    } catch (e) {
      // Manifest file doesn't exists
      data = {};
    }



    args.forEach(file => {
      data[file] = this._processFile(data, file);
    });

    const json = JSON.stringify(data);

    fs.writeFileSync(this._manifestPath, json);
    console.log(colors.green(`    Manifest file "${this._manifestPath}" updated.`));
  },

  _processFile(data, file) {
    this._checkAndDeleteOldVersionedFile(data, file);
    const versionedFileName = this._generateVersionedFileName(file);
    this._copyAndRenameFile(file, versionedFileName);
    console.log(colors.green(`    File "${this._buildPath + '/' + file}" versioned and saved in "${this._buildPath + '/' + versionedFileName}".`));
    return versionedFileName;
  },

  _copyAndRenameFile(file, newFileName) {
    const originalPath = this._buildPath + '/' + file;
    const newPath = this._buildPath + '/' + newFileName;
    fs.createReadStream(originalPath).pipe(fs.createWriteStream(newPath));
  },

  _parseFileName(file) {
    const fileInfo = path.parse(file);
    return {
      name: fileInfo.name,
      ext: fileInfo.ext
    };
  },

  _checkOriginalFileExists(files) {
    let err = false;
    files.forEach(file => {
      const originalFile = this._buildPath + '/' + file;
      if (!fs.existsSync(originalFile)) {
        console.error(colors.red('    Version: file "'+originalFile+'" not found!'));
        err = true;
      }
    });
    if (err) {
      process.exit();
    }
  },

  _checkAndDeleteOldVersionedFile(data, file) {
    if (data[file] !== undefined) {
      try {
        const path = this._buildPath + '/' + data[file];
        fs.unlinkSync(path);
        console.log(colors.green(`    Old versioned file "${path}" removed.`));
      } catch (e) {

      }
    }
  },

  _generateVersionedFileName(file) {
    const hash = this._generateHash();
    const fileInfo = this._parseFileName(file);
    return fileInfo.name + '-' + hash + fileInfo.ext;
  },

  _generateHash() {
    return Math.random().toString(36).substr(2, 9);
  },

  clear() {
    try {
      fs.unlinkSync(this._manifestPath);
    } catch (e) {

    }

    return this;
  }

};

module.exports = Version;
