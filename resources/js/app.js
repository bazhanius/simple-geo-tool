function ready() {

    let tabsNodeList = document.querySelectorAll('.mdc-tab');

    let buttonsHTML =
        '<button class="mdc-button mdc-button--dense mdc-ripple-upgraded button-object-locate" data-mdc-auto-init="MDCRipple">' +
        '<span class="mdi mdi-icon-button mdi-crosshairs-gps mdi-18px"></span></button>' +
        '<button class="mdc-button mdc-button--dense mdc-ripple-upgraded button-object-delete" data-mdc-auto-init="MDCRipple">' +
        '<span class="mdi mdi-icon-button mdi-delete-forever mdi-18px"></span></button>';

    let objectsList = document.querySelector('#objects-list > tbody');
    let counter = 0;
    let objects = [];



    /**
     *
     * Create the map
     *
     */

    let latLonExample = [55.752318, 37.619814];


    // Define free tile providers https://github.com/leaflet-extras/leaflet-providers
    let OSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
        }),
        Wikimedia = L.tileLayer('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png', {
            attribution: '<a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia</a>'
        }),
        CartoDB_Positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        });
        Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        });

    let map = L.map('map', {
        center: latLonExample,
        maxZoom: 19,
        zoom: 10,
        detectRetina: true,
        layers: [OSM]
    });

    let baseMaps = {
        "OpenStreetMap": OSM,
        "Wikimedia": Wikimedia,
        "CartoDB.Positron": CartoDB_Positron,
        "Esri.WorldImagery": Esri_WorldImagery
    };

    // Add layer control
    L.control.layers(baseMaps, null, { position: 'bottomright' }).addTo(map);

    // Add scale control
    L.control.scale().addTo(map);



    /**
     *
     * Trying to get user location
     *
     */

    const getUserLocation = () => {

        let userCoords = [];

        let options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        };

        function success(pos) {
            userCoords = [
                pos.coords.latitude,
                pos.coords.longitude,
                pos.coords.accuracy
            ];
            map.setView([userCoords[0], userCoords[1]], 10);
            let userLocObjID = manageObjects.add( 'circle', {'latOne': userCoords[0], 'lonOne': userCoords[1], 'rad': userCoords[2]} );
            manageObjects.locateByObjectID(userLocObjID);

        }

        function error(err) {
            console.warn(`ERROR(${err.code}): ${err.message}`);

        }

        navigator.geolocation.getCurrentPosition(success, error, options);

    };

    const UserLocation = L.Control.extend({
        onAdd: map => {
            const container = L.DomUtil.create("div");
            container.innerHTML = '<div class="user-location-control">' +
                '<span class="mdi mdi-near-me mdi-18px" title="My location"></span>' +
                '</div>';
            return container;
        }
    });

    map.addControl(new UserLocation({ position: "topleft" }));

    let userLocationButton = document.querySelector('.user-location-control');

    userLocationButton.addEventListener('click', function () {
        getUserLocation();
    });


    /**
     *
     * Add object by clicking on map
     *
     */

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

    map.on('click', function(e) {

        if (shift) {

            let currentTabName = getActiveTabName();

            tempCoords.push(e.latlng.lat, e.latlng.lng);

            if ( currentTabName === 'point' && shift) {
                manageObjects.add('point', {
                    'latOne': tempCoords[0],
                    'lonOne': tempCoords[1]
                });
                tempCoords = [];
            }


            if ( currentTabName === 'circle' && shift) {
                if ( tempCoords.length === 2 ) {

                    tempCircle = L.circle([tempCoords[0], tempCoords[1]], {
                        radius: 0,
                        weight: 2,
                        color: '#ff3',
                        opacity: 0.8,
                        fillOpacity: 0.1
                    }).addTo(map);

                    tempMarker.addLayer(
                        L.marker([tempCoords[0], tempCoords[1]], {
                            icon: tempIconPin
                        })
                    );

                    tempMarker.addLayer(
                        L.marker([tempCoords[0], tempCoords[1]], {
                            icon: tempIconDot
                        })
                    );

                } else if ( tempCoords.length >= 4 ) {
                    manageObjects.add('circle', {
                        'latOne': tempCoords[0],
                        'lonOne': tempCoords[1],
                        'rad':
                            L.latLng([tempCoords[0], tempCoords[1]]).distanceTo([tempCoords[2], tempCoords[3]]).toFixed(0)
                    });
                    tempMarker.clearLayers();
                    tempCoords = [];
                    tempCircle.remove();
                }
            }

            if ( currentTabName === 'line' && shift) {

                if ( tempCoords.length === 2 ) {

                    tempLine = L.polyline([ [tempCoords[0], tempCoords[1]], [tempCoords[0], tempCoords[1]] ], {
                        color: '#ff3',
                        weight: 2,
                        opacity: 0.6
                    }).addTo(map);

                    tempMarker.addLayer(
                        L.marker([tempCoords[0], tempCoords[1]], {
                            icon: tempIconPin
                        })
                    );

                    tempMarker.addLayer(
                        L.marker([tempCoords[0], tempCoords[1]], {
                            icon: tempIconDot
                        })
                    );

                    tempSecondMarkerPin = L.marker([tempCoords[0], tempCoords[1]], {
                        icon: tempIconPin
                    }).addTo(map);

                    tempSecondMarkerDot = L.marker([tempCoords[0], tempCoords[1]], {
                        icon: tempIconDot
                    }).addTo(map);

                } else if ( tempCoords.length >= 4 ) {

                    manageObjects.add('line', {
                        'latOne': tempCoords[0],
                        'lonOne': tempCoords[1],
                        'latTwo': tempCoords[2],
                        'lonTwo': tempCoords[3]
                    });
                    tempMarker.clearLayers();
                    tempCoords = [];
                    tempSecondMarkerPin.remove();
                    tempSecondMarkerDot.remove();
                    tempLine.remove();
                }
            }
        }

    });

    map.on("mousemove", e => {

        if (!tempCoords[0] && shift && tempLine) {
            tempSecondMarkerPin.setLatLng([e.latlng.lat.toFixed(6), e.latlng.lng.toFixed(6)]);
            tempSecondMarkerDot.setLatLng([e.latlng.lat.toFixed(6), e.latlng.lng.toFixed(6)]);
        }

        if (tempCoords[0]) {

            let tempDist = L.latLng([tempCoords[0].toFixed(6), tempCoords[1].toFixed(6)]).distanceTo([e.latlng.lat.toFixed(6), e.latlng.lng.toFixed(6)]).toFixed(0);

            mouseCoordinates.innerHTML = `<span class="mdi mdi-map-marker mdi-12px"></span> ${tempCoords[0].toFixed(6)}, ${tempCoords[1].toFixed(6)}`;
            tempObjectSummary.innerHTML = `<span class="mdi mdi-crosshairs mdi-12px"></span> ${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`;
            tempObjectSummary.innerHTML += `<br>${numberWithSpaces(tempDist)} m`;

            if (tempCircle) {
                tempCircle.setRadius(tempDist);
            }
            if (tempLine) {
                tempSecondMarkerPin.setLatLng([e.latlng.lat.toFixed(6), e.latlng.lng.toFixed(6)]);
                tempSecondMarkerDot.setLatLng([e.latlng.lat.toFixed(6), e.latlng.lng.toFixed(6)]);
                tempLine.setLatLngs([ [tempCoords[0], tempCoords[1]], [e.latlng.lat.toFixed(6), e.latlng.lng.toFixed(6)] ])
            }
        } else {
            mouseCoordinates.innerHTML = `<span class="mdi mdi-crosshairs mdi-12px"></span> ${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`;
            tempObjectSummary.innerHTML = '';
        }

    });



    /**
     *
     * Different functions
     *
     */

    const numberWithSpaces = (x) => {
        if (typeof x === 'undefined') {
            return "—";
        } else {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        }
    };

    const getActiveTabName = () => {
        return document.querySelector('.mdc-tab--active').getAttribute('data-tab-name');
    };



    /**
     *
     * All buttons controller
     *
     */

    const buttons = (function() {

        // "Add object" section buttons
        let _addToMapButton = document.querySelector('#button-add-to-map');
        let _clearFieldsButton = document.querySelector('#button-clear-fields');

        // "Objects" section buttons
        let _zoomAllObjectsButton = document.querySelector('#button-objects-zoom-all');
        let _deleteAllObjectsButton = document.querySelector('#button-objects-delete-all');

        return {

            applyClickEvents: function() {

                _addToMapButton.addEventListener('click', function () {
                    let currentTabName = getActiveTabName();
                    let values = inputFields.getValues(currentTabName);
                    let objLocID;
                    if ( currentTabName === 'point' ) {
                        objLocID = manageObjects.add( 'point', {'latOne': values.lat, 'lonOne': values.lon} );
                    } else if ( currentTabName === 'circle' ) {
                        objLocID = manageObjects.add( 'circle', {'latOne': values.lat, 'lonOne': values.lon, 'rad': values.rad} );
                    } else if ( currentTabName === 'line' ) {
                        objLocID = manageObjects.add( 'line', {'latOne': values.latOne, 'lonOne': values.lonOne, 'latTwo': values.latTwo, 'lonTwo': values.lonTwo} );
                    }
                    manageObjects.locateByObjectID(objLocID);
                });

                _clearFieldsButton.addEventListener('click', function() {
                    let currentTabName = getActiveTabName();
                    inputFields.clearValues(currentTabName);
                    buttons.toggleAddToMapButtons(currentTabName);
                });

                _zoomAllObjectsButton.addEventListener('click', function() {
                    manageObjects.showAll();
                });

                _deleteAllObjectsButton.addEventListener('click', function() {
                    manageObjects.deleteAll();
                });

            },

            updateObjectsManagementButtons: function() {

                let _objectLocateButtons = document.querySelectorAll('.button-object-locate');
                let _objectDeleteButton = document.querySelectorAll('.button-object-delete');


                _objectLocateButtons.forEach(function(el){
                    el.addEventListener('click', function () {
                        manageObjects.locateByNode(this);
                    });
                });

                _objectDeleteButton.forEach(function(el){
                    el.addEventListener('click', function () {

                        manageObjects.delete(this);
                        buttons.toggleObjectListButton();
                    });
                });

            },

            toggleAddToMapButtons: function (type) {
                let allGood = inputFields.validateValues(type);

                // Enable/Disable «Add to map» button
                allGood.indexOf(0) > -1
                    ? _addToMapButton.disabled = true
                    : _addToMapButton.disabled = false;

                // Enable/Disable «Clear All» button
                if ( allGood.indexOf(1) > -1 ) {
                    _clearFieldsButton.disabled = false
                } else {
                    _clearFieldsButton.disabled = true;
                    inputFields.clearValues(type);
                }
            },

            toggleObjectListButton: function () {
                let _objectsList = document.querySelector('#objects-list');
                if (objects.length > 0) {
                    _zoomAllObjectsButton.disabled = false;
                    _deleteAllObjectsButton.disabled = false;
                    _objectsList.style.visibility = 'visible';
                } else {
                    _zoomAllObjectsButton.disabled = true;
                    _deleteAllObjectsButton.disabled = true;
                    _objectsList.style.visibility = 'hidden';
                }
            }

        }

    }());




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

        return {

            getNodeList: function(type) {
                if ( type === 'point' ) {
                    return [
                        _pointFieldLat,
                        _pointFieldLon
                    ];
                } else if ( type === 'circle' ) {
                    return [
                        _circleFieldLat,
                        _circleFieldLon,
                        _circleFieldRad
                    ];
                } else if ( type === 'line' ) {
                    return [
                        _lineFieldLatOne,
                        _lineFieldLonOne,
                        _lineFieldLatTwo,
                        _lineFieldLonTwo
                    ];
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
                } else {
                    return {};
                }
            },

            clearValues: function(type) {
                if ( type === 'point' ) {
                    _pointFieldLat.value = '';
                    _pointFieldLon.value = '';
                    _pointFieldLat.parentNode.getElementsByTagName('label')[0].classList.remove('mdc-floating-label--float-above');
                    _pointFieldLon.parentNode.getElementsByTagName('label')[0].classList.remove('mdc-floating-label--float-above');
                    _pointFieldLat.parentNode.classList.remove('mdc-text-field--invalid');
                    _pointFieldLon.parentNode.classList.remove('mdc-text-field--invalid');
                    //_pointFieldLat.parentNode.classList.remove('mdc-text-field--focused');
                    //_pointFieldLon.parentNode.classList.remove('mdc-text-field--focused');
                } else if ( type === 'circle' ) {
                    _circleFieldLat.value = '';
                    _circleFieldLon.value = '';
                    _circleFieldRad.value = '';
                    _circleFieldLat.parentNode.getElementsByTagName('label')[0].classList.remove('mdc-floating-label--float-above');
                    _circleFieldLon.parentNode.getElementsByTagName('label')[0].classList.remove('mdc-floating-label--float-above');
                    _circleFieldRad.parentNode.getElementsByTagName('label')[0].classList.remove('mdc-floating-label--float-above');
                    _circleFieldLat.parentNode.classList.remove('mdc-text-field--invalid');
                    _circleFieldLon.parentNode.classList.remove('mdc-text-field--invalid');
                    _circleFieldRad.parentNode.classList.remove('mdc-text-field--invalid');
                    //_circleFieldLat.parentNode.classList.remove('mdc-text-field--focused');
                    //_circleFieldLon.parentNode.classList.remove('mdc-text-field--focused');
                    //_circleFieldRad.parentNode.classList.remove('mdc-text-field--focused');
                } else if ( type === 'line' ) {
                    _lineFieldLatOne.value = '';
                    _lineFieldLonOne.value = '';
                    _lineFieldLatTwo.value = '';
                    _lineFieldLonTwo.value = '';
                    _lineFieldLatOne.parentNode.getElementsByTagName('label')[0].classList.remove('mdc-floating-label--float-above');
                    _lineFieldLonOne.parentNode.getElementsByTagName('label')[0].classList.remove('mdc-floating-label--float-above');
                    _lineFieldLatTwo.parentNode.getElementsByTagName('label')[0].classList.remove('mdc-floating-label--float-above');
                    _lineFieldLonTwo.parentNode.getElementsByTagName('label')[0].classList.remove('mdc-floating-label--float-above');
                    _lineFieldLatOne.parentNode.classList.remove('mdc-text-field--invalid');
                    _lineFieldLonOne.parentNode.classList.remove('mdc-text-field--invalid');
                    _lineFieldLatTwo.parentNode.classList.remove('mdc-text-field--invalid');
                    _lineFieldLonTwo.parentNode.classList.remove('mdc-text-field--invalid');
                    //_lineFieldLatOne.parentNode.classList.remove('mdc-text-field--focused');
                    //_lineFieldLonOne.parentNode.classList.remove('mdc-text-field--focused');
                    //_lineFieldLatTwo.parentNode.classList.remove('mdc-text-field--focused');
                    //_lineFieldLonTwo.parentNode.classList.remove('mdc-text-field--focused');
                }
            },

            validateValues: function(type) {
                if ( type === 'point' ) {
                    let allGood = [0,0];
                    let v = inputFields.getValues('point');
                    v.lat && !isNaN(v.lat) && v.lat >= -90  && v.lat <= 90  ? allGood[0] = 1 : allGood[0] = 0;
                    v.lon && !isNaN(v.lon) && v.lon >= -180 && v.lon <= 180 ? allGood[1] = 1 : allGood[1] = 0;
                    return allGood;
                } else if ( type === 'circle' ) {
                    let allGood = [0,0,0];
                    let v = inputFields.getValues('circle');
                    v.lat && !isNaN(v.lat) && v.lat >= -90  && v.lat <= 90  ? allGood[0] = 1 : allGood[0] = 0;
                    v.lon && !isNaN(v.lon) && v.lon >= -180 && v.lon <= 180 ? allGood[1] = 1 : allGood[1] = 0;
                    v.rad && !isNaN(v.rad) && v.rad > 0 && v.rad <=1000000  ? allGood[2] = 1 : allGood[2] = 0;
                    return allGood;
                } else if ( type === 'line' ) {
                    let allGood = [0,0,0,0];
                    let v = inputFields.getValues('line');
                    v.latOne && !isNaN(v.latOne) && v.latOne >= -90  && v.latOne <= 90  ? allGood[0] = 1 : allGood[0] = 0;
                    v.lonOne && !isNaN(v.lonOne) && v.lonOne >= -180 && v.lonOne <= 180 ? allGood[1] = 1 : allGood[1] = 0;
                    v.latTwo && !isNaN(v.latTwo) && v.latTwo >= -90  && v.latTwo <= 90  ? allGood[2] = 1 : allGood[2] = 0;
                    v.lonTwo && !isNaN(v.lonTwo) && v.lonTwo >= -180 && v.lonTwo <= 180 ? allGood[3] = 1 : allGood[3] = 0;
                    return allGood;
                } else {
                    return [];
                }
            }

        }

    }());



    /**
     *
     * Almost all objects controller
     *
     */

    const manageObjects = (function() {

        return {

            add: function ( type, params ) {

                counter++;

                let _latOne = isNaN(params.latOne) ? params.latOne : parseFloat(params.latOne).toFixed(6);
                let _lonOne = isNaN(params.lonOne) ? params.lonOne : parseFloat(params.lonOne).toFixed(6);
                let _latTwo = isNaN(params.latTwo) ? params.latTwo : parseFloat(params.latTwo).toFixed(6);
                let _lonTwo = isNaN(params.lonTwo) ? params.lonTwo : parseFloat(params.lonTwo).toFixed(6);
                let _rad = params.rad;

                let list = [];
                let group;

                let markerOnePin;

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


                // Add a markerOne in the given location
                if ( typeof _latOne !== 'undefined' && typeof _lonOne !== 'undefined' ) {
                    list.push(
                        markerOnePin = L.marker([_latOne,_lonOne], {
                            icon: iconPin
                        }),

                        L.marker([_latOne,_lonOne], {
                            icon: iconDot
                        }).bindPopup(`${_latOne}°N, ${_lonOne}°E`)
                    );
                }


                // Add a markerTwo and Line in the given location
                if ( typeof _latTwo !== 'undefined' && typeof _latTwo !== 'undefined' ) {
                    let _distance = numberWithSpaces(L.latLng([_latOne, _lonOne]).distanceTo([_latTwo, _lonTwo]).toFixed(0));
                    list.push(
                        object = L.polyline([ [_latOne, _lonOne], [_latTwo, _lonTwo] ], {
                            color: '#f33',
                            weight: 3,
                            opacity: 0.6,
                        }).bindPopup(`Distance: ${numberWithSpaces(_distance)} m`),

                        L.marker([_latTwo, _lonTwo], {
                            icon: iconPin
                        }).bindPopup(`${_latTwo}°N, ${_lonTwo}°E`),

                        L.marker([_latTwo, _lonTwo], {
                            icon: iconDot
                        }).bindPopup(`${_latTwo}°N, ${_lonTwo}°E`)
                    );
                }

                if ( typeof _rad !== 'undefined' ) {
                    list.push(
                        L.circle([_latOne,_lonOne], {
                            radius: _rad,
                            weight: 1
                        })
                    );

                    markerOnePin.bindPopup(`${_latOne}°N, ${_lonOne}°E<br>Radius: ${numberWithSpaces(_rad)} m`)
                } else {
                    markerOnePin.bindPopup(`${_latOne}°N, ${_lonOne}°E`)
                }

                group = new L.featureGroup(list).addTo(map);

                // Add tooltips to markers

                if ( type === 'point' ) {
                    //group.bindTooltip(`<b>Object ID: ${counter}</b> (${type})<br>lat: ${_latOne}<br>lon: ${_lonOne}`);
                    objectsList.innerHTML += `<tr><td>${counter}</td><td>${type}</td><td>${_latOne} ${_lonOne}</td><td></td><td>${buttonsHTML}</td></tr>`;
                } else if ( type === 'circle' ) {
                    //group.bindTooltip(`<b>Object ID: ${counter}</b> (${type})<br>lat: ${_latOne}<br>lon: ${_lonOne}<br>rad: ${numberWithSpaces(_rad)} m`);
                    objectsList.innerHTML += `<tr><td>${counter}</td><td>${type}</td><td>${_latOne} ${_lonOne}</td><td>${numberWithSpaces(_rad)}</td><td>${buttonsHTML}</td></tr>`;
                } else if ( type === 'line' ) {
                    let _distance = numberWithSpaces(L.latLng([_latOne, _lonOne]).distanceTo([_latTwo, _lonTwo]).toFixed(0));
                    //group.bindTooltip(`<b>Object ID: ${counter}</b> (${type})<br>lat1: ${_latOne}<br>lon1: ${_lonOne}<br>lat2: ${_latTwo}<br>lon2: ${_lonTwo}<br>dis: ${distance} m`);
                    objectsList.innerHTML += `<tr><td>${counter}</td><td>${type}</td><td>${_latOne} ${_lonOne}<br>${_latTwo} ${_lonTwo}</td><td>${numberWithSpaces(_distance)}</td><td>${buttonsHTML}</td></tr>`;
                }


                let objectOnMap = {
                    'id': counter,
                    'type': type,
                    'object': group
                };

                objects.push(objectOnMap);

                buttons.updateObjectsManagementButtons();
                buttons.toggleObjectListButton();

                return counter;

            },

            delete: function(obj) {
                let row = obj.parentNode.parentNode;
                let id = parseInt(row.firstChild.textContent);
                let index = objects.findIndex(x => x.id === id);
                objects[index].object.clearLayers();
                objects.splice(index, 1);
                row.remove();
            },

            locateByNode: function(obj) {
                let row = obj.parentNode.parentNode;
                let id = parseInt(row.firstChild.textContent);
                let index = objects.findIndex(x => x.id === id);
                map.flyToBounds(objects[index].object.getBounds(), {padding: L.point(100, 100)});
            },

            locateByObjectID: function(id) {
                let index = objects.findIndex(x => x.id === id);
                if ( objects[index].type === 'point' ) {
                    map.flyToBounds(objects[index].object.getBounds(), {maxZoom: 12});
                } else {
                    map.flyToBounds(objects[index].object.getBounds(), {padding: L.point(100, 100)});
                }
            },

            deleteAll: function() {
                objects.forEach(function(obj) {
                    obj.object.clearLayers();
                });
                objects = [];
                objectsList.innerHTML = '';
                buttons.toggleObjectListButton();
            },

            showAll: function () {
                let q = [];
                objects.forEach(function(obj) {
                    q.push(obj.object);
                });
                if (q.length) {
                    let group = new L.featureGroup(q);
                    map.flyToBounds(group.getBounds(), {padding: L.point(30, 30)});
                }
            }

        }

    }());



    /**
     *
     * Different listeners
     *
     */

    tabsNodeList.forEach(function(el){
        el.addEventListener('click', function () {
            let currentTabName = getActiveTabName();
            buttons.toggleAddToMapButtons(currentTabName);
            tempCoords = [];
            tempMarker.clearLayers();
        });
    });

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



    /**
     * Initialize App
     */
    
    buttons.applyClickEvents();
    buttons.toggleAddToMapButtons(getActiveTabName());
    buttons.toggleObjectListButton();

}

document.addEventListener("DOMContentLoaded", ready);