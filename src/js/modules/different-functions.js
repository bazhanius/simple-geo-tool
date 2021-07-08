import { snackbar, setSnackbarContent } from "./mdc-stuff.js";

/**
 *
 * Different functions
 *
 */

const calcDistanceInPolyline = (latlngs, unit) => {
    let _distance = {'m': 0, 'km': 0};
    let _previousPoint = null;
    latlngs.forEach((el, i) => {
        let _lat = el[0];
        let _lon = el[1];
        if (_previousPoint) {
            _distance.m += L.latLng(_previousPoint).distanceTo([_lat, _lon]);
        }
        _previousPoint = [_lat, _lon];
    });
    _distance.km = Math.round(_distance.m / 1000 * 100) / 100;
    _distance.m = Math.round(_distance.m * 100) / 100;
    return unit in _distance ? _distance[unit] : _distance;
};

// Shoelace formula for polygonal *flat* area
// https://en.wikipedia.org/wiki/Decimal_degrees
// latlngs -> [[lat1,lon1], [lat2,lon2], ..., [latN,lonN]]
const calcPolygonArea = (latlngs, unit) => {
    let numPoints = latlngs.length;
    let area = {'m2': 0, 'km2': 0, 'ft2': 0, 'mi2': 0, 'ac': 0};
    let j = numPoints - 1;
    for (let i = 0; i < numPoints; i++) {
        let y1 = latlngs[j][0] * 111_319.5;
        let y2 = latlngs[i][0] * 111_319.5;
        let x1 = latlngs[j][1] * (40_075_000 * Math.cos(latlngs[j][0] * Math.PI / 180) / 360);
        let x2 = latlngs[i][1] * (40_075_000 * Math.cos(latlngs[i][0] * Math.PI / 180) / 360);
        area.m2 = area.m2 + (y1 + y2) * (x1 - x2);
        j = i;
    }
    area.m2  = Math.round(Math.abs(area.m2 / 2) * 100) / 100;
    area.km2 = Math.round(area.m2 / 1e+6 * 100) / 100;
    area.ft2 = Math.round(area.m2 * 10.76391 * 100) / 100;
    area.mi2 = Math.round(area.m2 * 3.8610216e-7 * 100) / 100;
    area.ac  = Math.round(area.m2 * 0.00024711 * 100) / 100;
    return unit in area ? area[unit] : area;
};

// https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText
const copyToClipboard = (data, type) => {
    navigator.clipboard.writeText(data).then(function() {
        /* clipboard successfully set */
        setSnackbarContent({
            'type': 'clipboardCopyResult',
            'text': `JSON data of <strong>${type}</strong> copied to clipboard successfully!`
        });
        snackbar.close();
        snackbar.open();
    }, function() {
        /* clipboard write failed */
        setSnackbarContent({
            'type': 'clipboardCopyResult',
            'text': `JSON data of <strong>${type}</strong> copying to clipboard failed!`
        });
        snackbar.close();
        snackbar.open();
    });
};

const openInNewTab = (url) => {
    let win = window.open(url, '_blank');
    win.focus();
};

const numberWithSpaces = (x) => {
    if (typeof x === 'undefined') {
        return "—";
    } else {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }
};

const metersOrKilometers = (meters) => {
    if (meters > 10000) {
        return {value: (meters / 1000).toFixed(2), unit: 'km'}
    } else {
        return {value: (meters).toFixed(0), unit: 'm'}
    }
};

const isLatitude  = num => !isNaN(num) && num !== '' && Math.abs(num) <= 90;

const isLongitude = num => !isNaN(num) && num !== '' && Math.abs(num) <= 180;

const isJSON = (str) => {
    if (str.length < 5 || !str.startsWith('[')) {
        return false;
    }
    try {
        return (JSON.parse(str));
    } catch (e) {
        return false;
    }
};

// Based on https://stackoverflow.com/a/24392281
// L1 -> [[lat1,lon1], [lat2,lon2]], L2 -> [[lat3,lon3], [lat4,lon4]]
const checkLinesIntersection = (L1, L2) => {
    let result = {'intersection': null, 'point': {'lat': null, 'lon': null}};
    let [a,b,c,d,p,q,r,s] = [L1[0][0],L1[0][1],L1[1][0],L1[1][1],L2[0][0],L2[0][1],L2[1][0],L2[1][1]];
    const dX = (c - a);
    const dY = (d - b);
    let det, gamma, lambda;
    det = dX * (s - q) - (r - p) * dY;
    if (det === 0) {
        result.intersection = false;
    } else {
        lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
        gamma = ((b - d) * (r - a) + dX * (s - b)) / det;
        result.intersection = (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
    }
    if (result.intersection) {
        result.point.lat = (a + lambda * dX).toFixed(8);
        result.point.lon = (b + lambda * dY).toFixed(8);
    }
    return result;
};

export {
    calcDistanceInPolyline,
    calcPolygonArea,
    copyToClipboard,
    openInNewTab,
    numberWithSpaces,
    metersOrKilometers,
    isLatitude,
    isLongitude,
    isJSON
};