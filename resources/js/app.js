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
    let addressesDB = [];

    function generatePopupText(lat, lon, addr = '', rad = 0) {
        let radius = ( rad !== 0 ) ? `Radius: <span class="popup-coords">${numberWithSpaces(rad)}</span> m` : '';
        return `<span class="popup-coords">${lat}</span>`
            +`, <span class="popup-coords">${lon}</span>`
            +`<div class="popup-address">${addr}</div>`
            + `${radius}`;
    }

    function generateRulerPopupText(distance, id) {
        let _dist = metersOrKilometers(distance);
        return `<strong>${numberWithSpaces(_dist.value)} ${_dist.unit}</strong>`
            + `<span id="ruler-id-${id}" class="mdi mdi-icon-button mdi-delete-forever mdi-12px"></span>`
    }



    /**
     *
     * Trying to get address from nominatim.openstreetmap.org
     *
     */

    // https://jsfiddle.net/dandv/47cbj/
    function RateLimit(fn, delay, context) {
        let queue = [], timer = null;

        function processQueue() {
            let item = queue.shift();
            if (item)
                fn.apply(item.context, item.arguments);
            if (queue.length === 0)
                clearInterval(timer), timer = null;
        }

        return function limited() {
            queue.push({
                context: context || this,
                arguments: [].slice.call(arguments)
            });
            if (!timer) {
                //processQueue();  // start immediately on the first invocation
                timer = setInterval(processQueue, delay);
            }
        }

    }

    function reverseGeocode(lat, lon) {

        lat = isNaN(lat) ? lat : parseFloat(lat).toFixed(6);
        lon = isNaN(lat) ? lon : parseFloat(lon).toFixed(6);

        // check cached address data
        let cachedAddress = addressesDB.filter(a => a.lat === lat).find(a => a.lon === lon);

        if ( !cachedAddress ) {
            fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`)
                .then(function(response) {
                    return response.json();
                })
                .then(function(myJson) {
                    let item = {
                        'lat': lat,
                        'lon': lon,
                        'address': myJson.display_name //+ '<br>' + myJson.licence // will be undefined if nominatim returns error
                    };

                    // add address to cache
                    addressesDB.push(item);
                });
        }
    }

    function popupUpdate(el) {
        let index = objects.findIndex(x => x.id === el);
        if ( index >= 0 ) {
            objects[index].object.getLayers().filter(l=>l instanceof L.Marker).forEach(l => {
                let lat = l.options.latLon[0];
                let lon = l.options.latLon[1];
                let addr = addressesDB.filter(a => a.lat === lat).find(a => a.lon === lon).address;
                if ( addr ) {
                    l.getPopup().setContent(generatePopupText(lat, lon, addr, l.options.rad));
                }
            });
        }
    }

    let addAddressToDB = RateLimit(reverseGeocode, 1100);
    let addAddressToPopup = RateLimit(popupUpdate, 3300);



    /**
     *
     * Create the map
     *
     */
    
    let latLonExample = JSON.parse(localStorage.getItem('lastClickedLatLon')) || [55.752318, 37.619814];

    // Define free tile providers https://github.com/leaflet-extras/leaflet-providers
    let OSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
        }),
        OSM_BW = L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
        }),
        Stadia_OSMBright = L.tileLayer('https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png', {
            maxZoom: 20,
            attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
        }),
        Stadia_AlidadeSmooth = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
            maxZoom: 20,
            attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
        }),
        CartoDB_Voyager = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd'
        }),
        CartoDB_Positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        }),
        Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        }),
        Stamen_Toner = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.{ext}', {
            attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            subdomains: 'abcd',
            minZoom: 0,
            maxZoom: 20,
            ext: 'png'
        }),
        Stamen_TonerBackground = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-background/{z}/{x}/{y}{r}.{ext}', {
            attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            subdomains: 'abcd',
            minZoom: 0,
            maxZoom: 20,
            ext: 'png'
        }),
        Wikimedia = L.tileLayer('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png', {
            attribution: '<a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia</a>'
        });

    let map = L.map('map', {
        center: latLonExample,
        maxZoom: 18,
        zoom: 10,
        layers: [OSM]
    });

    let baseMaps = {
        "OpenStreetMap": OSM,
        "OpenStreetMap Black And White": OSM_BW,
        "Stadia.OSMBright": Stadia_OSMBright,
        "Stadia.AlidadeSmooth": Stadia_AlidadeSmooth,
        "CartoDB.Positron": CartoDB_Positron,
        "CartoDB.Voyager": CartoDB_Voyager,
        "Esri.WorldImagery": Esri_WorldImagery,
        "Stamen.Toner": Stamen_Toner,
        "Stamen.TonerBackground": Stamen_TonerBackground,
        "Wikimedia": Wikimedia
    };

    // Add layer control
    L.control.layers(baseMaps, null, { position: 'bottomright' }).addTo(map);

    // Add scale control
    L.control.scale().addTo(map);

    map.on('click', (e) => {
        localStorage.setItem('lastClickedLatLon', JSON.stringify([e.latlng.lat, e.latlng.lng]));
    });



    /**
     *
     * Trying to get user location
     *
     */

    const UserLocation = L.Control.extend({
        onAdd: map => {
            const container = L.DomUtil.create("div");
            L.DomEvent.disableClickPropagation(container);
            container.innerHTML = '<div class="user-location-control">' +
                '<span class="mdi mdi-near-me mdi-18px" title="My location"></span>' +
                '</div>';
            return container;
        }
    });

    map.addControl(new UserLocation({ position: "topleft" }));

    const userLocationButton = document.querySelector('.user-location-control');
    const userLocationButtonIcon = userLocationButton.getElementsByTagName('SPAN')[0];

    userLocationButton.addEventListener('click', function () {
        getUserLocation();
    });

    const getUserLocation = () => {

        userLocationButtonIcon.classList.remove('mdi-near-me');
        userLocationButtonIcon.classList.add('mdi-loading', 'mdi-spin');

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

            userLocationButtonIcon.classList.remove('mdi-loading', 'mdi-spin');
            userLocationButtonIcon.classList.add('mdi-near-me');
        }

        function error(err) {
            console.warn(`ERROR(${err.code}): ${err.message}`);

            /*
            // https://developer.mozilla.org/ru/docs/Web/API/PositionError
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    document.getElementById("status").innerHTML = "You did not share geolocation data.";
                    break;
                case error.POSITION_UNAVAILABLE:
                    document.getElementById("status").innerHTML = "Could not detect your current position.";
                    break;
                case error.TIMEOUT:
                    document.getElementById("status").innerHTML = "Your browser has timed out.";
                    break;
                default:
                    document.getElementById("status").innerHTML = "An unknown error has occurred.";
                    break;
            }
            */
            userLocationButtonIcon.classList.remove('mdi-loading', 'mdi-spin');
            userLocationButtonIcon.classList.add('mdi-near-me');
            modalBackground.open();

        }

        navigator.geolocation.getCurrentPosition(success, error, options);
    };



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

        if (shift && currentTab !== 'array') {

            let currentTabName = getActiveTabName();

            tempCoords.push(e.latlng.lat, e.latlng.lng);

            if (currentTabName === 'point' && shift) {
                manageObjects.add('point', {
                    'latOne': tempCoords[0],
                    'lonOne': tempCoords[1]
                });
                tempCoords = [];
            }

            if (currentTabName === 'circle' && shift) {
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

                } else if (tempCoords.length >= 4) {
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

            if (currentTabName === 'line' && shift) {

                if (tempCoords.length === 2) {

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

                } else if (tempCoords.length >= 4) {

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

        if (!tempCoords[0] && shift && tempLine && currentTab !== 'array') {
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
            return {value: (meters / 1000).toFixed(1), unit: 'km'}
        } else {
            return {value: (meters).toFixed(0), unit: 'm'}
        }
    };

    const isLatitude  = num => !isNaN(num) && num !== '' && Math.abs(num) <= 90;
    const isLongitude = num => !isNaN(num) && num !== '' && Math.abs(num) <= 180;

    const isJSON = (str) => {
        if (str.length < 5) {
            return false;
        }
        try {
            return (JSON.parse(str));
        } catch (e) {
            return false;
        }
    };

    // Check [lat1, lon1] or [lat1, lon1, rad] or [[lat1, lon1], [lat2, lon2]] -> point or circle or line
    const typeOfObject = (arr) => {
        let objectsInArray = arr.length;
        if (objectsInArray === 2) {
            if (isLatitude(arr[0]) && isLongitude(arr[1])) {
                return 'point';
            } else if (typeOfObject(arr[0]) === 'point' && typeOfObject(arr[1]) === 'point') {
                return 'line';
            }
        }
        if (objectsInArray === 3 && isLatitude(arr[0]) && isLongitude(arr[1])
            && !isNaN(arr[2]) && arr[2] > 0 && arr[2] <= 1000000) {
            return 'circle';
        }
        return 'undefined';
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
                    let objLocID, arrayCounters;
                    if ( currentTabName === 'point' ) {
                        objLocID = manageObjects.add( 'point', {'latOne': values.lat, 'lonOne': values.lon} );
                    } else if ( currentTabName === 'circle' ) {
                        objLocID = manageObjects.add( 'circle', {'latOne': values.lat, 'lonOne': values.lon, 'rad': values.rad} );
                    } else if ( currentTabName === 'line' ) {
                        objLocID = manageObjects.add( 'line', {'latOne': values.latOne, 'lonOne': values.lonOne, 'latTwo': values.latTwo, 'lonTwo': values.lonTwo} );
                    } else if ( currentTabName === 'array' ) {
                        arrayCounters = manageObjects.addArray(values.arrayList);
                    }
                    if ( currentTabName !== 'array' ) {
                        manageObjects.locateByObjectID(objLocID);
                    } else {
                        if (arrayCounters.points + arrayCounters.circles + arrayCounters.lines > 0) {
                            manageObjects.showAll();
                        }
                        setSnackbarContent(arrayCounters);
                        snackbar.close();
                        snackbar.open();
                    }
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
                } else if ( type === 'array' ) {
                    _arrayList.value = '';
                }
            },

            validateValues: function(type) {
                if ( type === 'point' ) {
                    let allGood = [0,0,0];
                    let v = inputFields.getValues('point');
                    isLatitude(v.lat)  ? allGood[0] = 1 : allGood[0] = 0;
                    isLongitude(v.lon) ? allGood[1] = 1 : allGood[1] = 0;
                    v.lat || v.lon ? allGood[2] = 1 : allGood[2] = 0;
                    return allGood;
                } else if ( type === 'circle' ) {
                    let allGood = [0,0,0,0];
                    let v = inputFields.getValues('circle');
                    isLatitude(v.lat)  ? allGood[0] = 1 : allGood[0] = 0;
                    isLongitude(v.lon)  ? allGood[1] = 1 : allGood[1] = 0;
                    v.rad && !isNaN(v.rad) && v.rad > 0 && v.rad <= 1000000  ? allGood[2] = 1 : allGood[2] = 0;
                    v.lat || v.lon || v.rad ? allGood[3] = 1 : allGood[3] = 0;
                    return allGood;
                } else if ( type === 'line' ) {
                    let allGood = [0,0,0,0,0];
                    let v = inputFields.getValues('line');
                    isLatitude(v.latOne)  ? allGood[0] = 1 : allGood[0] = 0;
                    isLongitude(v.lonOne) ? allGood[1] = 1 : allGood[1] = 0;
                    isLatitude(v.latTwo)  ? allGood[2] = 1 : allGood[2] = 0;
                    isLongitude(v.lonTwo) ? allGood[3] = 1 : allGood[3] = 0;
                    v.latOne || v.lonOne || v.latTwo || v.lonTwo ? allGood[4] = 1 : allGood[4] = 0;
                    return allGood;
                } else if ( type === 'array' ) {
                    let allGood = [0,0,0];
                    let v = inputFields.getValues('array');
                    let re = new RegExp(/^[0-9\ \s*\.\,\-\[\]]*$/i);
                    v.arrayList && re.test(v.arrayList) ? allGood[0] = 1 : allGood[0] = 0;
                    v.arrayList ? allGood[1] = 1 : allGood[1] = 0;
                    isJSON(v.arrayList) ? allGood[2] = 1 : allGood[2] = 0;
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
                            id: 'first-marker-pin-' + counter,
                            latLon: [_latOne,_lonOne],
                            icon: iconPin
                        }),

                        L.marker([_latOne,_lonOne], {
                            id: 'first-marker-dot-' + counter,
                            latLon: [_latOne,_lonOne],
                            icon: iconDot
                        }).bindPopup(generatePopupText(_latOne, _lonOne))
                    );
                    addAddressToDB(_latOne, _lonOne);
                }


                // Add a markerTwo and Line in the given location
                if ( typeof _latTwo !== 'undefined' && typeof _latTwo !== 'undefined' ) {
                    let _distance = numberWithSpaces(L.latLng([_latOne, _lonOne]).distanceTo([_latTwo, _lonTwo]).toFixed(0));
                    list.push(
                        object = L.polyline([ [_latOne, _lonOne], [_latTwo, _lonTwo] ], {
                            color: '#f33',
                            weight: 3,
                            opacity: 0.6,
                        }).bindPopup(`Distance: ${_distance} m`),

                        L.marker([_latTwo, _lonTwo], {
                            id: 'second-marker-pin-' + counter,
                            latLon: [_latTwo, _lonTwo],
                            icon: iconPin
                        }).bindPopup(generatePopupText(_latTwo, _lonTwo)),

                        L.marker([_latTwo, _lonTwo], {
                            id: 'second-marker-dot-' + counter,
                            latLon: [_latTwo, _lonTwo],
                            icon: iconDot
                        }).bindPopup(generatePopupText(_latTwo, _lonTwo))
                    );
                    addAddressToDB(_latTwo, _lonTwo);
                }

                if ( typeof _rad !== 'undefined' ) {
                    list.push(
                        L.circle([_latOne,_lonOne], {
                            radius: _rad,
                            weight: 1
                        })
                    );

                    markerOnePin.options.rad = _rad;
                    markerOnePin.bindPopup(generatePopupText(_latOne, _lonOne, '', _rad));
                } else {
                    markerOnePin.bindPopup(generatePopupText(_latOne, _lonOne));
                }

                group = new L.featureGroup(list).addTo(map);

                // Add table row in list of objects
                if ( type === 'point' ) {
                    objectsList.innerHTML += `<tr><td>${counter}</td><td>${type}</td><td>${_latOne} ${_lonOne}</td><td></td><td>${buttonsHTML}</td></tr>`;
                } else if ( type === 'circle' ) {
                    objectsList.innerHTML += `<tr><td>${counter}</td><td>${type}</td><td>${_latOne} ${_lonOne}</td><td><span style="white-space: nowrap;">${numberWithSpaces(_rad)}</span></td><td>${buttonsHTML}</td></tr>`;
                } else if ( type === 'line' ) {
                    let _distance = numberWithSpaces(L.latLng([_latOne, _lonOne]).distanceTo([_latTwo, _lonTwo]).toFixed(0));
                    objectsList.innerHTML += `<tr><td>${counter}</td><td>${type}</td><td>${_latOne} ${_lonOne}<br>${_latTwo} ${_lonTwo}</td><td><span style="white-space: nowrap;">${_distance}</span></td><td>${buttonsHTML}</td></tr>`;
                }


                let objectOnMap = {
                    'id': counter,
                    'type': type,
                    'object': group
                };

                objects.push(objectOnMap);

                buttons.updateObjectsManagementButtons();
                buttons.toggleObjectListButton();

                addAddressToPopup(counter);

                if (rulerButtonEnabled) manageObjects.disableAllPopups();

                return counter;
            },

            addArray: function(rawArray) {
                let counters = {'points': 0, 'circles': 0, 'lines': 0, 'skipped': 0};
                let arr = JSON.parse(rawArray);
                let type = typeOfObject(arr);
                if (type === 'point') {
                    manageObjects.add( 'point', {'latOne': arr[0], 'lonOne': arr[1]} );
                    counters.points += 1;
                } else if (type === 'circle') {
                    manageObjects.add( 'circle', {'latOne': arr[0], 'lonOne': arr[1], 'rad': arr[2]} );
                    counters.circles += 1;
                } else if (type === 'line') {
                    manageObjects.add( 'line', {'latOne': arr[0][0], 'lonOne': arr[0][1], 'latTwo': arr[1][0], 'lonTwo': arr[1][1]} );
                    counters.lines += 1;
                } else if (arr[0][0]) {
                    arr.forEach(el => {
                        let type = typeOfObject(el);
                        if (type === 'point') {
                            manageObjects.add( 'point', {'latOne': el[0], 'lonOne': el[1]} );
                            counters.points += 1;
                        } else if (type === 'circle') {
                            manageObjects.add( 'circle', {'latOne': el[0], 'lonOne': el[1], 'rad': el[2]} );
                            counters.circles += 1;
                        } else if (type === 'line') {
                            manageObjects.add( 'line', {'latOne': el[0][0], 'lonOne': el[0][1], 'latTwo': el[1][0], 'lonTwo': el[1][1]} );
                            counters.lines += 1;
                        } else {
                            counters.skipped += 1;
                        }
                    });
                } else {
                    counters.skipped += 1;
                }
                return counters;
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
            },

            disableAllPopups: function() {
                objects.forEach(function(obj) {
                    obj.object.eachLayer(function (layer) {
                        if (layer instanceof L.Marker) {
                            layer.off('click');
                        }
                    });
                });
            },

            enableAllPopups: function() {
                objects.forEach(function(obj) {
                    obj.object.eachLayer(function (layer) {
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



    /**
     *
     * Different listeners
     *
     */

    tabsNodeList.forEach(function(el){
        el.addEventListener('click', function () {
            let currentTabName = this.getAttribute('data-tab-name');
            buttons.toggleAddToMapButtons(currentTabName);

            // Clear all temp objects on map
            tempCoords = [];
            tempMarker.clearLayers();
            if (tempCircle) tempCircle.remove();
            if (tempLine) tempLine.remove();
            if (tempSecondMarkerPin) tempSecondMarkerPin.remove();
            if (tempSecondMarkerDot) tempSecondMarkerDot.remove();
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

    inputFields.getNodeList('array').forEach(function (el) {
        el.addEventListener('keyup', function() {
            buttons.toggleAddToMapButtons('array');
        });
    });



    /**
     *
     * MDC different stuff
     *
     */

    window.mdc.autoInit();

    let snackbar = new mdc.snackbar.MDCSnackbar(document.getElementById('b-mdc-snackbar'));
    let snackbarContent = document.getElementById('b-mdc-snackbar-content');
    snackbar.timeoutMs = 7500;
    const setSnackbarContent = (obj) => {
        snackbarContent.innerHTML = `Added <strong>${obj.points}</strong> point(s), `
            + `<strong>${obj.circles}</strong> circle(s) and `
            + `<strong>${obj.lines}</strong> line(s).<br>`
            + `Skipped <strong>${obj.skipped}</strong> element(s).`
    };

    let tabBar = new mdc.tabBar.MDCTabBar(document.querySelector('.mdc-tab-bar'));
    let contentEls = document.querySelectorAll('.mdc-tab-content');
    let tabNames = ['point', 'circle', 'line', 'array'];
    let currentTab = 'point';
    let hintAboutShiftKey = document.getElementById('hint-about-shift-key');
    let hintAboutArrayOfCoords = document.getElementById('hint-about-array-of-coords');
    tabBar.listen('MDCTabBar:activated', function(event) {
        currentTab = tabNames[event.detail.index];
        // Hide currently-active content
        document.querySelector('.mdc-tab-content--active').classList.remove('mdc-tab-content--active');
        // Show content for newly-activated tab
        contentEls[event.detail.index].classList.add('mdc-tab-content--active');
        // Change the URL's hash with the tab name
        history.pushState('','','?tab=' + currentTab);
        if (currentTab === 'array') {
            hintAboutShiftKey.classList.add('meta-content__hidden');
            hintAboutArrayOfCoords.classList.remove('meta-content__hidden');
        } else {
            hintAboutShiftKey.classList.remove('meta-content__hidden');
            hintAboutArrayOfCoords.classList.add('meta-content__hidden');
        }
    });
    const getActiveTabName = () => {
        return currentTab;
    };
    // Check if tab set to "point", "circle", "line" or "array"
    let searchParams = new URLSearchParams(location.search);
    let searchParamTab = searchParams.get('tab');
    let searchParamAddArray = searchParams.get('addArray');
    if (searchParamTab === 'point') {
        tabBar.activateTab(0);
        currentTab = 'point';
    } else if (searchParamTab === 'circle') {
        tabBar.activateTab(1);
        currentTab = 'circle';
    } else if (searchParamTab === 'line') {
        tabBar.activateTab(2);
        currentTab = 'line';
    } else if (searchParamTab === 'array') {
        tabBar.activateTab(3);
        currentTab = 'array';
        if (searchParamAddArray && isJSON(searchParamAddArray)) {
            let arrayCounters = manageObjects.addArray(searchParamAddArray);
            if (arrayCounters.points + arrayCounters.circles + arrayCounters.lines > 0) {
                manageObjects.showAll();
            }
            setSnackbarContent(arrayCounters);
            snackbar.close();
            snackbar.open();
        }
    } else {
        history.pushState({}, null, location.href.split('?')[0]);
    }

    const dialogElement = document.querySelector('#b-mdc-modal-window');
    const modalBackground = new mdc.dialog.MDCDialog(dialogElement);

    dialogElement.querySelector('#dialog-confirm').onclick = function () {
        openInNewTab('https://yandex.com/support/common/browsers-settings/')
        modalBackground.close();
    };

    dialogElement.querySelector('#dialog-cancel').onclick = function () {
        modalBackground.close();
    };



    /**
     *
     * Initialize App
     *
     */
    
    buttons.applyClickEvents();
    buttons.toggleAddToMapButtons(getActiveTabName());
    buttons.toggleObjectListButton();

}

document.addEventListener("DOMContentLoaded", ready);