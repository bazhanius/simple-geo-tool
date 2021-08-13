const mapParameters = {
    'onAddObject': {'flyTo': true},
    resetToDefault: function() {
        this.onAddObject = {'flyTo': true};
    }
};

const objectParameters = {
    'markerPin': {'point': true, 'circle': true, 'polyline': true, 'polygon': true, 'rectangle': true},
    'markerDot': {'point': true, 'circle': true, 'polyline': true, 'polygon': true, 'rectangle': true},
    'color': {'point': '#6e14ef', 'circle': '#3388ff', 'polyline': '#ff3333', 'polygon': '#008000', 'rectangle': '#801900'},
    'lineWeight': {'point': null, 'circle': 2, 'polyline': 2, 'polygon': 2, 'rectangle': 2},
    'lineDashed': {'point': null, 'circle': false, 'polyline': false, 'polygon': false, 'rectangle': false},
    resetToDefault: function() {
        this.markerPin = {'point': true, 'circle': true, 'polyline': true, 'polygon': true, 'rectangle': true};
        this.markerDot = {'point': true, 'circle': true, 'polyline': true, 'polygon': true, 'rectangle': true};
        this.color = {'point': '#6e14ef', 'circle': '#3388ff', 'polyline': '#ff3333', 'polygon': '#008000', 'rectangle': '#801900'};
        this.lineWeight = {'point': null,'circle': 2, 'polyline': 2, 'polygon': 2, 'rectangle': 2};
        this.lineDashed = {'point': null, 'circle': false, 'polyline': false, 'polygon': false, 'rectangle': false};
    }
};

const allMapSettingsInput = document.querySelectorAll('[class^="b-map-setting-"]');
const allObjectSettingsInput = document.querySelectorAll('[class^="b-obj-setting-"]');

function getParametersFromClass(node) {
    let parseClass = null;
    if (node.className.startsWith('b-obj-setting-')) {
        parseClass = node.className.replace('b-obj-setting-', '').split('-');
    }
    if (node.className.startsWith('b-map-setting-')) {
        parseClass = node.className.replace('b-map-setting-', '').split('-');
    }
    return {"parameter": parseClass[0], "type": parseClass[1]};
}

function checkSettingsInLocalStorage() {
    // Getting user settings from localStorage
    let onAddObjectSettings = JSON.parse(localStorage.getItem('onAddObjectSettings'));
    let markerPinSettings = JSON.parse(localStorage.getItem('markerPinSettings'));
    let markerDotSettings = JSON.parse(localStorage.getItem('markerDotSettings'));
    let colorSettings = JSON.parse(localStorage.getItem('colorSettings'));
    let lineWeightSettings = JSON.parse(localStorage.getItem('lineWeightSettings'));
    let lineDashedSettings = JSON.parse(localStorage.getItem('lineDashedSettings'));

    // Setting user settings to app settings, if applicable
    if (onAddObjectSettings) mapParameters.onAddObject = onAddObjectSettings;
    if (markerPinSettings) objectParameters.markerPin = markerPinSettings;
    if (markerDotSettings) objectParameters.markerDot = markerDotSettings;
    if (colorSettings) objectParameters.color = colorSettings;
    if (lineWeightSettings) objectParameters.lineWeight = lineWeightSettings;
    if (lineDashedSettings) objectParameters.lineDashed = lineDashedSettings;
}

function loadSettingsIntoHTMLDOM() {
    allMapSettingsInput.forEach(el => {
        let setting = getParametersFromClass(el);
        mapParameters[setting.parameter][setting.type] ? el.checked = true : el.checked = false
    });

    allObjectSettingsInput.forEach(el => {
        let setting = getParametersFromClass(el);
        setting.parameter.startsWith('marker') || setting.parameter.startsWith('lineDashed')
            ? objectParameters[setting.parameter][setting.type] ? el.checked = true : el.checked = false
            : el.value = objectParameters[setting.parameter][setting.type];
        if (setting.parameter === 'lineWeight') {
            el.parentNode.getElementsByTagName('label')[0].textContent = objectParameters[setting.parameter][setting.type] + 'px';
        }
    });
}

// Listener for changing map settings
allMapSettingsInput.forEach(el => {
    let setting = getParametersFromClass(el);
    el.addEventListener('change', function() {
        mapParameters[setting.parameter][setting.type] = this.checked;
        localStorage.setItem(`${setting.parameter}Settings`, JSON.stringify(mapParameters[setting.parameter]));
    });
});

// Listener for changing app settings after input fields changed, also save changes to localStorage
allObjectSettingsInput.forEach(el => {
    let setting = getParametersFromClass(el);
    el.addEventListener('change', function() {
        let value = setting.parameter.startsWith('marker') || setting.parameter.startsWith('lineDashed')
            ? this.checked
            : this.value;
        if (setting.parameter === 'lineWeight') {
            this.parentNode.getElementsByTagName('label')[0].textContent = value + 'px';
        }
        objectParameters[setting.parameter][setting.type] = value;
        localStorage.setItem(`${setting.parameter}Settings`, JSON.stringify(objectParameters[setting.parameter]));
    });
});

/**
 *
 * Common
 *
 */

function clearSettingsFromLocalStorage() {
    localStorage.clear();
}

export {
    mapParameters,
    objectParameters,
    clearSettingsFromLocalStorage,
    checkSettingsInLocalStorage,
    loadSettingsIntoHTMLDOM
}