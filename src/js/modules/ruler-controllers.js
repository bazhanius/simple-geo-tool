import { map } from './create-map.js';
import { manageObjects } from './manage-objects.js';

/**
 *
 * Add ruler control
 *
 */

const ruler = L.Control.extend({
    onAdd: map => {
        const container = L.DomUtil.create('div');
        L.DomEvent.disableClickPropagation(container);
        container.innerHTML = '<div class="ruler-control">' +
            '<div class="ruler-control-polyline mdi mdi-ruler mdi-18px" title="Ruler"></div>' +
            //'<div class="ruler-control-polygon mdi mdi-vector-polygon mdi-18px" title="Area"></div>' +
            '</div>';
        return container;
    }
});

map.addControl(new ruler({ position: "topleft" }));

// Create pane for ruler objects, and set z-index to be on top
map.createPane("rulerLinesPane");
map.getPane("rulerLinesPane").style.zIndex = 650;
map.createPane("rulerMarkersPane");
map.getPane("rulerMarkersPane").style.zIndex = 651;

const rulerButtonPolyline = document.querySelector('.ruler-control-polyline');
let rulerButtonEnabled = false;
let rulerPolyline = new L.featureGroup().addTo(map);
let rulerPolylineLatLngs = [];
let rulerlastMarker = null;

// Add empty polyline
const initRulerPolyline = () => {
    rulerPolyline.addLayer(
        L.polyline([], {
            className: 'ruler-polyline-path-bg',
            pane: 'rulerLinesPane'
        }).addTo(map)
    );
    rulerPolyline.addLayer(
        L.polyline([], {
            className: 'ruler-polyline-path',
            pane: 'rulerLinesPane'
        }).addTo(map)
    );
};

initRulerPolyline();

rulerButtonPolyline.addEventListener('click', function () {
    if (rulerButtonEnabled === false) {
        rulerButtonPolyline.classList.add("ruler-control__active");
        L.DomUtil.addClass(map._container,'crosshair-cursor-enabled');
        rulerButtonEnabled = true;
        manageObjects.disableAllPopups();
    } else {
        rulerButtonPolyline.classList.remove("ruler-control__active");
        L.DomUtil.removeClass(map._container,'crosshair-cursor-enabled');
        rulerButtonEnabled = false;
        rulerPolyline.clearLayers();
        initRulerPolyline();
        rulerPolylineLatLngs = [];
        manageObjects.enableAllPopups();
    }
});

const getMarkersInFeatureGroup = (obj) => {
    let arr = [];
    obj.eachLayer(function (layer) {
        if (layer instanceof L.Marker) {
            arr.push(layer.getLatLng());
        }
    });
    return [arr]
};

// Ruler marker drag handlers
function rulerMarkerDragStartHandler() {
    rulerPolyline.eachLayer(function (layer) {
        if (layer instanceof L.Marker) layer.closePopup();
    });
}
function rulerMarkerDragHandler() {
    drawRulerPolyline();
}
function rulerMarkerDragEndHandler() {
    drawRulerPolyline();
    addDeleteButtonToRulerPopup(rulerlastMarker._leaflet_id);
}

const drawRulerPolyline = (lat, lon) => {

    if (lat && lon) {
        let IconDot = L.divIcon({
            className: 'marker-icon-pin',
            html: "<div class='ruler-marker-pin'></div>",
            iconSize: [15, 15],
            iconAnchor: [0, 0]
        });

        let marker = L.marker([lat, lon], {
            icon: IconDot,
            draggable: true,
            pane: 'rulerMarkersPane'
        })
            .on('dragstart', rulerMarkerDragStartHandler)
            .on('drag', rulerMarkerDragHandler)
            .on('dragend', rulerMarkerDragEndHandler)
            .on('popupopen', (e) => {
                addDeleteButtonToRulerPopup(e.popup._source._leaflet_id);
            })
            .addTo(map);

        rulerPolyline.addLayer(marker);
    }

    rulerPolylineLatLngs = getMarkersInFeatureGroup(rulerPolyline);

    rulerPolyline.eachLayer(function (layer) {
        if (layer instanceof L.Polyline) {
            layer.setLatLngs(rulerPolylineLatLngs);
        }
    });

    measureDistanceInPolyline();

};

const measureDistanceInPolyline = () => {
    let _distance = 0;
    let _previousPoint = null;

    rulerPolyline.eachLayer(function (layer) {

        if (layer instanceof L.Marker) {
            let _latLng = layer.getLatLng();
            if (_previousPoint) {
                _distance += _previousPoint.distanceTo(_latLng);
            }
            _previousPoint = _latLng;

            let _popupContent = generateRulerPopupText(_distance, layer._leaflet_id);
            let _popup = layer.getPopup();
            if (_popup) {
                _popup.setContent(_popupContent);
            } else {
                layer.bindPopup(_popupContent, {
                    className : 'ruler-marker-pin-popup',
                    offset: [0, -12],
                    minWidth: 20,
                    closeButton: false,
                    autoClose: false
                })
                    .addTo(map);
            }

            rulerlastMarker = layer;
        }
    });

    if (rulerlastMarker) {
        rulerlastMarker.openPopup();
    }

};

//rulerPolyline.on("click", (e) => {
//console.log("Clicked on marker " + e.layer._leaflet_id);
//});

// Add delete button in ruler marker's popup
const addDeleteButtonToRulerPopup = (layer_id) => {
    let _popupDelButton = document.querySelector('#ruler-id-' + layer_id);
    if (_popupDelButton) {
        _popupDelButton.addEventListener('click', function () {
            rulerPolyline.removeLayer(layer_id);
            drawRulerPolyline();
        });
    }
};

// Add ruler objects to map if ruler button enabled
map.on('click', function(e) {
    if (rulerButtonEnabled && !shift) {
        drawRulerPolyline(e.latlng.lat, e.latlng.lng);
    }
});

export { rulerButtonEnabled };