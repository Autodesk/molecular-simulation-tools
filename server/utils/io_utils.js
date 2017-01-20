const PassThrough = require('stream').PassThrough;
const appRoot = require('app-root-path');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

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
      readableStream.on('error', reject);

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
    const pass = new PassThrough();
    readableStream.pipe(pass);

    return ioUtils.hashStream(readableStream).then((hashed) => {
      const filename = `${hashed}.pdb`;
      const saveTo = path.join(appRoot.toString(), targetDir, filename);

      return new Promise((resolve, reject) => {
        fs.exists(saveTo, (exists) => {
          if (!exists) {
            const writeableStream = fs.createWriteStream(saveTo);
            writeableStream.on('finish', () => resolve(filename));
            writeableStream.on('error', reject);
            return pass.pipe(writeableStream);
          }

          return resolve(filename);
        });
      });
    });
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
};

module.exports = ioUtils;
