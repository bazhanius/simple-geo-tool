import * as dF from "./different-functions.js";

let buttonsHTML =
    '<button class="mdc-button button-object-info" title="Full info"><span class="mdc-button__ripple"></span>' +
    '<span class="mdi mdi-icon-button mdi-information-outline mdi-18px"></span></button>' +
    '<button class="mdc-button button-object-copy" title="Copy JSON to clipboard"><span class="mdc-button__ripple"></span>' +
    '<span class="mdi mdi-icon-button mdi-content-copy mdi-18px"></span></button>' +
    '<button class="mdc-button button-object-locate" title="Locate on the map"><span class="mdc-button__ripple"></span>' +
    '<span class="mdi mdi-icon-button mdi-crosshairs-gps mdi-18px"></span></button>' +
    '<button class="mdc-button button-object-delete"  title="Delete object"><span class="mdc-button__ripple"></span>' +
    '<span class="mdi mdi-icon-button mdi-delete-forever mdi-18px"></span></button>';

function generateArrowSVG(color, degree) {
    return `<div class='b-marker-icon-arrow' style='background-color: transparent; transform: rotate(${degree}deg)'><?xml version="1.0" encoding="UTF-8"?>`
        +`<svg class="b-marker-icon-arrow__shadow" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="24" height="24" viewBox="0 0 24 24">
<path stroke="white" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" fill="${color}" d="M12,2L4.5,20.29L5.21,21L12,18L18.79,21L19.5,20.29L12,2Z" />
</svg></div>`

}

function generateMarkerSVG(color, type = 'simple') {
    if (type === 'simple') {
        return `<div style='background-color: transparent;'><?xml version="1.0" encoding="UTF-8"?>` +
            `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">` +
                `<circle cx="6" cy="6" r="6" fill="white"/>` +
                `<circle cx="6" cy="6" r="4" fill="${color}"/>` +
            `</svg></div>`
    }
    if (type === 'big') {
        return `<div style='background-color: transparent;'><?xml version="1.0" encoding="UTF-8"?>` +
            `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">` +
                `<circle cx="8" cy="8" r="8" fill="white"/>` +
                `<circle cx="8" cy="8" r="7" fill="${color}"/>` +
                `<circle cx="8" cy="8" r="6" fill="white"/>` +
                `<circle cx="8" cy="8" r="4" fill="${color}"/>` +
            `</svg></div>`
    }
}

function generateFullInfoContent(obj) {
    let info = {'title': '', 'content': ''};
    info.title = `<i class="mdi mdi-information mdi-18px"></i> Object info`;
    info.content += '<table class="b-obj-info-table"><tbody><tr>';

    info.content += `<tr><td>ID</td><td><b class="b-obj-info-bold-mono">${obj.id}</b></td></tr>`;

    info.content += `<tr><td>Type</td><td><b class="b-obj-info-bold-mono">${obj.type}</b></td></tr>`;

    info.content += `<td>JSON</td><td><pre class="b-obj-info-pre">`
        + `${JSON.stringify(obj.object, undefined, 2)}</pre></td></tr>`;

    let coords = obj.object.coords;
    let coordsList = '';
    if (coords) {
        coords.forEach( (el, i) => {
            coordsList += `${i + 1}: <b class="b-obj-info-bold-mono">${el.lat} ${el.lon}</b><br>`;
        });
    }
    info.content += `<tr><td>Coordinates</td><td><pre class="b-obj-info-pre">${coordsList}</td></pre></td></tr>`;

    let measurementAttribute = {
        'point': false,
        'circle': 'radius',
        'polyline': 'distance',
        'polygon': 'area',
        'rectangle': 'area'
    };
    let measurementsList = '';
    for (const [key, value] of Object.entries(obj.measurements)) {
        measurementsList += `${dF.numberWithSpaces(value)} ${key.replace('2', '<sup>2</sup>')}<br>`;
    }

    info.content += `<tr><td>Measurements${measurementAttribute[obj.type] 
        ? '<br><span class="b-obj-info-regular-sans">(' + (measurementAttribute[obj.type]) + ')</span>' : ''}</td>`
        + `<td>${measurementsList !== '' ? measurementsList : '—'}</td></tr>`;

    if (obj.azimuth) info.content += `<tr><td>Azimuth</td><td>${obj.azimuth}°</td></tr>`;
    info.content += `<tr><td>Color</td><td><span class="b-obj-info-dot"  style="background-color:${obj.color}"></span>${obj.color}</td></tr>`;
    info.content += `<tr><td>Line weight</td><td>${obj.weight ? obj.weight + 'px' : '—'}</td></tr>`;
    info.content += `<tr><td>Show marker dot</td><td>${obj.show_marker_dot}</td></tr>`;
    info.content += `<tr><td>Show marker pin</td><td>${obj.show_marker_pin}</td></tr>`;

    info.content += '</tbody></table>';

    return info;
}

