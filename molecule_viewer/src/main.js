const THREE = require('three');

window.THREE = THREE;

require('webvr-polyfill');
require('./vendor/wgs');
require('./vendor/firefly');
require('./vendor/nanocore');
require('./vendor/molview');

export default window.Autodesk.$ADSKMOLVIEW;
