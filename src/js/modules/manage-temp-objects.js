import { map } from "./create-map.js";
import { currentTab, getActiveTabName } from "./mdc-stuff.js";
import { manageObjects } from "./manage-objects.js";
import * as dF from "./different-functions.js";
import { buttons } from "./buttons-controllers.js";

/**
 *
 * Add object by clicking on map
 *
 */

let tabsNodeList = document.querySelectorAll('.mdc-tab');

tabsNodeList.forEach(function(el){
    el.addEventListener('click', function () {
        let currentTabName = this.getAttribute('data-tab-name');
        buttons.toggleAddToMapButtons(currentTabName);

        // Clear all temp objects on map
        tempCoords = [];
        tempMarker.clearLayers();
        if (tempCircle) {
            tempCircle.remove();
            tempCircle = undefined;
        }
        if (tempLine) {
            tempLine.remove();
            tempLine = undefined;
        }
        if (tempSecondMarkerPin) {
            tempSecondMarkerPin.remove();
            tempSecondMarkerPin = undefined;
        }
        if (tempSecondMarkerDot) {
            tempSecondMarkerDot.remove();
            tempSecondMarkerDot = undefined;
        }
    });
});

const Coordinates = L.Control.extend({
    onAdd: map => {
        const container = L.DomUtil.create("div");
        container.innerHTML = '<div class="mouse-cursor-helper">' +
            '<p id="mouse-coordinates">0, 0</p>' +
            '<p id="temp-object-summary"></p>' +
            '</div>';
        return container;
    }
});

map.addControl(new Coordinates({ position: "topright" }));

let mouseCoordinates = document.querySelector('#mouse-coordinates');
let tempObjectSummary = document.querySelector('#temp-object-summary');

let tempCoords = [];
let tempMarker = new L.featureGroup().addTo(map);
let tempSecondMarkerPin, tempSecondMarkerDot;
let tempCircle, tempLine;
let tempIconPin = L.divIcon({
    className: 'marker-icon-pin',
    html: "<div class='marker-pin marker-point-temp-color'></div><b>+</b>",
    iconSize: [30, 42],
    iconAnchor: [15, 42]
});

let tempIconDot = L.divIcon({
    className: 'marker-icon-dot marker-point-temp-color',
    iconSize: [4, 4],
    iconAnchor: [3, 3]
});

// Shift key pressed handler
let shift = false;
function shiftHandler(event) {
    shift = event.shiftKey;
    if (shift) {
        L.DomUtil.addClass(map._container,'crosshair-cursor-enabled');
    } else {
        L.DomUtil.removeClass(map._container,'crosshair-cursor-enabled');
    }
}
window.addEventListener("keydown", shiftHandler, false);
window.addEventListener("keypress", shiftHandler, false);
window.addEventListener("keyup", shiftHandler, false);

const finishMultiLine = (latLon) => {
    let type = (tempCoords[0].lat === latLon[0] && tempCoords[0].lon === latLon[1] && tempCoords.length > 2)
        ? 'polygon'
        : 'polyline';
    manageObjects.add({
        'type': type,
        'coords': tempCoords
    });
    tempMarker.clearLayers();
    tempCoords = [];
    tempSecondMarkerPin.remove();
    tempSecondMarkerDot.remove();
    tempLine.remove();
    tempLine = undefined;
};

