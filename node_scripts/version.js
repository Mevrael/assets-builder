
const fs = require('fs');
const path = require('path');
const Config = require('./config');
const Core = require('./core');

const Version = {

  _manifestPath: Config.versionManifestPath,
  _buildPath: Config.buildPath,

  /**
   * Generates a versioned file and updates or creates manifest file
   * @param {String|Array} file
   * @returns {Version}
   */
  add(file) {
    const timeStarted = Date.now();

    console.log(Core.colors.yellow('  Generating versioned files...'));
    let data = '';
    try {
      data = fs.readFileSync(this._manifestPath, 'utf8');
      data = JSON.parse(data);
    } catch (e) {
      // Manifest file doesn't exists
      data = {};
    }
    if (Array.isArray(file)) {
      file.forEach(f => {
        data[f] = this._processFile(data, f);
      });
    } else {
      data[file] = this._processFile(data, file);
    }

    const json = JSON.stringify(data);

    fs.writeFileSync(this._manifestPath, json);
    console.log(Core.colors.green(`    Manifest file "${this._manifestPath}" updated.`));
    console.log('  Finished Version in ' + (Date.now() - timeStarted) + 'ms');

    return this;
  },

  _processFile(data, file) {
    this._checkAndDeleteOldVersionedFile(data, file);
    const versionedFileName = this._generateVersionedFileName(file);
    this._copyAndRenameFile(file, versionedFileName);
    console.log(Core.colors.green(`    File "${this._buildPath + '/' + file}" versioned and saved in "${this._buildPath + '/' + versionedFileName}".`));
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

  _checkAndDeleteOldVersionedFile(data, file) {
    if (data[file] !== undefined) {
      try {
        const path = this._buildPath + '/' + data[file];
        fs.unlinkSync(path);
        console.log(Core.colors.green(`    Old versioned file "${path}" removed.`));
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

Version.add(['app.js', 'app.css']);

module.exports = Version;
