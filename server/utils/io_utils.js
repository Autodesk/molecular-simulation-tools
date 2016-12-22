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

        return fs.writeFile(targetPath, (errWrite) => {
          if (errWrite) {
            return reject(errWrite);
          }

          return resolve(targetPath);
        });
      });
    });
  },

  copyFile(source, target) {
    return new Promise((resolve, reject) => {
      const rd = fs.createReadStream(source);
      rd.on('error', reject);

      const wr = fs.createWriteStream(target);
      wr.on('error', reject);
      wr.on('close', resolve);
      rd.pipe(wr);
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
