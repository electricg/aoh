const Promise = require('bluebird');
const fs = require('fs-extra');
const path = require('path');
const request = require('request');
const url = require('url');

let utils = {};
module.exports = utils;


/**
 * @param {string} src - Url to parse
 * @returns {string} name of the page
 */
utils.getPagenameFromUrl = (src) => {
  const urlObject = url.parse(src);
  let pageName = urlObject.hostname;
  let pathname = urlObject.pathname.replace(/^[\/]+|[\/]+$/g, '');

  if (pathname) {
    pageName = pathname.split('/').pop();
  }

  return pageName;
};


/**
 * Download and save web page
 * @param {string} src - Url of the page to download
 * @param {string} dest - Folder path where to save the file
 * @returns {promise} string with the name of the file
 */
utils.downloadPage = (src, dest, name) => {
  return new Promise((resolve, reject) => {
    const ext = '.html';
    const options = {
      method: 'GET',
      url: src
    };

    const fileName = (name || utils.getPagenameFromUrl(src)) + ext;

    request(options, (err, response) => {
      if (err) {
        return reject({
          url: src,
          error: err
        });
      }

      if (response.statusCode !== 200) {
        return reject({
          url: src,
          error: new Error(response.statusCode)
        });
      }

      fs.mkdirs(dest, (err) => {
        if (err) {
          return reject({
            url: src,
            error: err
          });
        }

        fs.writeFile(path.join(dest, fileName), response.body, (err) => {
          if (err) {
            return reject({
              url: src,
              error: err
            });
          }

          resolve(fileName);
        });
      });
    });
  });
};


/**
 * Download and save a list of web pages
 * @param {array} urls - List of url of the pages to download
 * @param {string} dest - Folder path where to save the file
 * @returns {promise} array with the name of the files
 */
utils.downloadPages = (urls, dest) => {
  return new Promise((resolve, reject) => {
    const files = urls.map((src) => {
      return utils.downloadPage(src, dest);
    });

    Promise.all(files)
      .then((res) =>{
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });
};


utils.delayedDownloadPage = (src, dest, name) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(utils.downloadPage(src, dest, name));
    }, 500);
  });
};


utils.waterfallPromises = (arr, dest, run) => {
  const promises = arr.reduce((acc, currentValue) => {
    return acc.then((res) => {
      return run(currentValue, dest).then((result) => {
        res.push(result);
        return res;
      });
    });
  }, Promise.resolve([]));

  return promises;
};


/**
 * Read file
 * @param {string} dest - Path of the file
 * @returns {promise} string with the file content
 */
utils.readFile = (dest) => {
  return new Promise((resolve, reject) => {
    fs.readFile(dest, 'utf8', (err, content) => {
      if (err) {
        return reject(err);
      }

      resolve(content);
    });
  });
};