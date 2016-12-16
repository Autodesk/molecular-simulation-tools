"use strict";
/****************************************
 * /version routes
 * Used by deployment and loadbalancing
 ****************************************/
var express = require('express');
var router  = express.Router();
var fs      = require('fs');

var packageJSON = require('./package.json');
var versionFilePath = __dirname + "../VERSION";

var newLine = /\n/g;

function getVersion() {
  var version = packageJSON.version;
  try {
    version = fs.readFileSync(versionFilePath, {
      encoding: 'utf8',
    });
    if (version && (version !== '')) {
      version = version.replace(newLine, '');
    }
  } catch (e) {
    if (e.code && e.code === 'ENOENT') {
      // do nothing
    } else {
      console.log("unexpected error loading version from", versionFilePath);
      console.log(e);
    }
  }

  return version;
}

var VERSION = getVersion();

function version(req, res) {
  res.statusCode = 200;
  res.send(VERSION);
  return res.end();
}

router.get('/version', version);
module.exports = router;

