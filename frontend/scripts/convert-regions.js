const fs = require('fs');
const h3 = require('h3-js');

rawTowns = loadJSON(process.argv[2]).records;
rawProvinces = loadJSON(process.argv[3]).records;
rawResources = loadJSON(process.argv[4]).results;

counter = advanceCounter('Converting regions', 5 * rawProvinces.length + 3 * rawTowns.length);
regions = {  
  4: rawProvinces.map(convertProvince(4)),
  5: rawProvinces.map(convertProvince(5)),
  6: rawTowns.map(convertTown(6)).concat(rawProvinces.map(convertProvince(6))),
  7: rawTowns.map(convertTown(7)).concat(rawProvinces.map(convertProvince(7))),
  8: rawTowns.map(convertTown(8)).concat(rawProvinces.map(convertProvince(8))),
};
counter.end();

counter = advanceCounter('Converting resources', 5 * rawResources.length);
resources = {
  4: rawResources.map(convertResource(4)),
  5: rawResources.map(convertResource(5)),
  6: rawResources.map(convertResource(6)),
  7: rawResources.map(convertResource(7)),
  8: rawResources.map(convertResource(8)),
};
counter.end();

writeJSON(process.argv[5], regions);
writeJSON(process.argv[6], resources);

function loadJSON(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

function writeJSON(path, data) {
  fs.writeFileSync(path, JSON.stringify(data, null, 4));
}

function convertTown(level) {
  return (rawTown) => {
    counter.advance();
    return {
      id: rawTown.recordid,
      name: rawTown.fields.municipio,
      type: 'town',
      // province: rawTown.fields.provincia,
      // state: rawTown.fields.communidad_autonoma,
      level: level,
      hexes: getHexes(rawTown.fields.geo_shape, level),
      container: getContainer(rawTown.fields.geo_shape),
    }
  };
}

function convertProvince(level) {
  return (rawProvince) => {
    counter.advance();
    return {
      id: rawProvince.recordid,
      name: rawProvince.fields.nameunit,
      type: 'province',
      level: level,
      hexes: getHexes(rawProvince.fields.geo_shape, level),
      container: getContainer(rawProvince.fields.geo_shape),
    }
  };
}

function convertResource(level) {
  return (rawResource) => {
    counter.advance();
    const hex = h3.geoToH3(rawResource.Location.latitude, rawResource.Location.longitude, level);
    const center = h3.h3ToGeo(hex);
    return {
      id: rawResource.FCid,
      title: rawResource.Title,
      description: rawResource.Description,
      category: rawResource.category,
      level: level,
      hex: hex,
      coords: {
        lat: center[0],
        lng: center[1],
      },
      regionId: rawResource.regionId,
    }
  };
}

function getContainer(geo_shape) {
  let flatCoords;
  if (geo_shape.type === 'MultiPolygon') {
    flatCoords = geo_shape.coordinates.flat(2);
  } else if (geo_shape.type === 'Polygon') {
    flatCoords = geo_shape.coordinates.flat(1);
  } else {
    throw new Error('Unknown shape type: ' + geo_shape.type);
  }

  const container = flatCoords.reduce(
    (container, coord) => {
      if (!container) {
        return {
          north: coord[1],
          south: coord[1],
          east: coord[0],
          west: coord[0],
        }
      } else {
        return {
          north: Math.max(container.north, coord[1]),
          south: Math.min(container.south, coord[1]),
          east: Math.max(container.east, coord[0]),
          west: Math.min(container.west, coord[0]),
        }
      }
    },
    undefined
  );
  return container;
}

function getHexes(geo_shape, level) {
  if (geo_shape.type === 'Polygon') {
    return h3.polyfill(geo_shape.coordinates, level, true);
  } else if (geo_shape.type === 'MultiPolygon') {
    return geo_shape.coordinates.map(
      (polygon) => h3.polyfill(polygon, level, true)
    ).flat();
  } else {
    throw new Error('Unknown shape type: ' + geo_shape.type);
  }
}

function advanceCounter(title, total) {
  var counter = 0;

  return {
    advance: function () {
      counter += 1;
      percent = Math.round(counter / total * 100);
      process.stdout.write(title + ': ' + percent + '%\033[0G');
    },

    end: function () {
      process.stdout.write(title + ': 100%\n');
    },
  }
}
