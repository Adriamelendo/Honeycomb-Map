const fs = require('fs');
const h3 = require('h3-js');

function loadJSON(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

function writeJSON(path, data) {
  fs.writeFileSync(path, JSON.stringify(data, null, 4));
}

function searchHexes(id,geo_shape, level) {
  var auxlev = 0;
  if (level<8) {
    var auxlev = level ;
    level = 8;
  }
  var toReturn;
  toReturn = level8Reference[id] || [];  
  if (toReturn == [] ) print('caution region '+id+' no hex in level 8');
  if ( auxlev != 0 ) {
    var upperlevel = [];
    toReturn.forEach(hex => {
      upperlevel.push(h3.h3ToParent(hex, auxlev))
    })
    toReturn = [...new Set(upperlevel)];
  }
  return toReturn;
}

function viewHexes(id,geo_shape, level) { 
  if(level==8 && level8Reference[id] != undefined) return level8Reference[id];
  if (geo_shape.type === 'Polygon') {
    return h3.polyfill(geo_shape.coordinates, level, true);
  } else if (geo_shape.type === 'MultiPolygon') {
    return geo_shape.coordinates.map(
      (polygon) => h3.polyfill(polygon, level, true)
    ).flat();
  }  
}

function convertTown(rawTown, level) {
  return {
    id: rawTown.recordid,
    name: rawTown.fields.municipio,
    type: 'town',
    // province: rawTown.fields.provincia,
    // state: rawTown.fields.communidad_autonoma,
    level: level,
    view: viewHexes(rawTown.recordid,rawTown.fields.geo_shape, level),
    search: searchHexes(rawTown.recordid,rawTown.fields.geo_shape, level),
  };
}

function convertProvince(rawProvince, level) {
  return {
    id: rawProvince.recordid,
    name: rawProvince.fields.nameunit,
    type: 'province',
    level: level,
    view: viewHexes(rawProvince.recordid,rawProvince.fields.geo_shape, level),
    search: searchHexes(rawProvince.recordid,rawProvince.fields.geo_shape, level),
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
level8Reference = [];
rawTowns.forEach((town) => level8Reference[town.recordid]=viewHexes(town.recordid,town.fields.geo_shape, 8));
rawProvinces.forEach((province) => level8Reference[province.recordid]=viewHexes(province.recordid,province.fields.geo_shape, 8));

regions = {  
  8: rawTowns.map((town) => convertTown(town, 8))
       .concat(rawProvinces.map((province) => convertProvince(province, 8))),
  7: rawTowns.map((town) => convertTown(town, 7))
       .concat(rawProvinces.map((province) => convertProvince(province, 7))),
  6: rawTowns.map((town) => convertTown(town, 6))
       .concat(rawProvinces.map((province) => convertProvince(province, 6))),
  5: rawTowns.map((town) => convertTown(town, 5))
       .concat(rawProvinces.map((province) => convertProvince(province, 5))),
  4: rawTowns.map((town) => convertTown(town, 4))
      .concat(rawProvinces.map((province) => convertProvince(province, 4))),
  3: rawProvinces.map((province) => convertProvince(province, 3)),
  2: rawProvinces.map((province) => convertProvince(province, 2)),
};


rawResources = loadJSON(process.argv[4]).results;
resources = rawResources.map(convertResource);

writeJSON(process.argv[5], regions);
writeJSON(process.argv[6], resources);

