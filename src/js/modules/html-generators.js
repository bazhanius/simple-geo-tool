import * as dF from "./different-functions.js";

let buttonsHTML =
    '<button class="mdc-button button-object-copy" title="Copy JSON to clipboard"><span class="mdc-button__ripple"></span>' +
    '<span class="mdi mdi-icon-button mdi-content-copy mdi-18px"></span></button>' +
    '<button class="mdc-button button-object-locate" title="Locate on the map"><span class="mdc-button__ripple"></span>' +
    '<span class="mdi mdi-icon-button mdi-crosshairs-gps mdi-18px"></span></button>' +
    '<button class="mdc-button button-object-delete"  title="Delete object"><span class="mdc-button__ripple"></span>' +
    '<span class="mdi mdi-icon-button mdi-delete-forever mdi-18px"></span></button>';

function generateListObjectsTable(counter, type, props) {
    let properties = '';
    if (type === 'circle') {
        let _radius = dF.metersOrKilometers(parseFloat(props));
        properties = `≈ ${dF.numberWithSpaces(_radius.value)} ${_radius.unit}`;
    }
    if (type === 'polyline') {
        let _distance = dF.metersOrKilometers(props.m);
        properties = `≈ ${dF.numberWithSpaces(_distance.value)} ${_distance.unit}`;
    }
    if (type === 'polygon') {
        properties = (props.m2 > 10000)
            ? `≈ ${dF.numberWithSpaces(props.km2)} km<sup>2</sup>`
            : `≈ ${dF.numberWithSpaces(props.m2)} m<sup>2</sup>`;
    }
    return `<tr><td>${counter}</td><td>${type}</td><td>${properties}</td><td>${buttonsHTML}</td></tr>`;
}

function generatePopupText(id, type, point = 1, totalPoints = 1, lat, lon, rad = 0, area = 0, distance = 0) {
    let radius = (rad !== 0)
        ? `<div class="popup-row"><div class="popup-col-1">Radius:</div><div class="popup-col-2">${rad}</div></div>`
        : '';
    return `<div class="popup-row"><div class="popup-col-1">ID:</div><div class="popup-col-2">${id}</div></div>`
        + `<div class="popup-row"><div class="popup-col-1">Type:</div><div class="popup-col-2">${type}</div></div>`
        + `<div class="popup-row"><div class="popup-col-1">Points:</div><div class="popup-col-2">${point} / ${totalPoints}</div></div>`
        + `<div class="popup-row"><div class="popup-col-1">Lat, Lon:</div><div class="popup-col-2"><strong>${lat}, ${lon}</strong></div></div>`
        + `${radius}`;
}

function generateRulerPopupText(distance, id) {
    let _dist = dF.metersOrKilometers(distance);
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
    if (type === 'array') {
        return '<p>Array of objects: <code>[{obj_1}, {obj_2}, ..., {obj_n}]</code>.'
            + '<a href="https://github.com/bazhanius/simple-geo-tool/#add-array-of-coordinates-via-text-field">Learn more</a>.</p>'
    }
    return '';
}

export {
    generateListObjectsTable,
    generatePopupText,
    generateRulerPopupText,
    generateHint
}