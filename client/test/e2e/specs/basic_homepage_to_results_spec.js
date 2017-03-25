const setup = require('../fixtures/setup');

module.exports = {
  'Selection Spec': (browser) => {
    setup(browser)
      .url(browser.launchUrl)
      .waitForElementNotPresent('.app-card-loading', 1000, 'Loading app cards are gone.')
      .click('.app-card:first-child')
      .waitForElementVisible('.enterMolecule', 1000, 'App loaded.')
      .setValue('.enterMolecule', 'CCCCCC')
      .submitForm('form.defInput')
      .waitForElementVisible('.loading', 1000, 'Loading pdb input.')
      .waitForElementVisible('.viewer3D', 100000, 'Viewer displaying pdb.')
      .end();
  },
};
