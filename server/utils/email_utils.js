const pug = require('pug');
const sendgridFactory = require('sendgrid');
const sendgridHelper = require('sendgrid').mail;

const sendgrid = sendgridFactory(process.env.SEND_GRID_API_KEY);

function sendThanks(emailAddress, runLink) {
  return new Promise((resolve, reject) => {
    const html = pug.renderFile('./views/email_thanks.pug', {
      runLink,
    });
    const email = new sendgridHelper.Mail(
      new sendgridHelper.Email('no-reply@autodesk.com'),
      'Your Workflow is Running',
      new sendgridHelper.Email(emailAddress),
      new sendgridHelper.Content('text/html', html)
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
