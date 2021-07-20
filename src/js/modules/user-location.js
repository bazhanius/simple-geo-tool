import { map } from "./create-map.js";
import { manageObjects } from "./manage-objects.js";
import { modalBackground } from "./mdc-stuff.js";

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
        let userLocObjID = manageObjects.add('circle', [userCoords[0], userCoords[1], userCoords[2]]);
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

export { UserLocation };