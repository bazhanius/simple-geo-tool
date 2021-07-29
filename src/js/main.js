import { map } from './modules/create-map.js';
import { UserLocation } from './modules/user-location.js';
import { Coordinates } from './modules/manage-temp-objects.js';
import { addAddressToDB, addAddressToPopup } from './modules/reverse-geocoding.js';
import * as settings from './modules/settings.js';
import { manageObjects, objects } from './modules/manage-objects.js';
import { currentTab, getActiveTabName } from './modules/mdc-stuff.js';
import { buttons } from "./modules/buttons-controllers.js";
import { checkSearchParams } from "./modules/mdc-stuff.js";

function ready() {

    /**
     *
     * Initialize App
     *
     */
    
    buttons.applyClickEvents();
    buttons.toggleAddToMapButtons(getActiveTabName());
    buttons.toggleObjectListButton();
    checkSearchParams();
    settings.checkSettingsInLocalStorage();
    settings.loadSettingsIntoHTMLDOM();
}

document.addEventListener("DOMContentLoaded", ready);