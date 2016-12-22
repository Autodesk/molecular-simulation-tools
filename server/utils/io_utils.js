const fs = require('fs');
const hash = require('object-hash');

const ioUtils = {
  /**
   * Given a file path, move it to public/structures and rename it to its hash
   */
  makeOutputPublic(source, targetDir) {
    return new Promise((resolve, reject) => {
      fs.readFile(source, (err, data) => {
        if (err) {
          return reject(err);
        }

        const hashed = hash(data);
        const targetPath = `${targetDir}/${hashed}.pdb`;

        return fs.writeFile(targetPath, data, (errWrite) => {
          if (errWrite) {
            return reject(errWrite);
          }

          return resolve(targetPath);
        });
      });
    });
  },

  readJsonFile(source) {
    return new Promise((resolve, reject) => {
      fs.readFile(source, 'utf8', (err, contents) => {
        if (err) {
          return reject(err);
        }

        return resolve(JSON.parse(contents));
      });
    });
  },
};

module.exports = ioUtils;
