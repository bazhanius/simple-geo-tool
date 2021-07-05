import { getActiveTabName } from "./mdc-stuff.js";
import { manageObjects, objects } from "./manage-objects.js";
import { inputFields } from './inputs-controllers.js';
import { snackbar, setSnackbarContent } from "./mdc-stuff.js";

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
    let _copyAllObjectsButton = document.querySelector('#button-objects-copy-all');
    let _zoomAllObjectsButton = document.querySelector('#button-objects-zoom-all');
    let _deleteAllObjectsButton = document.querySelector('#button-objects-delete-all');

    return {

        applyClickEvents: function() {

            _addToMapButton.addEventListener('click', function () {
                let currentTabName = getActiveTabName();
                let values = inputFields.getValues(currentTabName);
                let objLocID, arrayCounters;
                if (currentTabName === 'point') {
                    objLocID = manageObjects.add({
                        'type': 'point',
                        'coords': [{'lat': values.lat, 'lon': values.lon}]
                    });
                } else if (currentTabName === 'circle') {
                    objLocID = manageObjects.add({
                        'type': 'circle',
                        'coords': [{'lat': values.lat, 'lon': values.lon}],
                        'radius': values.rad
                    });
                } else if (currentTabName === 'line') {
                    objLocID = manageObjects.add({
                        'type': 'polyline',
                        'coords': [{'lat': values.latOne, 'lon': values.lonOne}, {'lat': values.latTwo, 'lon': values.lonTwo}]
                    });
                } else if (currentTabName === 'array') {
                    arrayCounters = manageObjects.addArray(values.arrayList);
                }
                if (currentTabName !== 'array') {
                    manageObjects.locateByObjectID(objLocID);
                } else {
                    if (arrayCounters.payload.points + arrayCounters.payload.circles + arrayCounters.payload.polylines + arrayCounters.payload.polygones > 0) {
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

            _copyAllObjectsButton.addEventListener('click', function() {
                manageObjects.copyAllToClipboard();
            });

            _zoomAllObjectsButton.addEventListener('click', function() {
                manageObjects.showAll();
            });

            _deleteAllObjectsButton.addEventListener('click', function() {
                manageObjects.deleteAll();
            });

        },

        updateObjectsManagementButtons: function() {

            let _objectCopyButtons = document.querySelectorAll('.button-object-copy');
            let _objectLocateButtons = document.querySelectorAll('.button-object-locate');
            let _objectDeleteButton = document.querySelectorAll('.button-object-delete');

            _objectCopyButtons.forEach(function(el){
                el.addEventListener('click', function () {
                    manageObjects.copyToClipboardByNode(this);
                });
            });

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
            _addToMapButton.disabled = allGood.indexOf(0) > -1;

            // Enable/Disable «Clear All» button
            _clearFieldsButton.disabled = allGood.indexOf(1) <= -1;
        },

        toggleObjectListButton: function () {
            let _objectsList = document.querySelector('#objects-list');
            if (objects.length > 0) {
                _copyAllObjectsButton.disabled = false;
                _zoomAllObjectsButton.disabled = false;
                _deleteAllObjectsButton.disabled = false;
                _objectsList.style.visibility = 'visible';
            } else {
                _copyAllObjectsButton.disabled = true;
                _zoomAllObjectsButton.disabled = true;
                _deleteAllObjectsButton.disabled = true;
                _objectsList.style.visibility = 'hidden';
            }
        }

    }

}());

export { buttons };