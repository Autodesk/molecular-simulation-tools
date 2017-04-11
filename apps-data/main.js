const IMap = require('immutable').Map;
const appVde = require('./apps/vde');
const appRefineProtein = require('./apps/refine_protein');
const appPredictColor = require('./apps/predict_color');
const appSolvationFreeEnergy = require('./apps/solvation_free_energy');

const appsArray = [
  appVde,
  appRefineProtein,
  appPredictColor,
  appSolvationFreeEnergy,
];

// Convert apps array to a map
let apps = new IMap();
appsArray.forEach((app, index) => {
  // Assign a unique id to each app
  const appWithId = Object.assign({}, app, { id: index.toString() });
  apps = apps.set(appWithId.id, appWithId);
});

module.exports = apps;
