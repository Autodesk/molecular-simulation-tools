const request = require('request-promise');

const testTools = {

  startSession() {
    const options = {
      method: 'post',
      body: {
        email: 'a@b.com'
      },
      json: true,
      url: `http://localhost:${process.env.PORT}/v1/session/start/0`
    };
    return request(options);
  },

};

module.exports = testTools;
