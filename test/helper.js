/* global beforeEach */
const fs = require('fs-extra');

const output = './test/output';
module.exports.output = output;


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