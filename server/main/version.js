/**
 * /version routes
 * Used by deployment and loadbalancing
 */
const express = require('express');
const fs = require('fs');
const log = require('../utils/log');
const EOL = require('os').EOL;

const router = express.Router();

// Path to package.json and VERSION files are same - at root of this node application.
// Use the same logic to find both files.
// In a typcial container, this usually means '/app/server'
const packageJSON = JSON.parse(fs.readFileSync('package.json', { encoding: 'utf8' }));
const versionFilePath = 'VERSION';

function getVersion() {
  let version = packageJSON.version;
  try {
    if (!fs.existsSync(versionFilePath)) {
      log.warn(`VERSION file not found: ${versionFilePath} (cwd=${process.cwd()})`);
      return version;
    }

    version = fs.readFileSync(versionFilePath, {
      encoding: 'utf8',
    });
    if (version && (version !== '')) {
      version = version.replace(EOL, '');
    }
  } catch (e) {
    if (e.code && e.code === 'ENOENT') {
      // do nothing
    } else {
      log.error('unexpected error loading version from', versionFilePath);
      log.error({ error: e });
    }
  }

  return version;
}

const VERSION = getVersion();

router.get('/', (req, res) => {
  res.statusCode = 200;
  res.send(VERSION);
  return res.end();
});

module.exports = router;
