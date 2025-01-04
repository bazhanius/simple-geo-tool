import * as dF from "./different-functions.js";
import { buttons } from "./buttons-controllers.js";

/**
 *
 * All inputs controller
 *
 */

const inputFields = (function() {

    // Point
    let _pointFieldLat = document.querySelector('#point-lat');
    let _pointFieldLon = document.querySelector('#point-lon');

    // Circle
    let _circleFieldLat = document.querySelector('#circle-lat');
    let _circleFieldLon = document.querySelector('#circle-lon');
    let _circleFieldRad = document.querySelector('#circle-radius');

    // Line
    let _lineFieldLatOne = document.querySelector('#line-lat-1');
    let _lineFieldLonOne = document.querySelector('#line-lon-1');
    let _lineFieldLatTwo = document.querySelector('#line-lat-2');
    let _lineFieldLonTwo = document.querySelector('#line-lon-2');

    // GeoJSON
    let _geoJson = document.querySelector('#geojson');

    // Array
    let _arrayList = document.querySelector('#array-of-coordinates');

    return {

        getNodeList: function(type) {
            if ( type === 'point' ) {
                return [_pointFieldLat, _pointFieldLon];
            } else if ( type === 'circle' ) {
                return [_circleFieldLat, _circleFieldLon, _circleFieldRad];
            } else if ( type === 'line' ) {
                return [_lineFieldLatOne, _lineFieldLonOne, _lineFieldLatTwo, _lineFieldLonTwo];
            } else if ( type === 'geojson' ) {
                return [_geoJson];
            } else if ( type === 'array' ) {
                return [_arrayList];
            } else {
                return [];
            }
        },

        getValues: function(type) {
            if ( type === 'point' ) {
                return {
                    'lat': _pointFieldLat.value,
                    'lon': _pointFieldLon.value
                };
            } else if ( type === 'circle' ) {
                return {
                    'lat': _circleFieldLat.value,
                    'lon': _circleFieldLon.value,
                    'rad': _circleFieldRad.value
                };
            } else if ( type === 'line' ) {
                return {
                    'latOne': _lineFieldLatOne.value,
                    'lonOne': _lineFieldLonOne.value,
                    'latTwo': _lineFieldLatTwo.value,
                    'lonTwo': _lineFieldLonTwo.value
                };
            } else if ( type === 'geojson' ) {
                return {
                    'geoJson': _geoJson.value
                };
            } else if ( type === 'array' ) {
                return {
                    'arrayList': _arrayList.value
                };
            } else {
                return {};
            }
        },

        clearValues: function(type) {
            if ( type === 'point' ) {
                _pointFieldLat.value = '';
                _pointFieldLon.value = '';
            } else if ( type === 'circle' ) {
                _circleFieldLat.value = '';
                _circleFieldLon.value = '';
                _circleFieldRad.value = '';
            } else if ( type === 'line' ) {
                _lineFieldLatOne.value = '';
                _lineFieldLonOne.value = '';
                _lineFieldLatTwo.value = '';
                _lineFieldLonTwo.value = '';
            } else if ( type === 'geojson' ) {
                _geoJson.value = '';
            } else if ( type === 'array' ) {
                _arrayList.value = '';
            }
        },

        validateValues: function(type) {
            if ( type === 'point' ) {
                let allGood = [0,0,0];
                let v = inputFields.getValues('point');
                dF.isLatitude(v.lat)  ? allGood[0] = 1 : allGood[0] = 0;
                dF.isLongitude(v.lon) ? allGood[1] = 1 : allGood[1] = 0;
                v.lat || v.lon ? allGood[2] = 1 : allGood[2] = 0;
                return allGood;
            } else if ( type === 'circle' ) {
                let allGood = [0,0,0,0];
                let v = inputFields.getValues('circle');
                dF.isLatitude(v.lat)  ? allGood[0] = 1 : allGood[0] = 0;
                dF.isLongitude(v.lon)  ? allGood[1] = 1 : allGood[1] = 0;
                v.rad && !isNaN(v.rad) && v.rad > 0 && v.rad <= 1000000  ? allGood[2] = 1 : allGood[2] = 0;
                v.lat || v.lon || v.rad ? allGood[3] = 1 : allGood[3] = 0;
                return allGood;
            } else if ( type === 'line' ) {
                let allGood = [0,0,0,0,0];
                let v = inputFields.getValues('line');
                dF.isLatitude(v.latOne)  ? allGood[0] = 1 : allGood[0] = 0;
                dF.isLongitude(v.lonOne) ? allGood[1] = 1 : allGood[1] = 0;
                dF.isLatitude(v.latTwo)  ? allGood[2] = 1 : allGood[2] = 0;
                dF.isLongitude(v.lonTwo) ? allGood[3] = 1 : allGood[3] = 0;
                v.latOne || v.lonOne || v.latTwo || v.lonTwo ? allGood[4] = 1 : allGood[4] = 0;
                return allGood;
            } else if ( type === 'geojson' ) {
                let allGood = [0];
                let v = inputFields.getValues('geojson');
                v.geoJson ? allGood[0] = 1 : allGood[0] = 0;
                return allGood;
            } else if ( type === 'array' ) {
                let allGood = [0,0,0];
                let v = inputFields.getValues('array');
                let re = new RegExp(/^[0-9a-zёа-я\ \s*\#\(\)\.\,\-\[\]\{\}\"\:\+\;\/\=\\\_\-]*$/i);
                v.arrayList && re.test(v.arrayList) ? allGood[0] = 1 : allGood[0] = 0;
                v.arrayList ? allGood[1] = 1 : allGood[1] = 0;
                dF.isJSON(v.arrayList) ? allGood[2] = 1 : allGood[2] = 0;
                return allGood;
            } else {
                return [];
            }
        }

    }

}());

inputFields.getNodeList('point').forEach(function (el) {
    el.addEventListener('keyup', function() {
        buttons.toggleAddToMapButtons('point');
    });
});

inputFields.getNodeList('circle').forEach(function (el) {
    el.addEventListener('keyup', function() {
        buttons.toggleAddToMapButtons('circle');
    });
});

inputFields.getNodeList('line').forEach(function (el) {
    el.addEventListener('keyup', function() {
        buttons.toggleAddToMapButtons('line');
    });
});

inputFields.getNodeList('geojson').forEach(function (el) {
    el.addEventListener('keyup', function() {
        buttons.toggleAddToMapButtons('geojson');
    });
});

inputFields.getNodeList('array').forEach(function (el) {
    el.addEventListener('keyup', function() {
        buttons.toggleAddToMapButtons('array');
    });
});

export { inputFields };
