const pug = require('pug');
const sendgridFactory = require('sendgrid');
const sendgridHelper = require('sendgrid').mail;

const FROM_EMAIL = 'no-reply@autodesk.com';

const sendgrid = sendgridFactory(process.env.SEND_GRID_API_KEY);

const emailUtils = {
  send(emailAddress, subject, template, data) {
    return new Promise((resolve, reject) => {
      const html = pug.renderFile(template, data);
      const email = new sendgridHelper.Mail(
        new sendgridHelper.Email(FROM_EMAIL),
        subject,
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
  },
};

module.exports = emailUtils;
