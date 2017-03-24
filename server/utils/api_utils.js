const google = require('googleapis');
const googleApiKey = require('../google_api_key.json');
const log = require('./log');

const apiUtils = {
  fetchViews() {
    return new Promise((resolve, reject) => {
      const jwtClient = new google.auth.JWT(
        googleApiKey.client_email, null, googleApiKey.private_key,
        ['https://www.googleapis.com/auth/analytics.readonly'], null
      );

      jwtClient.authorize((err) => {
        if (err) {
          return reject(err);
        }
        const analytics = google.analytics('v3');
        return apiUtils.queryData(analytics, jwtClient);
      });
    });
  },

  queryData(analytics, jwtClient) {
    return new Promise((resolve, reject) => {
      analytics.data.ga.get({
        auth: jwtClient,
        ids: process.env.GA_VIEW_ID,
        metrics: 'ga:uniquePageviews',
        dimensions: 'ga:pagePath',
        'start-date': '30daysAgo',
        'end-date': 'yesterday',
        sort: '-ga:uniquePageviews',
        'max-results': 10,
        filters: 'ga:pagePath=~/ch_[-a-z0-9]+[.]html$',
      }, (err, response) => {
        if (err) {
          return reject(err);
        }
        log.debug({ queryDataResponse: response });
        return resolve(JSON.stringify(response));
      });
    });
  },
};

module.exports = apiUtils;
