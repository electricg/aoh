const Promise = require('bluebird');
const fs = require('fs-extra');
const path = require('path');
const request = require('request');
const url = require('url');

let utils = {};
module.exports = utils;


/**
 * Download and save web page
 * @param {string} src - Url of the page to download
 * @param {string} dest - Folder path where to save the file
 * @returns {promise} string with the name of the file
 */
utils.downloadPage = (src, dest) => {
  return new Promise((resolve, reject) => {
    const ext = '.html';
    const options = {
      method: 'GET',
      url: src
    };
    // const urlObject = url.parse(src);
    // let fileName = urlObject.pathname.split('/').pop();

    // if (!fileName) {
    //   fileName = urlObject.hostname;
    // }

    const fileName = src.replace(/\//g, '_') + ext;

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
          error: response.statusCode
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
    })
  });
};