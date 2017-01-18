const THREE = require('three');

window.THREE = THREE;

require('webvr-polyfill');

const WGS = require('./vendor/wgs');

window.WGS = WGS;

require('./vendor/firefly');
require('./vendor/nanocore');
require('./vendor/molview');

export default window.Autodesk.$ADSKMOLVIEW;
