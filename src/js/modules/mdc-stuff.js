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
        let tempPayload = JSON.parse(JSON.stringify(obj.payload));
        let text = '';
        console.log(tempPayload);
        //tempPayload = tempPayload.filter(x => x !== 0);
        for (let key in tempPayload) {
            if (tempPayload[key] === 0 || key === 'skipped') delete tempPayload[key];
        }
        tempPayload = Object.keys(tempPayload);
        let length = tempPayload.length;
        if (length > 0) {
            text += 'Added'
            tempPayload.forEach((el, index) => {
                if (index !== length - 1) {
                    text += ` <strong>${obj.payload[el]}</strong> ${el},`
                } else {
                    text += ` <strong>${obj.payload[el]}</strong> ${el}.`
                }
            })
        } else {
            text += 'Noting to add.'
        }
        text += `<br>Skipped <strong>${obj.payload.skipped}</strong> element(s).`

        console.log(tempPayload);
        snackbarContent.innerHTML = text;
    } else {
        snackbarContent.innerHTML = obj.text;
    }
};

let tabBar = new mdc.tabBar.MDCTabBar(document.querySelector('.mdc-tab-bar'));
let contentEls = document.querySelectorAll('.mdc-tab-content');
let tabNames = ['point', 'circle', 'line', 'geojson', 'array'];
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
    } else if (searchParamTab === 'geojson') {
        tabBar.activateTab(3);
        currentTab = 'geojson';
    } else if (searchParamTab === 'array') {
        tabBar.activateTab(4);
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