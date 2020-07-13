const fs = require('fs');
const h3 = require('h3-js');

function loadJSON(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

function writeJSON(path, data) {
  fs.writeFileSync(path, JSON.stringify(data, null, 4));
}

function convertTown(rawTown) {
  return {
    id: rawTown.recordid,
    name: rawTown.fields.municipio,
    // province: rawTown.fields.provincia,
    // state: rawTown.fields.communidad_autonoma,
    level: 7,
    perimeter: h3.polyfill(rawTown.fields.geo_shape.coordinates, 7, true),
  };
}

function convertProvince(rawProvince) {
  return {
    id: rawProvince.recordid,
    name: rawProvince.fields.nameunit,
    level: 6,
    perimeter: h3.polyfill(rawProvince.fields.geo_shape.coordinates, 6, true),
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
regions = rawTowns.map(convertTown).concat(rawProvinces.map(convertProvince));

// regions.forEach((region) => {
//   console.log(region.id, region.name);
//   console.log(region.perimeter);
// });


rawResources = loadJSON(process.argv[4]).results;
resources = rawResources.map(convertResource);

// resources.forEach((resource) => {
//   console.log(resource.id, resource.title, resource.category, resource.hex, resource.regionId);
// });

writeJSON(process.argv[5], regions);
writeJSON(process.argv[6], resources);

