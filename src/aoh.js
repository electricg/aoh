const cheerio = require('cheerio');
const utils = require('./utils');

let aoh = {};
module.exports = aoh;


/**
 * Download and save all the pages
 * @param {string} homeUrl - Url of the homepage to download
 * @param {string} dest - Folder path where to save the file
 * @returns {promise} array with the names of the files
 */
aoh.download = (homeUrl, dest) => {
  return utils.downloadPage(homeUrl, dest)
    .then((res) => {
      return utils.readFile(path.join(output, res));
    })
    .then((res) => {
      return aoh.getHousesUrls(res);
    })
    .then((res) => {
      return utils.downloadPages(res, dest);
    });
};


/**
 * Get urls of the houses pages
 * @param {string} html - Code to read
 * @returns {array} list of the urls
 */
aoh.getHousesUrls = (html) => {
  const $ = cheerio.load(html);
  let links = [];

  $('#house_wrapper').find('a').each((index, el) => {
    links.push($(el).attr('href'));
  });

  return links;
};