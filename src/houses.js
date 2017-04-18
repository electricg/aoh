const fs = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio');
const utils = require('./utils');


/**
 * Download and save all the pages
 * @param {string} homeUrl - Url of the homepage to download
 * @param {string} dest - Folder path where to save the file
 * @returns {promise} array with the names of the files
 */
const download = (homeUrl, dest) => {
  return utils.downloadPage(homeUrl, dest, 'houses')
    .then((res) => {
      return utils.readFile(path.join(dest, res));
    })
    .then((res) => {
      return getUrls(res);
    })
    .then((res) => {
      return utils.waterfallPromises(res, path.join(dest, 'houses'), utils.delayedDownloadPage);
    });
};


/**
 * Get urls of the houses pages
 * @param {string} html - Code to read
 * @returns {array} list of the urls
 */
const getUrls = (html) => {
  // const $ = cheerio.load(html);
  // let links = [];

  // $('#house_wrapper').find('a').each((index, el) => {
  //   links.push($(el).attr('href'));
  // });

  // return links;

  const list = getList(html);

  const links = Object.keys(list).map((key) => {
    return list[key].url;
  });

  return links;
};


const getList = (html) => {
  const $ = cheerio.load(html);
  let list = {};

  $('#house_wrapper').find('a').each((index, el) => {
    const $el = $(el);
    const href = $el.attr('href');
    const id = utils.getPagenameFromUrl(href);

    list[id] ={
      id: id,
      url: href,
      name: $el.find('.grid_item_title_text').html(),
      trailNumber: parseInt($el.find('.trail_number').html(), 10)
    };
  });

  return list;
};


const getTrailsList = (html) => {
  const $ = cheerio.load(html);
  let list = {};

  $('.house-filters').find('li').each((index, el) => {
    const $el = $(el);
    const id = $el.data('cat');

    if (id !== '') {
      list[id] ={
        id: id,
        name: $el.html()
      };
    }
  });

 return list;
};


const allowedCities = ['Brighton', 'Hove', 'Hassocks', 'Ditchling', 'Rottingdean', 'Ditching', 'Newhaven', 'Hurstpierpoint'];
const allowedCounties = ['West Sussex', 'East Sussex'];
const regexSearch = new RegExp(/B[NnB]\d{1,2}\s{0,1}\d\s{0,1}[A-Z]{2}/);
const regexProper = new RegExp(/B[NB]\d{1,2}\s\d[A-Z]{2}/);

const decodeEmail = (input) => {
  let output = '';
  let r = '0x' + input.substr(0, 2) | 0;

  for (let i = 2; input.length - i; i+=2) {
    output += '%' + ('0' + ('0x' + input.substr(i, 2)^r).toString(16)).slice(-2);
  }

  return decodeURIComponent(output);
};


