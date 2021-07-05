/**
 *
 * Trying to get address from nominatim.openstreetmap.org
 *
 */

let addressesDB = [];

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

function popupUpdate(el, objects) {
    let index = objects.findIndex(x => x.id === el);
    if (index >= 0) {
        objects[index].leaflet_object.getLayers().filter(l=>l instanceof L.Marker).forEach(l => {
            let lat = l.options.latLon[0];
            let lon = l.options.latLon[1];
            let addr = addressesDB.filter(a => a.lat === lat).find(a => a.lon === lon).address;
            if (addr) {
                let popupHTML = l.getPopup().getContent();
                let addHTML = `<div class="popup-row">` +
                    `<div class="popup-col-1">Address:</div><div class="popup-col-2"><small>${addr}</small></div></div>`;
                l.getPopup().setContent(popupHTML + addHTML);
            }
        });
    }
}

let addAddressToDB = RateLimit(reverseGeocode, 1100);
let addAddressToPopup = RateLimit(popupUpdate, 5500);

export {
    addAddressToDB,
    addAddressToPopup
}