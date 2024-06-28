import { generateHint } from "./html-generators.js";
import { isJSON, openInNewTab } from "./different-functions.js";
import { manageObjects } from "./manage-objects.js";

/**
 *
 * MDC (Material design components by Google) different stuff
 *
 */

window.mdc.autoInit();

let snackbar = new mdc.snackbar.MDCSnackbar(document.getElementById('b-mdc-snackbar'));
let snackbarContent = document.getElementById('b-mdc-snackbar-content');
snackbar.timeoutMs = 7500;
const setSnackbarContent = (obj) => {
    if (obj.type === 'addArray') {
        snackbarContent.innerHTML = `Added <strong>${obj.payload.points}</strong> point(s), `
            + `<strong>${obj.payload.circles}</strong> circle(s), `
            + `<strong>${obj.payload.polylines}</strong> polyline(s), `
            + `<strong>${obj.payload.polygones}</strong> polygone(s) `
            + `<strong>${obj.payload.rectangles}</strong> rectangle(s) and `
            + `<strong>${obj.payload.SVGs}</strong> SVG(s).<br>`
            + `Skipped <strong>${obj.payload.skipped}</strong> element(s).`
    } else {
        snackbarContent.innerHTML = obj.text;
    }
};

let tabBar = new mdc.tabBar.MDCTabBar(document.querySelector('.mdc-tab-bar'));
let contentEls = document.querySelectorAll('.mdc-tab-content');
let tabNames = ['point', 'circle', 'line', 'array'];
let currentTab = 'point';
let hintAboutTabs = document.getElementById('hint-about-tabs');
tabBar.listen('MDCTabBar:activated', function(event) {
    currentTab = tabNames[event.detail.index];
    // Hide currently-active content
    document.querySelector('.mdc-tab-content--active').classList.remove('mdc-tab-content--active');
    // Show content for newly-activated tab
    contentEls[event.detail.index].classList.add('mdc-tab-content--active');
    // Change the URL's hash with the tab name
    history.pushState('','','?tab=' + currentTab);
    hintAboutTabs.innerHTML = generateHint(currentTab);
});
const getActiveTabName = () => {
    return currentTab;
};
const checkSearchParams = () => {
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
            if (arrayCounters.payload.points + arrayCounters.payload.circles + arrayCounters.payload.polylines + arrayCounters.payload.polygones > 0) {
                manageObjects.showAll();
            }
            setSnackbarContent(arrayCounters);
            snackbar.close();
            snackbar.open();
        }
    } else {
        history.pushState({}, null, location.href.split('?')[0]);
    }
};

const dialogElement = document.querySelector('#b-mdc-modal-window');
const modalBackground = new mdc.dialog.MDCDialog(dialogElement);

dialogElement.querySelector('#dialog-confirm').onclick = function () {
    openInNewTab('https://yandex.com/support/common/browsers-settings/');
    modalBackground.close();
};

dialogElement.querySelector('#dialog-cancel').onclick = function () {
    modalBackground.close();
};

const objectFullInfo = new mdc.dialog.MDCDialog(document.querySelector('#b-mdc-modal-window-object-info'));
const objectFullInfoTitle = document.querySelector('#b-object-info-dialog-title');
const objectFullInfoContent = document.querySelector('#b-object-info-dialog-content');
const showObjectInfoModalWindow = (title, content) => {
    objectFullInfoTitle.innerHTML = title;
    objectFullInfoContent.innerHTML = content;
    objectFullInfo.open();
};

const objectSettings = new mdc.dialog.MDCDialog(document.querySelector('#b-mdc-modal-window-settings'));
const showObjectSettingsModalWindow = () => objectSettings.open();

export {
    currentTab,
    getActiveTabName,
    setSnackbarContent,
    checkSearchParams,
    showObjectInfoModalWindow,
    showObjectSettingsModalWindow,
    snackbar,
    modalBackground
};