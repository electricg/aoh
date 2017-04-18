/* global beforeEach, afterEach, after */
const fs = require('fs-extra');
const nock = require('nock');

const output = './test/output';
module.exports.output = output;

module.exports.nock = nock;


beforeEach((done) => {
  fs.remove(output, (err) => {
    if (err) {
      done(err);
    }
    else {
      done();
    }
  });
});


afterEach(function(done) {
  nock.cleanAll();
  done();
});


after((done) => {
  fs.remove(output, (err) => {
    if (err) {
      done(err);
    }
    else {
      done();
    }
  });
});