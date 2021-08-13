import * as settings from "./settings.js";
import { addAddressToDB, addAddressToPopup } from "./reverse-geocoding.js";
import * as dF from "./different-functions.js";
import { map } from "./create-map.js";
import { generateListObjectsTable , generatePopupText, generateArrowSVG } from "./html-generators.js";
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

            try {
                counter++;
                let type = obj.type;
                let coords = obj.coords;
                let list = [];
                let group;
                let radius = obj.radius ? obj.radius : null;
                let props = '';
                let color = obj.color || settings.objectParameters.color[type];
                let weight = obj.weight >=0 ? obj.weight : settings.objectParameters.lineWeight[type];
                let showMarkerPin = (typeof obj.showMarkerPin === 'boolean') ? obj.showMarkerPin : settings.objectParameters.markerPin[type];
                let showMarkerDot = (typeof obj.showMarkerDot === 'boolean') ? obj.showMarkerDot : settings.objectParameters.markerDot[type];
                let dashedLine = (typeof obj.dashedLine === 'boolean') ? obj.dashedLine : settings.objectParameters.lineDashed[type];
                let azimuth = obj.azimuth;
                let markerIcon = {
                    'pin': L.divIcon({
                        className: 'b-marker-icon',
                        html: `<div class='b-marker-icon-pin' style='background-color:${color}'></div>`
                            + `<b class='b-marker-icon-pin__content'>${counter}</b>`,
                        iconSize: [30, 42],
                        iconAnchor: [15, 42]
                    }),
                    'dot': L.divIcon({
                        className: 'b-marker-icon',
                        html: `<div class='b-marker-icon-dot' style='background-color:${color}'></div>`,
                        iconSize: [4, 4],
                        iconAnchor: [5, 5]
                    }),
                    'arrow': L.divIcon({
                        className: 'b-marker-icon',
                        html: generateArrowSVG(color, azimuth),
                        iconSize: [24, 24],
                        iconAnchor: [12, 12]
                    })
                };

                if (type === 'point') {
                    let _lat = coords[0].lat;
                    let _lon = coords[0].lon;
                    list.push(
                        L.marker([_lat, _lon], {
                            id: counter,
                            points: [1, 1],
                            latLon: [_lat, _lon],
                            icon: (azimuth >= 0 && azimuth <= 360)
                                ? markerIcon.arrow
                                : markerIcon.dot
                        }).bindPopup(generatePopupText(counter, 'Point', 1, 1, _lat, _lon))
                    );
                    if (showMarkerPin) {
                        list.push(
                            L.marker([_lat, _lon], {
                                id: counter,
                                points: [1, 1],
                                latLon: [_lat, _lon],
                                icon: markerIcon.pin
                            }).bindPopup(generatePopupText(counter, 'Point', 1, 1, _lat, _lon))
                        );
                    }
                    if (settings.mapParameters.onAddObject.reverseGeocode) addAddressToDB(_lat, _lon);
                }

                if (type === 'circle') {
                    props = dF.convertDistance(radius);
                    let _lat = coords[0].lat;
                    let _lon = coords[0].lon;
                    list.push(
                        L.circle([_lat, _lon], {
                            radius: radius,
                            color: color,
                            weight: weight,
                            dashArray: dashedLine ? `${weight}, ${weight * 2.5}` : null
                        })
                    );
                    if (showMarkerDot) {
                        list.push(
                            L.marker([_lat, _lon], {
                                id: counter,
                                points: [1, 1],
                                latLon: [_lat, _lon],
                                radius: radius,
                                icon: (azimuth >= 0 && azimuth <= 360) ? markerIcon.arrow : markerIcon.dot
                            }).bindPopup(generatePopupText(counter, 'Circle', 1, 1, _lat, _lon, props))
                        );
                    }
                    if (showMarkerPin) {
                        list.push(
                            L.marker([_lat, _lon], {
                                id: counter,
                                points: [1, 1],
                                latLon: [_lat, _lon],
                                radius: radius,
                                icon: markerIcon.pin
                            }).bindPopup(generatePopupText(counter, 'Circle', 1, 1, _lat, _lon, props))
                        );
                    }
                    if (settings.mapParameters.onAddObject.reverseGeocode) addAddressToDB(_lat, _lon);
                }

                if (type === 'polyline') {
                    let _points = coords.length;
                    let _latLons = [];
                    coords.forEach((el, i) => {
                        let _lat = el.lat;
                        let _lon = el.lon;
                        _latLons.push([_lat, _lon]);
                        if (showMarkerDot) {
                            list.push(
                                L.marker([_lat, _lon], {
                                    id: counter,
                                    points: [i + 1, _points],
                                    latLon: [_lat, _lon],
                                    icon: markerIcon.dot
                                }).bindPopup(generatePopupText(counter, 'Polyline', i + 1, _points, _lat, _lon))
                            );
                        }
                        if (showMarkerPin) {
                            list.push(
                                L.marker([_lat, _lon], {
                                    id: counter,
                                    points: [i + 1, _points],
                                    latLon: [_lat, _lon],
                                    icon: markerIcon.pin
                                }).bindPopup(generatePopupText(counter, 'Polyline', i + 1, _points, _lat, _lon))
                            );
                        }
                        if (settings.mapParameters.onAddObject.reverseGeocode) addAddressToDB(_lat, _lon);
                    });

                    props = dF.calcDistanceInPolyline(_latLons);

                    list.push(
                        L.polyline(_latLons, {
                            color: color,
                            weight: weight,
                            dashArray: dashedLine ? `${weight}, ${weight * 2.5}` : null
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
                        if (showMarkerDot) {
                            list.push(
                                L.marker([_lat, _lon], {
                                    id: counter,
                                    points: [i + 1, _points],
                                    latLon: [_lat, _lon],
                                    icon: markerIcon.dot
                                }).bindPopup(generatePopupText(counter, 'Polygon', i + 1, _points, _lat, _lon))
                            );
                        }
                        if (showMarkerPin) {
                            list.push(
                                L.marker([_lat, _lon], {
                                    id: counter,
                                    points: [i + 1, _points],
                                    latLon: [_lat, _lon],
                                    icon: markerIcon.pin
                                }).bindPopup(generatePopupText(counter, 'Polygon', i + 1, _points, _lat, _lon))
                            );
                        }
                        if (settings.mapParameters.onAddObject.reverseGeocode) addAddressToDB(_lat, _lon);
                    });

                    props = dF.calcPolygonArea(_latLons);

                    list.push(
                        L.polygon(_latLons, {
                            color: color,
                            weight: weight,
                            dashArray: dashedLine ? `${weight}, ${weight * 2.5}` : null
                        })
                    );

                }

                if (type === 'rectangle') {
                    let _latLons = [[coords[0].lat, coords[0].lon], [coords[1].lat, coords[1].lon]];
                    _latLons.forEach((el, i) => {
                        let _lat = el[0];
                        let _lon = el[1];
                        if (showMarkerDot) {
                            list.push(
                                L.marker([_lat, _lon], {
                                    id: counter,
                                    points: [i + 1, 2],
                                    latLon: [_lat, _lon],
                                    icon: markerIcon.dot
                                }).bindPopup(generatePopupText(counter, 'Rectangle', i + 1, 2, _lat, _lon))
                            );
                        }
                        if (showMarkerPin) {
                            list.push(
                                L.marker([_lat, _lon], {
                                    id: counter,
                                    points: [i + 1, 2],
                                    latLon: [_lat, _lon],
                                    icon: markerIcon.pin
                                }).bindPopup(generatePopupText(counter, 'Rectangle', i + 1, 2, _lat, _lon))
                            );
                        }
                        if (settings.mapParameters.onAddObject.reverseGeocode) addAddressToDB(_lat, _lon);
                    });

                    props = dF.calcPolygonArea([
                        [coords[0].lat, coords[0].lon], [coords[0].lat, coords[1].lon],
                        [coords[1].lat, coords[1].lon], [coords[1].lat, coords[0].lon]
                    ]);

                    list.push(
                        L.rectangle(_latLons, {
                            color: color,
                            weight: weight,
                            dashArray: dashedLine ? `${weight}, ${weight * 2.5}` : null
                        })
                    );

                }

                group = new L.featureGroup(list).addTo(map);

                let objectOnMap = {
                    'id': counter,
                    'type': type,
                    'object': obj,
                    'leaflet_object': group,
                    'measurements': props,
                    'color': color,
                    'weight': weight,
                    'show_marker_dot': showMarkerDot,
                    'show_marker_pin': showMarkerPin,
                    'azimuth': azimuth
                };

                objects.push(objectOnMap);

                // Add table row in list of objects
                objectsList.innerHTML += generateListObjectsTable(objectOnMap);

                buttons.updateObjectsManagementButtons();
                buttons.toggleObjectListButton();

                if (settings.mapParameters.onAddObject.reverseGeocode) addAddressToPopup(counter, objects);

                if (rulerButtonEnabled) manageObjects.disableAllPopups();

                return counter;
            } catch (e) {
                console.log(e);
                counter--;
                return -1;
            }

        },

        addArray: function(rawArray) {
            let counters = {
                'type': 'addArray',
                'payload': {
                    'points': 0,
                    'circles': 0,
                    'polylines': 0,
                    'polygones': 0,
                    'rectangles': 0,
                    'skipped': 0
                }
            };
            let arr = JSON.parse(rawArray);
            arr.forEach( (obj, i) => {
                let el = obj;
                if (obj.type === 'group') {
                    let tempObj = null;
                    let bounds = manageObjects.getBoundsByObjectIDs(obj.objectIDs);
                    if (bounds !== -1) {
                        if (obj.function === 'drawCircleBounds') {
                            tempObj = {
                                'type': 'circle',
                                'radius': bounds.radius,
                                'coords': [{'lat': bounds.center.lat, 'lon': bounds.center.lng}]
                            };

                        }
                        if (obj.function === 'drawRectangleBounds') {
                            tempObj = {
                                'type': 'rectangle',
                                'coords': [
                                    {'lat': bounds.southEast.lat, 'lon': bounds.southEast.lng},
                                    {'lat': bounds.northWest.lat, 'lon': bounds.northWest.lng}
                                ]
                            };
                        }
                        if (tempObj !== null) {
                            if (obj.color) tempObj.color = obj.color;
                            if (obj.weight >= 0) tempObj.weight = obj.weight;
                            if (obj.showMarkerDot === true) {
                                tempObj.showMarkerDot = true;
                            } else if (obj.showMarkerDot === false) {
                                tempObj.showMarkerDot = false;
                            }
                            if (obj.showMarkerPin === true) {
                                tempObj.showMarkerPin = true;
                            } else if (obj.showMarkerPin === false) {
                                tempObj.showMarkerPin = false;
                            }
                            el = tempObj;
                        }
                    }
                }
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
                        } else if (el.type === 'rectangle') {
                            counters.payload.rectangles += 1;
                        }
                    } else {
                        counters.payload.skipped += 1;
                    }
                } else {
                    counters.payload.skipped += 1;
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

        getBoundsByObjectIDs: function(listOfIDs) {
            try {
                let listOfObjects = [];
                listOfIDs.forEach(function(objID) {
                    let index = objects.findIndex(x => x.id === objID);
                    if (index !== -1) listOfObjects.push(objects[index].leaflet_object);
                });
                let group = new L.featureGroup(listOfObjects);
                let centerPoint = group.getBounds().getCenter();
                let NW = group.getBounds().getNorthWest();
                let SE = group.getBounds().getSouthEast();
                let NE = group.getBounds().getNorthEast();
                let SW = group.getBounds().getSouthWest();

                let distanseN = L.latLng(NE).distanceTo(NW);
                let distanseS = L.latLng(SE).distanceTo(SW);
                let distanseE = L.latLng(NE).distanceTo(SE);
                let distanseW = L.latLng(NW).distanceTo(SW);

                let radius = Math.max(distanseN, distanseS, distanseE, distanseW) / Math.sqrt(3);
                //let distanceFromCenterToNW = parseFloat(L.latLng(centerPoint).distanceTo(NW)).toFixed(0);
                return {
                    'center': centerPoint,
                    'radius': radius,
                    'northWest': NW,
                    'southEast': SE
                };
            } catch (e) {
                console.log(e);
                return -1;
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
        },

        getFullInfo: function(obj) {
            let row = obj.parentNode.parentNode;
            let id = parseInt(row.firstChild.textContent);
            let index = objects.findIndex(x => x.id === id);
            return objects[index];
        }

    }

}());

export {
    manageObjects,
    objects
};