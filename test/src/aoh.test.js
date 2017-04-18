/* global describe, it */
const fs = require('fs-extra');
const path = require('path');
const helper = require('../helper');
const aoh = require('../../src/aoh');
const utils = require('../../src/utils');

const dest = './output/houses';


describe('aoh', () => {

  it('should return the address', (done) => {
    fs.readdirSync(dest).forEach((item) => {
      const html = fs.readFileSync(path.join(dest, item));
      const house = aoh.house(html);
      console.log(house.getAddress());
      console.log('==================');
    });

    done();
  });
});