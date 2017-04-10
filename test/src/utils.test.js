/* global describe, it */
const helper = require('../helper');
const utils = require('../../src/utils');

const output = helper.output;


describe('Utils', () => {

  it('should succeed to download a page', (done) => {
    const src = 'http://giugee.com/';
    const dest = output;

    utils.downloadPage(src, dest)
      .then(() => {
        done();
      })
      .catch((err) => done(err));
  });


  it('should succeed to download a list of pages', (done) => {
    const src = [
      'http://giugee.com/',
      'http://giugee.com/cv'
    ];
    const dest = output;

    utils.downloadPages(src, dest)
      .then(() => {
        done();
      })
      .catch((err) => done(err));
  });

});