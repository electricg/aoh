const _ = require('lodash');


const merge = (result) => {
  let tmpTrails = {};
  Object.keys(result.trails).forEach((key) => {
    const trail = result.trails[key];
    tmpTrails[trail.name] = _.merge({}, trail);

    trail.houses = [];
  });

  Object.keys(result.houses).forEach((key) => {
    const house = result.houses[key];
    const trail = tmpTrails[house.trail];

    if (trail) {
      house.trail = _.merge({}, trail);
      result.trails[trail.id].houses[house.trailNumber - 1] = house.id;
    }
    else {
      console.log('no trail for ', house.id);
    }
  });

  return result;
};



module.exports = {
  merge
};