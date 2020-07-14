const fs = require('fs');
const h3 = require('h3-js');

function loadJSON(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

function writeJSON(path, data) {
  fs.writeFileSync(path, JSON.stringify(data, null, 4));
}

function getHexes(geo_shape, level) {
  var auxlev = 0;
  if (level<8) {
    var auxlev = level ;
    level = 8;
  }
  var toReturn;
  if (geo_shape.type === 'Polygon') {
    toReturn = h3.polyfill(geo_shape.coordinates, level, true);
  } else if (geo_shape.type === 'MultiPolygon') {
    toReturn = geo_shape.coordinates.map(
      (polygon) => h3.polyfill(polygon, level, true)
    ).flat();
  }
  if ( auxlev != 0 ) {
    var upperlevel = [];
    toReturn.forEach(hex => {
      upperlevel.push(h3.h3ToParent(hex, auxlev))
    })
    toReturn = [...new Set(upperlevel)];
  }
  return toReturn;
}

function convertTown(rawTown, level) {
  return {
    id: rawTown.recordid,
    name: rawTown.fields.municipio,
    type: 'town',
    // province: rawTown.fields.provincia,
    // state: rawTown.fields.communidad_autonoma,
    level: level,
    perimeter: getHexes(rawTown.fields.geo_shape, level),
  };
}

function convertProvince(rawProvince, level) {
  return {
    id: rawProvince.recordid,
    name: rawProvince.fields.nameunit,
    type: 'province',
    level: level,
    perimeter: getHexes(rawProvince.fields.geo_shape, level),
  };
}

function convertResource(rawResource) {
  return {
    id: rawResource.FCid,
    title: rawResource.Title,
    description: rawResource.Description,
    category: rawResource.category,
    level: 8,
    hex: h3.geoToH3(rawResource.Location.latitude, rawResource.Location.longitude, 8),
    regionId: rawResource.regionId,
  };
}

rawTowns = loadJSON(process.argv[2]).records;
rawProvinces = loadJSON(process.argv[3]).records;
regions = {
  2: rawProvinces.map((province) => convertProvince(province, 2)),
  3: rawProvinces.map((province) => convertProvince(province, 3)),
  4: rawTowns.map((town) => convertTown(town, 4))
      .concat(rawProvinces.map((province) => convertProvince(province, 4))),
  5: rawTowns.map((town) => convertTown(town, 5))
      .concat(rawProvinces.map((province) => convertProvince(province, 5))),
  6: rawTowns.map((town) => convertTown(town, 6))
       .concat(rawProvinces.map((province) => convertProvince(province, 6))),
  7: rawTowns.map((town) => convertTown(town, 7))
       .concat(rawProvinces.map((province) => convertProvince(province, 7))),
  8: rawTowns.map((town) => convertTown(town, 8))
       .concat(rawProvinces.map((province) => convertProvince(province, 8))),
};


rawResources = loadJSON(process.argv[4]).results;
resources = rawResources.map(convertResource);

writeJSON(process.argv[5], regions);
writeJSON(process.argv[6], resources);