function generateListObjectsTable(obj) {
    let measurements = '';
    let info = '—';
    if (obj.azimuth) info = obj.azimuth +'°';
    if (obj.type === 'polyline' || obj.type === 'circle') {
        measurements = (obj.measurements.m > 10000)
            ? `${dF.numberWithSpaces(obj.measurements.km)} km`
            : `${dF.numberWithSpaces(obj.measurements.m)} m`;
    }
    if (obj.type === 'polygon' || obj.type === 'rectangle') {
        measurements = (obj.measurements.m2 > 10000)
            ? `${dF.numberWithSpaces(obj.measurements.km2)} km<sup>2</sup>`
            : `${dF.numberWithSpaces(obj.measurements.m2)} m<sup>2</sup>`;
    }
    info !== '—'
        ? info += ', ' + measurements
        : info = measurements;

    return `<tr><td>${obj.id}</td><td>${obj.type}</td><td>${info}</td><td>${buttonsHTML}</td></tr>`;
}

function generatePopupText(id, type, point = 1, totalPoints = 1, lat, lon, props) {
    let measurementsList = '';
    if (props) {
        for (const [key, value] of Object.entries(props)) {
            measurementsList += `${dF.numberWithSpaces(value)} ${key}<br>`;
        }
    } else {
        measurementsList = '—';
    }

    return `<div class="popup-row"><div class="popup-col-1">ID:</div><div class="popup-col-2">${id}</div></div>`
        + `<div class="popup-row"><div class="popup-col-1">Type:</div><div class="popup-col-2">${type}</div></div>`
        + `<div class="popup-row"><div class="popup-col-1">Points:</div><div class="popup-col-2">${point} / ${totalPoints}</div></div>`
        + `<div class="popup-row"><div class="popup-col-1">Lat, Lon:</div><div class="popup-col-2"><strong>${lat}, ${lon}</strong></div></div>`
        + `<div class="popup-row"><div class="popup-col-1">Meas’s.:</div><div class="popup-col-2">${measurementsList}</div></div>`;
}

function generatePopupTextFromObj(obj, whiteListKeys = []) {
    let text = '';
    if (obj) {
        for (const [key, value] of Object.entries(obj)) {
            if (whiteListKeys.indexOf(key) > -1 || whiteListKeys.length === 0) {
                text += `<div class="popup-row" style="justify-content: space-between"><div class="popup-col-1" style="min-width: unset">${key}</div><div class="popup-col-2">${value}</div></div>`
            }
        }
    }
    return text;
}

function generateRulerPopupText(distance, id) {
    let _distObj = dF.convertDistance(distance);
    let _dist = {}
    _distObj.m < 10000
        ? _dist = {'value': _distObj.m, 'unit': 'm'}
        : _dist = {'value': _distObj.km, 'unit': 'km'};
    return `<strong>${dF.numberWithSpaces(_dist.value)} ${_dist.unit}</strong>`
        + `<span id="ruler-id-${id}" class="mdi mdi-icon-button mdi-delete-forever mdi-12px"></span>`
}

function generateHint(type) {
    if (type === 'point') {
        return '<p>You can add point by holding down the <kbd>shift</kbd> key while left-clicking on the map.</p>'
            + '<p>Click once to add one point.</p>'
    }
    if (type === 'circle') {
        return '<p>You can add circle by holding down the <kbd>shift</kbd> key while left-clicking on the map.</p>'
            + '<p>Click twice — first time to add center point and second for circle edge.</p>'
    }
    if (type === 'line') {
        return '<p>You can add line, polyline or polygon by holding down the <kbd>shift</kbd> key while left-clicking on the map.</p>'
            + '<p>Click on any temp marker to finish. If you click first marker at last it will be polygon, otherwise it will be polyline.</p>'
    }
    if (type === 'geojson') {
        return '<p>Standart GeoJSON.</p>'
    }
    if (type === 'array') {
        return '<p>Array of objects: <code>[{obj_1}, {obj_2}, ..., {obj_n}]</code>. '
            + '<a href="https://github.com/bazhanius/simple-geo-tool/#json-format">Learn more</a>.</p>'
    }
    return '';
}

export {
    generateArrowSVG,
    generateMarkerSVG,
    generateFullInfoContent,
    generateListObjectsTable,
    generatePopupText,
    generatePopupTextFromObj,
    generateRulerPopupText,
    generateHint
}