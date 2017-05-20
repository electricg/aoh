/* global describe, it */
const fs = require('fs-extra');
const path = require('path');
const rewire = require('rewire');
const _ = require('lodash');
const cheerio = require('cheerio');
// const helper = require('../helper');
// const utils = require('../../src/utils');

const dest = './output/houses';


// describe('aoh', () => {
//   const _barb = rewire('../../src/houses');
//   const _all = rewire('../../src/all');
//   // const _getHouse = _barb.__get__('getHouse');


//   it('should work', (done) => {
//     // const result =
//     // fs.readdirSync(dest).map((item) => {
//     //   const html = fs.readFileSync(path.join(dest, item));
//     //   const house = _getHouse(html);

//     //   const result = house.getContacts();

//     //   return result;
//     // });

//     const options = {
//       housesIndex: 'houses.html',
//       artistsIndex: 'artists.html',
//       dirIndex: './output',
//       housesDir: 'houses',
//       artistsDir: 'artists'
//     };
//     let result = _barb.getFullInfo(options);

//     console.log(result.length);


//     result = _all.merge(result);

//     // fs.writeJsonSync('./test/output/test.json', result);
//     fs.writeJsonSync('./public/data.json', result);

//     done();
//   });
// });

const regex = {
  getId: new RegExp(/^[a-z0-9-]+$/),
  getName: new RegExp(/^[a-zA-Z0-9- ,\.&@']+$/),
};


describe('houses', () => {

  const _houses = rewire('../../src/houses');


  it('should', (done) => {
    fs.readdirSync(dest).forEach((item) => {
      const fx = 'getId';

      const html = fs.readFileSync(path.join(dest, item));
      const $ = cheerio.load(html);
      const _fx = _houses.__get__(fx);

      const result = _fx($);

      const test = regex[fx].test(result);
      test.should.equal(true, result);

      // console.log(result);
    });

    done();
  });

});