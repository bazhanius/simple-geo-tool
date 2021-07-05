import * as settings from "./settings.js";
import { addAddressToDB, addAddressToPopup } from "./reverse-geocoding.js";
import * as dF from "./different-functions.js";
import { map } from "./create-map.js";
import { generateListObjectsTable , generatePopupText } from "./html-generators.js";
import { buttons } from "./buttons-controllers.js";
import { rulerButtonEnabled } from './ruler-controllers.js';

/**
 *
 * Almost all objects controller
 *
 */

let counter = 0;
let objects = [];
let objectsList = document.querySelector('#objects-list > tbody');

const manageObjects = (function() {

    return {

        add: function (obj) {
            let type = obj.type;
            let coords = obj.coords;
            let radius = obj.radius ? obj.radius : null;
            let props = '';

            if (type && coords) {
                counter++;
                let list = [];
                let group;

                let iconPin = L.divIcon({
                    className: 'marker-icon-pin',
                    html: "<div class='marker-pin marker-" + type + "-color'></div><b>" + counter + "</b>",
                    iconSize: [30, 42],
                    iconAnchor: [15, 42]
                });

                let iconDot = L.divIcon({
                    className: 'marker-icon-dot marker-' + type + '-color',
                    iconSize: [4, 4],
                    iconAnchor: [3, 3]
                });

                if (type === 'point') {
                    let _lat = coords[0].lat;
                    let _lon = coords[0].lon;
                    list.push(
                        L.marker([_lat, _lon], {
                            id: counter,
                            points: [1, 1],
                            latLon: [_lat, _lon],
                            icon: iconDot
                        }).bindPopup(generatePopupText(counter, 'Point', 1, 1, _lat, _lon))
                    );
                    if (settings.showMarker) {
                        list.push(
                            L.marker([_lat, _lon], {
                                id: counter,
                                points: [1, 1],
                                latLon: [_lat, _lon],
                                icon: iconPin
                            }).bindPopup(generatePopupText(counter, 'Point', 1, 1, _lat, _lon))
                        );
                    }
                    addAddressToDB(_lat, _lon);
                }

                if (type === 'circle') {
                    props = '≈ ' + dF.numberWithSpaces(radius) + ' m';
                    let _lat = coords[0].lat;
                    let _lon = coords[0].lon;
                    list.push(
                        L.circle([_lat,_lon], {
                            radius: radius,
                            weight: settings.lineWeight
                        }),

                        L.marker([_lat, _lon], {
                            id: counter,
                            points: [1, 1],
                            latLon: [_lat, _lon],
                            radius: radius,
                            icon: iconDot
                        }).bindPopup(generatePopupText(counter, 'Circle', 1, 1, _lat, _lon, props))
                    );
                    if (settings.showMarker) {
                        list.push(
                            L.marker([_lat, _lon], {
                                id: counter,
                                points: [1, 1],
                                latLon: [_lat, _lon],
                                radius: radius,
                                icon: iconPin
                            }).bindPopup(generatePopupText(counter, 'Circle', 1, 1, _lat, _lon, props))
                        );
                    }
                    addAddressToDB(_lat, _lon);
                }

                if (type === 'polyline') {
                    let _points = coords.length;
                    let _latLons = [];
                    coords.forEach((el, i) => {
                        let _lat = el.lat;
                        let _lon = el.lon;
                        _latLons.push([_lat, _lon]);
                        list.push(
                            L.marker([_lat, _lon], {
                                id: counter,
                                points: [i + 1, _points],
                                latLon: [_lat, _lon],
                                icon: iconDot
                            }).bindPopup(generatePopupText(counter, 'Polyline', i+1, _points, _lat, _lon))
                        );
                        if (settings.showMarker) {
                            list.push(
                                L.marker([_lat, _lon], {
                                    id: counter,
                                    points: [i + 1, _points],
                                    latLon: [_lat, _lon],
                                    icon: iconPin
                                }).bindPopup(generatePopupText(counter, 'Polyline', i+1, _points, _lat, _lon))
                            );
                        }
                        addAddressToDB(_lat, _lon);
                    });

                    props = '≈ ' + dF.numberWithSpaces(dF.calcDistanceInPolyline(_latLons, 'km')) + ' km';

                    list.push(
                        L.polyline(_latLons, {
                            color: '#f33',
                            weight: settings.lineWeight
                        })
                    );

                }

                if (type === 'polygon') {
                    let _points = coords.length;
                    let _latLons = [];
                    coords.forEach((el, i) => {
                        let _lat = el.lat;
                        let _lon = el.lon;
                        _latLons.push([_lat, _lon]);
                        list.push(
                            L.marker([_lat, _lon], {
                                id: counter,
                                points: [i + 1, _points],
                                latLon: [_lat, _lon],
                                icon: iconDot
                            }).bindPopup(generatePopupText(counter, 'Polygon', i+1, _points, _lat, _lon))
                        );
                        if (settings.showMarker) {
                            list.push(
                                L.marker([_lat, _lon], {
                                    id: counter,
                                    points: [i + 1, _points],
                                    latLon: [_lat, _lon],
                                    icon: iconPin
                                }).bindPopup(generatePopupText(counter, 'Polygon', i+1, _points, _lat, _lon))
                            );
                        }
                        addAddressToDB(_lat, _lon);
                    });

                    props = '≈ ' + dF.numberWithSpaces(dF.calcPolygonArea(_latLons, 'km2')) + ' km<sup>2</sup>';

                    list.push(
                        L.polygon(_latLons, {
                            color: '#080',
                            weight: settings.lineWeight
                        })
                    );

                }

                group = new L.featureGroup(list).addTo(map);

                // Add table row in list of objects
                objectsList.innerHTML += generateListObjectsTable(counter, type, props);

                let objectOnMap = {
                    'id': counter,
                    'type': type,
                    'object': obj,
                    'leaflet_object': group,
                    'measurements': props
                };

                objects.push(objectOnMap);

                buttons.updateObjectsManagementButtons();
                buttons.toggleObjectListButton();

                addAddressToPopup(counter, objects);

                if (rulerButtonEnabled) manageObjects.disableAllPopups();

            }

            return counter;
        },

        addArray: function(rawArray) {
            let counters = {
                'type': 'addArray',
                'payload': {
                    'points': 0,
                    'circles': 0,
                    'polylines': 0,
                    'polygones': 0,
                    'skipped': 0}
            };
            let arr = JSON.parse(rawArray);
            arr.forEach( (el, i) => {
                if (el.type && el.coords) {
                    let id = manageObjects.add(el);
                    if (id > 0) {
                        if (el.type === 'point') {
                            counters.payload.points += 1;
                        } else if (el.type === 'circle') {
                            counters.payload.circles += 1;
                        } else if (el.type === 'polyline') {
                            counters.payload.polylines += 1;
                        } else if (el.type === 'polygon') {
                            counters.payload.polygones += 1;
                        }
                    } else {
                        counters.payload.skipped += 1;
                    }
                } else {
                    counters.skipped += 1;
                }
            });
            return counters;
        },

        delete: function(obj) {
            let row = obj.parentNode.parentNode;
            let id = parseInt(row.firstChild.textContent);
            let index = objects.findIndex(x => x.id === id);
            objects[index].leaflet_object.clearLayers();
            objects.splice(index, 1);
            row.remove();
        },

        copyAllToClipboard: function() {
            let list = [];
            objects.forEach(function(obj) {
                list.push(obj.object);
            });
            dF.copyToClipboard(JSON.stringify(list), 'all objects');
        },

        copyToClipboardByNode: function(obj) {
            let row = obj.parentNode.parentNode;
            let id = parseInt(row.firstChild.textContent);
            let index = objects.findIndex(x => x.id === id);
            dF.copyToClipboard('[' + JSON.stringify(objects[index].object) + ']', objects[index].type);
        },

        locateByNode: function(obj) {
            let row = obj.parentNode.parentNode;
            let id = parseInt(row.firstChild.textContent);
            let index = objects.findIndex(x => x.id === id);
            map.flyToBounds(objects[index].leaflet_object.getBounds(), {padding: L.point(100, 100)});
        },

        locateByObjectID: function(id) {
            let index = objects.findIndex(x => x.id === id);
            if ( objects[index].type === 'point' ) {
                map.flyToBounds(objects[index].leaflet_object.getBounds(), {maxZoom: 12});
            } else {
                map.flyToBounds(objects[index].leaflet_object.getBounds(), {padding: L.point(100, 100)});
            }
        },

        deleteAll: function() {
            objects.forEach(function(obj) {
                obj.leaflet_object.clearLayers();
            });
            objects = [];
            objectsList.innerHTML = '';
            buttons.toggleObjectListButton();
        },

        showAll: function () {
            let q = [];
            objects.forEach(function(obj) {
                q.push(obj.leaflet_object);
            });
            if (q.length) {
                let group = new L.featureGroup(q);
                map.flyToBounds(group.getBounds(), {padding: L.point(30, 30)});
            }
        },

        disableAllPopups: function() {
            objects.forEach(function(obj) {
                obj.leaflet_object.eachLayer(function (layer) {
                    if (layer instanceof L.Marker) {
                        layer.off('click');
                    }
                });
            });
        },

        enableAllPopups: function() {
            objects.forEach(function(obj) {
                obj.leaflet_object.eachLayer(function (layer) {
                    if (layer instanceof L.Marker) {
                        layer.on('click', function () {
                            if (layer.getPopup()) {
                                layer.openPopup()
                            }
                        });
                    }
                });
            });
        }

    }

}());

export {
    manageObjects,
    objects
};