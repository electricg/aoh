const fs = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio');
const utils = require('./utils');

let aoh = {};
module.exports = aoh;


aoh.download = (artistUrl, dest) => {
  return utils.downloadPage(artistUrl, dest, 'artists')
    .then((res) => {
      return utils.readFile(path.join(dest, res));
    })
    .then((res) => {
      return aoh.getUrls(res);
    })
    .then((res) => {
      return utils.waterfallPromises(res, path.join(dest, 'artists'), utils.delayedDownloadPage);
    });
};


aoh.getUrls = (html) => {
  const $ = cheerio.load(html);
  let links = [];

  $('#house_wrapper').find('a').each((index, el) => {
    links.push($(el).attr('href'));
  });

  return links;
};


aoh.getList = (html) => {
  const $ = cheerio.load(html);
  let list = {};

  $('#house_wrapper').find('a').each((index, el) => {
    const $el = $(el);
    const href = $el.attr('href');
    const id = utils.getPagenameFromUrl(href);

    list[id] ={
      id: id,
      url: href,
      name: $el.find('.entry-title').html(),
      artform: $el.find('.artform').html()
    };
  });

  return list;
};


aoh.getArtformsList = (html) => {
  const $ = cheerio.load(html);
  let list = {};

  $('#artform-filter').find('li').each((index, el) => {
    const $el = $(el);
    const name = $el.html();
    const id = name;

    list[id] ={
      id: id,
      name: name
    };
  });

 return list;
};


aoh.artist = (html) => {
  // const $ = cheerio.load(html);

  const getId = () => {
    return '';
  };

  const getName = () => {
    // return $('.entry-title').html();
    return '';
  };

  const getDescription = () => {
    return '';
  };

  const getHouse = () => {
    return '';
  };

  const getContacts = () => {
    return '';
  };

  return {
    getId,
    getName,
    getDescription,
    getHouse,
    getContacts
  };
};


aoh.getFullInfo = (options) => {
  let result = {
    artists: {},
    artforms: {}
  };

  const htmlArtistsIndex = fs.readFileSync(path.join(options.dirIndex, options.artistsIndex));

  result.artists = aoh.getList(htmlArtistsIndex);
  result.artforms = aoh.getArtformsList(htmlArtistsIndex);

  const fullArtistsDir = path.join(options.dirIndex, options.artistsDir);

  fs.readdirSync(fullArtistsDir).forEach((item) => {
    const html = fs.readFileSync(path.join(fullArtistsDir, item));
    const artist = aoh.artist(html);

    const id = artist.getId();

    result.artists[id].description = artist.getDescription();
    result.artists[id].house = artist.getHouse();
    result.artists[id].contacts = artist.getContacts();
  });

  return result;
};