const getHouse = (html) => {
  const $ = cheerio.load(html);

  const getId = () => {
    const href = $('link[rel=canonical]').attr('href');

    return utils.getPagenameFromUrl(href);
  };

  const getName = () => {
    const title = $('.entry-title');
    const link = title.find('a');
    let result = '';

    if (link.length) {
      const cfemail = link.data('cfemail');
      result = decodeEmail(cfemail);
    }
    else {
     result = title.text().trim();
    }

    return result;
  };

  const getAddress = () => {
    let address = [];
    let county = '';
    let city = '';
    let postcode = '';

    const html = $('.col.house_address p').html();

    if (html) {
      let arr = html.split('\r\n');

      if (arr.length === 1) {
        arr = arr[0].split(',');
      }

      arr.forEach((item, index) => {
        arr[index] = item.trim().replace(/,$/, '');
      });

      const last = arr.pop();

      const matchedPostcode = last.match(regexSearch)[0];
      const matchedCity = last.replace(matchedPostcode, '');

      // postcode
      postcode = matchedPostcode.toUpperCase();

      if (!regexProper.test(postcode)) {
        postcode = postcode.replace(/\s/g, '');
        postcode = postcode.substr(0, postcode.length - 3) + ' ' + postcode.substr(-3);
      }

      // city
      city = matchedCity.trim();
      city = city.replace(/\.$/g, '');

      if (allowedCounties.indexOf(city) !== -1) {
        county = city;
        city = '';
      }

      if (city !== '' && allowedCities.indexOf(city) === -1) {
        address.unshift(city);
        city = '';
      }

      // address
      arr.reverse();

      arr.reduce((acc, currentValue) => {
        if (allowedCities.indexOf(currentValue) !== -1) {
          city = currentValue;
        }
        else if (allowedCounties.indexOf(currentValue) !== -1) {
          county = currentValue;
        }
        else {
          address.unshift(currentValue);
        }
      }, '');

      if (city === '') {
        if (/^BN[1|2]/.test(postcode)) {
          city = 'Brighton';
        }

        if (/^BN3/.test(postcode)) {
          city = 'Hove';
        }
      }
    }

    return {
      address,
      city,
      postcode,
      county
    };
  };

  const getDirections = () => {
    const html = $('.directions').html();
    let result = html || '';

    result = result.trim();
    result = result.replace('<strong>Directions: </strong> ', '');

    if (result === '') {
      result = [];
    }
    else {
      result = result.split('\r\n');
    }

    result.forEach((item, index) => {
      result[index] = item.trim();
    });

    // TODO check and remove tags

    return result;
  };

  const getTrail = () => {
    const html = $('.trail_button a').text();
    let result = html.trim() || '';

    return result;
  };

  const getDescription = () => {
    const html = $('#listing_content').html();
    let result = html.trim() || '';

    result = result.replace(/<\/p>\n<p>/g, '</p>===<p>');
    result = result.split('===');

    return result;
  };

  const getArtists = () => {
    let result = [];
    // TODO

    return result;
  };

  const getFacilities = () => {
    const html = $('#facilities').find('li');
    let result = [];

    html.each((index, el) => {
      const $el = $(el);
      const name = $el.text().trim();
      let id = $el.find('img').attr('src');
      id = id.substr(0, id.lastIndexOf('.'));
      id = utils.getPagenameFromUrl(id);

      const o = {
        id: id,
        name: name
      };

      result.push(o);
    });

    return result;
  };

  const getDates = () => {
    const html = $('#opening-cal').find('td.active');
    let result = [];

    html.each((index, el) => {
      const $el = $(el);
      const day = $el.text();

      // TODO: create full date

      result.push(day);
    });

    return result;
  };

  const getHours = () => {
    const html = $('.opening_hours').text();
    let result = html.trim() || '';

    result = result.replace('oo', '00');

    // const regex1 = new RegExp(/^(0{0,1}\d{2})[\.:](\d{2})\s{0,1}[-–]\s{0,1}(\d{2})[\.:](\d{2})$/);

    // if (regex1.test(result)) {
    //   result = '';
    // }

    return result;
  };

  const getContacts = () => {
    const html = $('.contact-details div');
    let result = [];
    const regex = new RegExp(/^[\d\+\s]{1,}/);

    html.each((index, el) => {
      const $el = $(el);
      let type = '';
      let href = '';
      let name = '';
      
      let $a = $el.find('.__cf_email__');
      let $b = $el.find('a');

      if ($a.length) {
        type = 'email';
        const cfemail = $a.data('cfemail');
        const email = decodeEmail(cfemail);
        href = email;
        name = email;
      }
      else if ($b.length) {
        type = 'link';
        href = $b.attr('href');
        name = $b.text().trim();
      }
      else {
        type = 'text';
        name = $el.text().trim();

        if (regex.test(name)) {
          type = 'tel';
          href = name.match(regex)[0].trim().replace(/\s/g, '');
        }
      }

      if (name !== '') {
        const o = {
          type,
          href,
          name
        };

        result.push(o);
      }
    });

    return result;
  };

  // TODO: additional hours
  // TODO: additional days

  return {
    getId,
    getName,
    getAddress,
    getDirections,
    getTrail,
    getDescription,
    getArtists,
    getFacilities,
    getDates,
    getHours,
    getContacts
  };
};


const getFullInfo = (options) => {
  let result = {
    houses: {},
    trails: {}
  };


  const htmlHousesIndex = fs.readFileSync(path.join(options.dirIndex, options.housesIndex));

  result.houses = getList(htmlHousesIndex);
  result.trails = getTrailsList(htmlHousesIndex);

  const fullHousesDir = path.join(options.dirIndex, options.housesDir);

  fs.readdirSync(fullHousesDir).forEach((item) => {
    const html = fs.readFileSync(path.join(fullHousesDir, item));
    const house = getHouse(html);

    const id = house.getId();

    result.houses[id].address = house.getAddress();
    result.houses[id].direction = house.getDirections();
    result.houses[id].trail = house.getTrail();
    result.houses[id].description = house.getDescription();
    result.houses[id].artists = house.getArtists();
    result.houses[id].facilities = house.getFacilities();
    result.houses[id].dates = house.getDates();
    result.houses[id].hours = house.getHours();
    result.houses[id].contacts = house.getContacts();
  });

  return result;
};



module.exports = {
  download,
  getFullInfo
};