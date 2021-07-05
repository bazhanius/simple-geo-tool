import * as dF from "./different-functions.js";

let buttonsHTML =
    '<button class="mdc-button button-object-copy" title="Copy JSON to clipboard"><span class="mdc-button__ripple"></span>' +
    '<span class="mdi mdi-icon-button mdi-content-copy mdi-18px"></span></button>' +
    '<button class="mdc-button button-object-locate" title="Locate on the map"><span class="mdc-button__ripple"></span>' +
    '<span class="mdi mdi-icon-button mdi-crosshairs-gps mdi-18px"></span></button>' +
    '<button class="mdc-button button-object-delete"  title="Delete object"><span class="mdc-button__ripple"></span>' +
    '<span class="mdi mdi-icon-button mdi-delete-forever mdi-18px"></span></button>';

function generateListObjectsTable(counter, type, props) {
    return `<tr><td>${counter}</td><td>${type}</td><td>${props}</td><td>${buttonsHTML}</td></tr>`;
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

export {
    generateListObjectsTable,
    generatePopupText,
    generateRulerPopupText
}