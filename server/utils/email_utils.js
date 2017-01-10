const sendgridFactory = require('sendgrid');
const sendgridHelper = require('sendgrid').mail;

const sendgrid = sendgridFactory(process.env.SEND_GRID_API_KEY);

function sendThanks(emailAddress) {
  return new Promise((resolve, reject) => {
    const content = new sendgridHelper.Content(
      'text/html', '<html><head></head><body><h1>Hi</h1></body></html>'
    );
    const email = new sendgridHelper.Mail(
      new sendgridHelper.Email('no-reply@autodesk.com'),
      'Your Workflow is Running',
      new sendgridHelper.Email(emailAddress),
      content
    );

    const request = sendgrid.emptyRequest({
      method: 'POST',
      path: '/v3/mail/send',
      body: email.toJSON(),
    });
    sendgrid.API(request, (err, response) => {
      if (err) {
        return reject(err);
      }

      return resolve(response.body);
    });
  });
}

function sendEnded() {
  return Promise.rejected();
}

module.exports = {
  sendThanks,
  sendEnded,
};
