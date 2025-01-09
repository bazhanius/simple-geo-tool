/**
 *
 * Create the map
 *
 */

let latLonExample = JSON.parse(localStorage.getItem('lastClickedLatLon')) || await getLocationByIP() || [55.752318, 37.619814];

async function getLocationByIP() {
    try {
        const response = await fetch("http://ip-api.com/json/");
        const json = await response.json();
        if (typeof json.lat === "number" && typeof json.lon === "number") {
            return [json.lat, json.lon];
        }
    } catch (error) {
        console.log(error)
    }
    return null;
}

// Define free tile providers https://github.com/leaflet-extras/leaflet-providers
let OSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
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
    Stadia_OSMBright = L.tileLayer('https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
    }),
    Stadia_AlidadeSmooth = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
    }),
    Wikimedia = L.tileLayer('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png', {
        attribution: '<a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia</a>'
    }),
    OpenRailwayMapInfrastructure = L.tileLayer('https://a.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png', {
        attribution: 'Рендеринг: OpenRailwayMap, Данные карты © участники OpenStreetMap'
    }),
    OpenRailwayMapMaxSpeed = L.tileLayer('https://a.tiles.openrailwaymap.org/maxspeed/{z}/{x}/{y}.png', {
        attribution: 'Рендеринг: OpenRailwayMap, Данные карты © участники OpenStreetMap'
    });

let map = L.map('map', {
    center: latLonExample,
    minZoom: 2,
    maxZoom: 18,
    zoomSnap: 1,
    //maxBounds: [[34.8, 18.4], [82.1, 192]],
    //maxBoundsViscocity: 1.0,
    zoom: 6,
    layers: [OSM]
});

map.attributionControl.setPrefix('Leaflet');

let baseMaps = {
    "OpenStreetMap": OSM,
    "CartoDB.Positron": CartoDB_Positron,
    "CartoDB.Voyager": CartoDB_Voyager,
    "Esri.WorldImagery": Esri_WorldImagery,
    "Stadia.OSMBright": Stadia_OSMBright,
    "Stadia.AlidadeSmooth": Stadia_AlidadeSmooth,
    "Wikimedia": Wikimedia
};

let baseLayers = {
    "OpenRailwayMap (infrastructure)": OpenRailwayMapInfrastructure,
    "OpenRailwayMap (maxspeeds)": OpenRailwayMapMaxSpeed
};

// Add layer control
L.control.layers(baseMaps, baseLayers, { position: 'bottomright' }).addTo(map);

// Add scale control
L.control.scale().addTo(map);

map.on('click', (e) => {
    localStorage.setItem('lastClickedLatLon', JSON.stringify([e.latlng.lat, e.latlng.lng]));
});

export { map };