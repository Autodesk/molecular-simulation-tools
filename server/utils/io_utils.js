const PassThrough = require('stream').PassThrough;
const appRoot = require('app-root-path');
const crypto = require('crypto');
const fs = require('fs-extended');
const path = require('path');
const shortId = require('shortid');


/**
 * Hash the contents of the given stream
 * @param readableStream {Stream}
 * @returns {Promise}
 */
function hashFile(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha1');
    hash.setEncoding('hex');
    const readableStream = fs.createReadStream(filePath);
    readableStream.on('end', () => {
      hash.end();
      resolve(hash.read());
    });
    readableStream.on('error', reject);
    readableStream.pipe(hash);
  });
}

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
   * Given a readable stream, hash its contents and write it to the given
   * directory with its hash as its name
   * @param readableStream {Stream}
   * @param targetDir {String}
   */
  streamToHashFile(readableStream, targetDir) {
    const tempFileName = `/tmp/${shortId.generate()}`;
    log.trace({f:'streamToHashFile', targetDir:targetDir, tempFileName:tempFileName});
    return new Promise((resolve, reject) => {
      const writeableStream = fs.createWriteStream(tempFileName);
      writeableStream.on('error', reject);
      writeableStream.on('finish', () => {
        log.trace({f:'streamToHashFile', event:'finish'});
        //Now that the file is written, get the hash, and mv the file
        //path that is created from the file hash
        resolve(tempFileName);
      });
      writeableStream.on('end', () => {
        log.trace({f:'streamToHashFile', event:'end'});
      });
      readableStream.pipe(writeableStream);
    })
    .then(filename => {
      return hashFile(filename);
    })
    .then(hashValue => {
      //Now move the temp file to the hash name
      const fileName = `${hashValue}.pdb`;
      const saveTo = path.join(appRoot.toString(), targetDir, `${fileName}`);
      fs.ensureDirSync(path.dirname(saveTo));
      fs.moveFileSync(tempFileName, saveTo);
      return fileName;
    });
  }
};

module.exports = ioUtils;