map.on('click', function(e) {
    if (shift && currentTab !== 'array') {
        let currentTabName = getActiveTabName();

        tempCoords.push({
            'lat': parseFloat(e.latlng.lat).toFixed(6),
            'lon': parseFloat(e.latlng.lng).toFixed(6)
        });

        if (currentTabName === 'point' && shift) {
            manageObjects.add({
                'type': 'point',
                'coords': tempCoords
            });
            tempCoords = [];
        }

        if (currentTabName === 'circle' && shift) {
            if (tempCoords.length === 1) {
                tempCircle = L.circle([tempCoords[0].lat, tempCoords[0].lon], {
                    radius: 0,
                    weight: 2,
                    color: '#ff3',
                    opacity: 0.8,
                    fillOpacity: 0.1
                }).addTo(map);

                tempMarker.addLayer(
                    L.marker([tempCoords[0].lat, tempCoords[0].lon], {
                        icon: tempIconPin
                    })
                );

                tempMarker.addLayer(
                    L.marker([tempCoords[0].lat, tempCoords[0].lon], {
                        icon: tempIconDot
                    })
                );
            } else if (tempCoords.length >= 2) {
                manageObjects.add({
                    'type': 'circle',
                    'radius': parseFloat(L.latLng([tempCoords[0].lat, tempCoords[0].lon]).distanceTo([tempCoords[1].lat, tempCoords[1].lon])).toFixed(0),
                    'coords': tempCoords.splice(0, 1)
                });
                tempMarker.clearLayers();
                tempCoords = [];
                tempCircle.remove();
            }
        }

        if (currentTabName === 'line' && shift) {
            let lastPointIndex = tempCoords.length - 1;

            if (tempLine) {
                tempLine.setLatLngs(tempCoords);
            } else {
                tempLine = L.polyline(tempCoords, {
                    color: '#ff3',
                    weight: 2,
                    opacity: 0.6
                }).addTo(map);
            }

            tempMarker.addLayer(
                L.marker([tempCoords[lastPointIndex].lat, tempCoords[lastPointIndex].lon], {
                    icon: tempIconPin
                }).on('click', () => {
                    finishMultiLine([tempCoords[lastPointIndex].lat, tempCoords[lastPointIndex].lon]);
                })
            );

            tempMarker.addLayer(
                L.marker([tempCoords[lastPointIndex].lat, tempCoords[lastPointIndex].lon], {
                    icon: tempIconDot
                }).on('click', (e) => {
                    finishMultiLine([tempCoords[lastPointIndex].lat, tempCoords[lastPointIndex].lon]);
                })
            );

            if (tempSecondMarkerPin) {
                tempSecondMarkerPin.setLatLng([tempCoords[lastPointIndex].lat, tempCoords[lastPointIndex].lon]);
            } else {
                tempSecondMarkerPin = L.marker([tempCoords[lastPointIndex].lat, tempCoords[lastPointIndex].lon], {
                    icon: tempIconPin
                }).addTo(map);
            }

            if (tempSecondMarkerDot) {
                tempSecondMarkerDot.setLatLng([tempCoords[lastPointIndex].lat, tempCoords[lastPointIndex].lon]);
            } else {
                tempSecondMarkerDot = L.marker([tempCoords[lastPointIndex].lat, tempCoords[lastPointIndex].lon], {
                    icon: tempIconDot
                }).addTo(map);
            }

        }
    }

});

map.on("mousemove", e => {
    let _eLat = parseFloat(e.latlng.lat).toFixed(6);
    let _eLon = parseFloat(e.latlng.lng).toFixed(6);

    if (!tempCoords[0] && shift && tempLine && currentTab !== 'array') {
        tempSecondMarkerPin.setLatLng([_eLat, _eLon]);
        tempSecondMarkerDot.setLatLng([_eLat, _eLon]);
    }

    if (tempCoords[0]) {

        let tempDist = L.latLng([tempCoords[0].lat, tempCoords[0].lon]).distanceTo([_eLat, _eLon]).toFixed(0);
        mouseCoordinates.innerHTML = `<span class="mdi mdi-map-marker mdi-12px"></span> ${tempCoords[0].lat}, ${tempCoords[0].lon}`;
        tempObjectSummary.innerHTML = `<span class="mdi mdi-crosshairs mdi-12px"></span> ${_eLat}, ${_eLon}`;
        tempObjectSummary.innerHTML += `<br>${dF.numberWithSpaces(tempDist)} m`;

        if (tempCircle) {
            tempCircle.setRadius(tempDist);
        }
        if (tempLine) {
            tempSecondMarkerPin.setLatLng([_eLat, _eLon]);
            tempSecondMarkerDot.setLatLng([_eLat, _eLon]);
            tempLine.setLatLngs(tempCoords.concat({'lat':_eLat, 'lon':_eLon}));
        }
    } else {
        mouseCoordinates.innerHTML = `<span class="mdi mdi-crosshairs mdi-12px"></span> ${_eLat}, ${_eLon}`;
        tempObjectSummary.innerHTML = '';
    }

});

export {
    Coordinates,
    shift
};