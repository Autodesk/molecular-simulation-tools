const fs = require('fs');
const mustache = require('mustache');
const sendgridFactory = require('sendgrid');
const sendgridHelper = require('sendgrid').mail;
const log = require('../utils/log');

const FROM_EMAIL = 'no-reply@autodesk.com';

const sendgrid = sendgridFactory(process.env.SEND_GRID_API_KEY);

const emailUtils = {
  send(emailAddress, subject, templatePath, data) {
    return emailUtils.loadTemplate(templatePath)
      .then((templateString) => {
        const dataWithUrl = Object.assign({}, data, {
          assetsUrl: `${process.env.URL}/assets`,
        });
        const templateHtml = mustache.render(templateString, dataWithUrl);
        const email = new sendgridHelper.Mail(
          new sendgridHelper.Email(FROM_EMAIL),
          subject,
          new sendgridHelper.Email(emailAddress),
          new sendgridHelper.Content('text/html', templateHtml)
        );

        const request = sendgrid.emptyRequest({
          method: 'POST',
          path: '/v3/mail/send',
          body: email.toJSON(),
        });
        return new Promise((resolve, reject) => {
          sendgrid.API(request, (err, response) => {
            if (err) {
              return reject(err);
            }
            return resolve(response.body);
          });
        });
      })
      .catch((err) => {
        console.error(err);
        log.error({ email: emailAddress, subject, error: err });
      });
  },

  loadTemplate(templatePath) {
    return new Promise((resolve, reject) => {
      fs.readFile(templatePath, 'utf8', (err, templateString) => {
        if (err) {
          return reject(err);
        }

        return resolve(templateString);
      });
    });
  },

  renderDocument(html) {
    return `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Your Message Subject or Title</title>
        <style type="text/css">
          #outlook a {padding:0;}
          body{width:100% !important; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; margin:0; padding:0;}
          .ExternalClass {width:100%;}
          .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div {line-height: 100%;}
          #backgroundTable {margin:0; padding:0; width:100% !important; line-height: 100% !important;}
          img {outline:none; text-decoration:none; -ms-interpolation-mode: bicubic;}
          a img {border:none;}
          .image_fix {display:block;}
          p {margin: 1em 0;}
          h1, h2, h3, h4, h5, h6 {color: black !important;}
          h1 a, h2 a, h3 a, h4 a, h5 a, h6 a {color: blue !important;}
          h1 a:active, h2 a:active,  h3 a:active, h4 a:active, h5 a:active, h6 a:active {
              color: red !important;
           }
          h1 a:visited, h2 a:visited,  h3 a:visited, h4 a:visited, h5 a:visited, h6 a:visited {
              color: purple !important;
          }
          table td {border-collapse: collapse;}
          table { border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; }
          a {color: orange;}
          @media only screen and (max-device-width: 480px) {
              a[href^="tel"], a[href^="sms"] {
                          text-decoration: none;
                          color: black; /* or whatever your want */
                          pointer-events: none;
                          cursor: default;
                      }
              .mobile_link a[href^="tel"], .mobile_link a[href^="sms"] {
                          text-decoration: default;
                          color: orange !important; /* or whatever your want */
                          pointer-events: auto;
                          cursor: default;
                      }
          }
          @media only screen and (min-device-width: 768px) and (max-device-width: 1024px) {
              a[href^="tel"], a[href^="sms"] {
                          text-decoration: none;
                          color: blue;
                          pointer-events: none;
                          cursor: default;
                      }
              .mobile_link a[href^="tel"], .mobile_link a[href^="sms"] {
                          text-decoration: default;
                          color: orange !important;
                          pointer-events: auto;
                          cursor: default;
                      }
          }
          @media only screen and (-webkit-min-device-pixel-ratio: 2) {
              /* Put your iPhone 4g styles in here */
          }
          @media only screen and (-webkit-device-pixel-ratio:.75){
              /* Put CSS for low density (ldpi) Android layouts in here */
          }
          @media only screen and (-webkit-device-pixel-ratio:1){
              /* Put CSS for medium density (mdpi) Android layouts in here */
          }
          @media only screen and (-webkit-device-pixel-ratio:1.5){
              /* Put CSS for high density (hdpi) Android layouts in here */
          }
        </style>
        <style type="text/css" id="Mail Designer General Style Sheet">
            a { word-break: break-word; }
            a img { border:none; }
            img { outline:none; text-decoration:none; -ms-interpolation-mode: bicubic; }
            body { width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
            .ExternalClass { width: 100%; }
            .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div { line-height: 100%; }
            #page-wrap { margin: 0; padding: 0; width: 100% !important; line-height: 100% !important; }
            #outlook a { padding: 0; }
            .preheader { display:none !important; }
            a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }
        </style>
        <style type="text/css" id="Mail Designer Mobile Style Sheet">
            @media only screen and (max-width: 580px) {
                table[class=email-body-wrap] {
                    width: 320px !important;
                }
                td[class=page-bg-show-thru] {
                    display: none !important;
                }
                table[class=layout-block-wrapping-table] {
                    width: 320px !important;
                }
                table[class=mso-fixed-width-wrapping-table] {
                    width: 320px !important;
                }
                *[class=layout-block-full-width] {
                    width: 320px !important;
                }
                table[class=layout-block-column], table[class=layout-block-padded-column] {
                    width: 100% !important;
                }
                table[class=layout-block-box-padding] {
                    width: 100% !important;
                    padding: 5px !important;
                }
                table[class=layout-block-horizontal-spacer] {
                    display: none !important;
                }
                tr[class=layout-block-vertical-spacer] {
                   display: block !important;
                   height: 8px !important;}
                td[class=container-padding] {
                    display: none !important;
                }
                table {
                    min-width: initial !important;
                }
                td {
                    min-width: initial !important;
                }
                *[class~=desktop-only] { display: none !important; }
                *[class~=mobile-only] { display: block !important; }
                .hide {
                    max-height: none !important;
                    display: block !important;
                    overflow: visible !important;
                }
                div[eqID="EQMST-F80758DE-9EEF-47C7-AC06-93EA4A39DE2D"] [class~="layout-block-padding-left"] { width: 15px !important; }
                div[eqID="EQMST-F80758DE-9EEF-47C7-AC06-93EA4A39DE2D"] [class~="layout-block-padding-right"] { width: 15px !important; }
                div[eqID="EQMST-F80758DE-9EEF-47C7-AC06-93EA4A39DE2D"] [class~="layout-block-content-cell"] { width: 290px !important; }
                td[eqID="EQMST-7FC5D3D0-8C6D-4FEE-9CF1-3545D1D19E3E"] { height:20px !important; } /* vertical spacer */
                div[eqID="EQMST-9684568B-42D9-480B-88F9-A8A5628A3E95"] [class~="layout-block-padding-left"] { width: 15px !important; }
                div[eqID="EQMST-9684568B-42D9-480B-88F9-A8A5628A3E95"] [class~="layout-block-padding-right"] { width: 15px !important; }
                div[eqID="EQMST-9684568B-42D9-480B-88F9-A8A5628A3E95"] [class~="layout-block-content-cell"] { width: 290px !important; }
                div[eqID="EQMST-5A0DDDEE-87AB-4760-A6E6-3DD7D0F64CFF"] [class~="layout-block-padding-left"] { width: 15px !important; }
                div[eqID="EQMST-5A0DDDEE-87AB-4760-A6E6-3DD7D0F64CFF"] [class~="layout-block-padding-right"] { width: 15px !important; }
                div[eqID="EQMST-5A0DDDEE-87AB-4760-A6E6-3DD7D0F64CFF"] [class~="layout-block-content-cell"] { width: 290px !important; }
                td[eqID="EQMST-F18C5A49-EA8A-46F7-BCDD-C539B2D93C40"] { height:20px !important; } /* vertical spacer */
                div[eqID="EQMST-0DAAA647-CF36-4D52-A529-C47D3AEED97E"] [class~="layout-block-padding-left"] { width: 15px !important; }
                div[eqID="EQMST-0DAAA647-CF36-4D52-A529-C47D3AEED97E"] [class~="layout-block-padding-right"] { width: 15px !important; }
                div[eqID="EQMST-0DAAA647-CF36-4D52-A529-C47D3AEED97E"] [class~="layout-block-content-cell"] { width: 290px !important; }
                div[eqID="EQMST-CA578EBC-CDF4-42E5-B3C2-733AFA93203C"] [class~="layout-block-padding-left"] { width: 15px !important; }
                div[eqID="EQMST-CA578EBC-CDF4-42E5-B3C2-733AFA93203C"] [class~="layout-block-padding-right"] { width: 15px !important; }
                div[eqID="EQMST-CA578EBC-CDF4-42E5-B3C2-733AFA93203C"] [class~="layout-block-content-cell"] { width: 290px !important; }
                td[eqID="EQMST-72CF2CD9-3EC0-4684-A174-4C910AD87EFB"] { height:10px !important; } /* vertical spacer */
                div[eqID="EQMST-75862536-3C98-4173-9B69-261FAA665A8A"] [class~="layout-block-padding-left"] { width: 15px !important; }
                div[eqID="EQMST-75862536-3C98-4173-9B69-261FAA665A8A"] [class~="layout-block-padding-right"] { width: 15px !important; }
                div[eqID="EQMST-75862536-3C98-4173-9B69-261FAA665A8A"] [class~="layout-block-content-cell"] { width: 290px !important; }
                div[eqID="EQMST-4DAA8377-3CD8-47A1-843B-1C15EC5BA4A1"] [class~="layout-block-padding-left"] { width: 15px !important; }
                div[eqID="EQMST-4DAA8377-3CD8-47A1-843B-1C15EC5BA4A1"] [class~="layout-block-padding-right"] { width: 15px !important; }
                div[eqID="EQMST-4DAA8377-3CD8-47A1-843B-1C15EC5BA4A1"] [class~="layout-block-content-cell"] { width: 290px !important; }
                td[eqID="EQMST-7245A797-8B6A-4A5B-9919-A07C6D7CDF0F"] { height:10px !important; } /* vertical spacer */
                div[eqID="EQMST-CF8F8F73-F422-4760-B4DA-F27087862B29"] [class~="layout-block-padding-left"] { width: 15px !important; }
                div[eqID="EQMST-CF8F8F73-F422-4760-B4DA-F27087862B29"] [class~="layout-block-padding-right"] { width: 15px !important; }
                div[eqID="EQMST-CF8F8F73-F422-4760-B4DA-F27087862B29"] [class~="layout-block-content-cell"] { width: 290px !important; }
                div[eqID="EQMST-3CEF34B3-F6D3-4F51-9418-A8468FB56C03"] [class~="layout-block-padding-left"] { width: 15px !important; }
                div[eqID="EQMST-3CEF34B3-F6D3-4F51-9418-A8468FB56C03"] [class~="layout-block-padding-right"] { width: 15px !important; }
                div[eqID="EQMST-3CEF34B3-F6D3-4F51-9418-A8468FB56C03"] [class~="layout-block-content-cell"] { width: 290px !important; }
                td[eqID="EQMST-8EFBDBDC-2322-456E-A9C8-78C34A8BA757"] { height:20px !important; } /* vertical spacer */
                div[eqID="EQMST-E5D21C7A-680A-4CF7-8DFE-E9E2007F4FBA"] [class~="layout-block-padding-left"] { width: 12px !important; }
                div[eqID="EQMST-E5D21C7A-680A-4CF7-8DFE-E9E2007F4FBA"] [class~="layout-block-padding-right"] { width: 12px !important; }
                div[eqID="EQMST-E5D21C7A-680A-4CF7-8DFE-E9E2007F4FBA"] [class~="layout-block-content-cell"] { width: 296px !important; }
                div[eqID="EQMST-6251A96F-29A7-4E95-AB1A-9C6EF9850AE7"] [class~="layout-block-padding-left"] { width: 12px !important; }
                div[eqID="EQMST-6251A96F-29A7-4E95-AB1A-9C6EF9850AE7"] [class~="layout-block-padding-right"] { width: 12px !important; }
                div[eqID="EQMST-6251A96F-29A7-4E95-AB1A-9C6EF9850AE7"] [class~="layout-block-content-cell"] { width: 296px !important; }
                td[eqID="EQMST-80D5C97D-81EC-40DA-9EDF-39C84148F4D5"] { height:40px !important; } /* vertical spacer */
                div[eqID="EQMST-BB0AAACE-36D4-41EF-9E19-115682C85E60"] [class~="layout-block-padding-left"] { width: 12px !important; }
                div[eqID="EQMST-BB0AAACE-36D4-41EF-9E19-115682C85E60"] [class~="layout-block-padding-right"] { width: 12px !important; }
                div[eqID="EQMST-BB0AAACE-36D4-41EF-9E19-115682C85E60"] [class~="layout-block-content-cell"] { width: 296px !important; }
                td[eqID="EQMST-4A750957-7327-469D-8AF2-444120574C90"] { height:20px !important; } /* vertical spacer */
                div[eqID="EQMST-A3FA7818-0B0C-41B5-8F49-F696E923CBA5"] [class~="layout-block-padding-left"] { width: 12px !important; }
                div[eqID="EQMST-A3FA7818-0B0C-41B5-8F49-F696E923CBA5"] [class~="layout-block-padding-right"] { width: 12px !important; }
                div[eqID="EQMST-A3FA7818-0B0C-41B5-8F49-F696E923CBA5"] [class~="layout-block-content-cell"] { width: 296px !important; }
                div[eqID="EQMST-9400EE3D-B6F2-4EE5-B55D-A0180A9C39D3"] [class~="layout-block-padding-left"] { width: 12px !important; }
                div[eqID="EQMST-9400EE3D-B6F2-4EE5-B55D-A0180A9C39D3"] [class~="layout-block-padding-right"] { width: 12px !important; }
                div[eqID="EQMST-9400EE3D-B6F2-4EE5-B55D-A0180A9C39D3"] [class~="layout-block-content-cell"] { width: 296px !important; }
                td[eqID="EQMST-EBD9D937-A137-4C83-ADFD-BE4CD5F9450F"] { height:10px !important; } /* vertical spacer */
                div[eqID="EQMST-7743A304-B14A-46D5-86D9-4AD86AD3AC83"] [class~="layout-block-padding-left"] { width: 12px !important; }
                div[eqID="EQMST-7743A304-B14A-46D5-86D9-4AD86AD3AC83"] [class~="layout-block-padding-right"] { width: 12px !important; }
                div[eqID="EQMST-7743A304-B14A-46D5-86D9-4AD86AD3AC83"] [class~="layout-block-content-cell"] { width: 296px !important; }
                div[eqID="EQMST-9621D361-64F0-470F-A6C1-5AAF398406F8"] [class~="layout-block-padding-left"] { width: 12px !important; }
                div[eqID="EQMST-9621D361-64F0-470F-A6C1-5AAF398406F8"] [class~="layout-block-padding-right"] { width: 12px !important; }
                div[eqID="EQMST-9621D361-64F0-470F-A6C1-5AAF398406F8"] [class~="layout-block-content-cell"] { width: 296px !important; }
                td[eqID="EQMST-BF4DBCE8-44C6-4C1E-A965-0C4B01B8C96F"] { height:10px !important; } /* vertical spacer */
                div[eqID="EQMST-466B08C4-B777-433C-B83B-043DD343ABDD"] [class~="layout-block-padding-left"] { width: 12px !important; }
                div[eqID="EQMST-466B08C4-B777-433C-B83B-043DD343ABDD"] [class~="layout-block-padding-right"] { width: 12px !important; }
                div[eqID="EQMST-466B08C4-B777-433C-B83B-043DD343ABDD"] [class~="layout-block-content-cell"] { width: 296px !important; }
                td[eqID="EQMST-95EC85E6-D57B-4DA8-B72F-7D507BCF823E"] { height:40px !important; } /* vertical spacer */
                div[eqID="EQMST-1A2F2439-279F-4EA3-8F7E-91405658F5AE"] [class~="layout-block-padding-left"] { width: 12px !important; }
                div[eqID="EQMST-1A2F2439-279F-4EA3-8F7E-91405658F5AE"] [class~="layout-block-padding-right"] { width: 12px !important; }
                div[eqID="EQMST-1A2F2439-279F-4EA3-8F7E-91405658F5AE"] [class~="layout-block-content-cell"] { width: 296px !important; }
                td[eqID="EQMST-49F29191-B5DD-44C0-BCB5-B7D8CFA35A4F"] { height:65px !important; } /* vertical spacer */
                div[eqID="EQMST-96715308-F1AE-4972-A4A9-14D7BDD4650F"] [class~="layout-block-padding-left"] { width: 12px !important; }
                div[eqID="EQMST-96715308-F1AE-4972-A4A9-14D7BDD4650F"] [class~="layout-block-padding-right"] { width: 12px !important; }
                div[eqID="EQMST-96715308-F1AE-4972-A4A9-14D7BDD4650F"] [class~="layout-block-content-cell"] { width: 296px !important; }
                div[eqID="EQMST-49EF0C3E-444E-41F9-940F-CA99F6118F2B"] [class~="layout-block-padding-left"] { width: 12px !important; }
                div[eqID="EQMST-49EF0C3E-444E-41F9-940F-CA99F6118F2B"] [class~="layout-block-padding-right"] { width: 12px !important; }
                div[eqID="EQMST-49EF0C3E-444E-41F9-940F-CA99F6118F2B"] [class~="layout-block-content-cell"] { width: 296px !important; }
                td[eqID="EQMST-7FA6A340-71B2-4D26-ADDF-9ABE33E8160B"] { height:10px !important; } /* vertical spacer */
            }
        </style>
        <!--[if gte mso 9]>
        <style type="text/css" id="Mail Designer Outlook Style Sheet">
            table.layout-block-horizontal-spacer {
                display: none !important;
            }
            table {
                border-collapse:collapse;
                mso-table-lspace:0pt;
                mso-table-rspace:0pt;
                mso-table-bspace:0pt;
                mso-table-tspace:0pt;
                mso-padding-alt:0;
                mso-table-top:0;
                mso-table-wrap:around;
            }
            td {
                border-collapse:collapse;
                mso-cellspacing:0;
            }
        </style>
        <![endif]-->
        <link href="http://fonts.googleapis.com/css?family=Droid+Sans:regular" rel="stylesheet" type="text/css" class="EQWebFont"><link href="http://fonts.googleapis.com/css?family=Roboto:regular,italic" rel="stylesheet" type="text/css" class="EQWebFont"><meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      </head>
      <body style="margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; " background="page-bg.jpg" eqid="EQMST-5B629705-2068-4643-A1B4-1BA752D88F04"><!--[if gte mso 9]>
        ${html}
      </body>
      </html>
    `;
  },
};

module.exports = emailUtils;
