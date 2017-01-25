"use strict";
/****************************************
 * /version routes
 * Used by deployment and loadbalancing
 ****************************************/
var express = require('express');
var router  = express.Router();
var fs      = require('fs');

console.log("cwd=" + process.cwd());
console.log("__dirname=" + __dirname);
var packageJSON = require('./package.json');
// Unless explicitly changed, process.cwd() is the directory containing package.json
// Path to VERSION file at root of this node application. Same location as package.json 
// In a typcial container, this usually means '/app/server' but your mileage may vary
var versionFilePath = './VERSION';

var newLine = /\n/g;

function getVersion() {
  var version = packageJSON.version;
  try {
    if(!fs.existsSync(versionFilePath)) {
      console.log("VERSION file not found: " + versionFilePath + " (cwd=" + process.cwd() + ")");
      return version;
    }

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

router.get('/', version);
module.exports = router;

