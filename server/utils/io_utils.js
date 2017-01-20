const PassThrough = require('stream').PassThrough;
const appRoot = require('app-root-path');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const shortid = require('shortid');

const ioUtils = {
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

  /**
   * Hash the contents of the given stream
   * @param readableStream {Stream}
   * @returns {Promise}
   */
  hashStream(readableStream) {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha1');
      hash.setEncoding('hex');

      readableStream.on('end', () => {
        hash.end();
        resolve(hash.read());
      });
      readableStream.on('error', (err) => {
        reject(err);
      });

      readableStream.pipe(hash);
    });
  },

  /**
   * Synchronously hash a simple string
   * @param string {String}
   * @returns {String}
   */
  hashString(string) {
    return crypto.createHash('sha1').update(string).digest('hex');
  },

  /**
   * Given a readable stream, hash its contents and write it to the given
   * directory with its hash as its name
   * @param readableStream {Stream}
   * @param targetDir {String}
   * @returns {Promise}j
   */
  streamToHashFile(readableStream, targetDir) {
    // Write the input to a temp file
    return new Promise((resolve, reject) => {
      const filename = `tmp_${shortid.generate()}.pdb`;
      const saveTo = path.join(appRoot.toString(), 'public/tmp', filename);
      const writeableStream = fs.createWriteStream(saveTo);

      writeableStream.on('finish', (err) => {
        if (err) {
          return reject(err);
        }

        return resolve(saveTo);
      });

      readableStream.pipe(writeableStream);
    }).then(tempFilepath =>
      // Hash the temp file
      ioUtils.hashStream(fs.createReadStream(tempFilepath)).then((hashed) => {
        const filename = `${hashed}.pdb`;
        const saveTo = path.join(appRoot.toString(), targetDir, filename);

        // Save to the final filepath if needed, with the hash as the filename
        // And delete the temp file
        return new Promise((resolve, reject) => {
          fs.exists(saveTo, (exists) => {
            if (!exists) {
              const writeableStream = fs.createWriteStream(saveTo);
              writeableStream.on('finish', () => {
                ioUtils.deleteFile(tempFilepath).then(() =>
                  resolve(filename)
                ).catch(reject);
              });
              writeableStream.on('error', reject);
              return fs.createReadStream(tempFilepath).pipe(writeableStream);
            }

            return ioUtils.deleteFile(tempFilepath).then(() =>
              resolve(filename)
            ).catch(reject);
          });
        });
      })
    );
  },

  /**
   * Given a string of file contents, write the string to a file whose name is
   * a hash of its contents
   * @param string {String}
   * @param targetDir {String}
   * @returns {Promise}j
   */
  stringToHashFile(string, targetDir) {
    const hashed = ioUtils.hashString(string);
    const filename = `${hashed}.pdb`;
    const saveTo = path.join(appRoot.toString(), targetDir, filename);

    return new Promise((resolve, reject) => {
      fs.exists(saveTo, (exists) => {
        if (!exists) {
          return fs.writeFile(saveTo, string, (err) => {
            if (err) {
              return reject(err);
            }

            return resolve(filename);
          });
        }

        return resolve(filename);
      });
    });
  },

  /**
   * Delete the indicated file
   * @param filepath {String}
   * @returns {Promise} resolves with {String}
   */
  deleteFile(filepath) {
    return new Promise((resolve, reject) => {
      fs.unlink(filepath, (err) => {
        if (err) {
          return reject(err);
        }

        return resolve(filepath);
      });
    });
  },
};

module.exports = ioUtils;
