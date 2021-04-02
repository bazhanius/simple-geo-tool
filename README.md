## Simple Geographic Tool

### Table of Contents
* [Description](#description)
* [Features](#features)
* [Examples of usage](#examples-of-usage)
  * [Add array of coordinates with text field](#add-array-of-coordinates-via-text-field)
  * [Add array of coordinates as query string](#add-array-of-coordinates-as-query-string)
* [Dependencies](#dependencies)

### Description
Yet another (supposed to be simple) tool to add geo objects on map.
[Try it on GitHub Pages](https://bazhanius.github.io/simple-geo-tool/).

<kbd>![img](https://repository-images.githubusercontent.com/194441323/eeae9480-9408-11eb-89e2-4e639eac9282)</kbd>

### Features
- Adding object(s) on the map:
  - via inputting parameters (latitude, longitude and accuracy) in form fields for single object
  - via inputting JSON array of coordinates for single or multiple objects
  - via entering URL parameter
  - by shift-clicking on the map
- Supported object's types:
  - point (standalone marker)
  - point with accuracy (marker with radius)
  - line (two markers with line between them)
  - JSON array
- List of added objects with opportunity to:
  - locate (fly to) certain object
  - delete certain object
  - show  all objects
  - delete all objects
- Map controls:
  - selecting tile layers (OpenStreetMap, Wikimedia etc.)
  - geolocating current position of the device
  - show address (geocoding) in popup of object's markers
  - ruler for measure distance
- Other:
  - store last clicked coordinates on the map as the center point of the map 
  on next page load

### Examples of usage
#### Add array of coordinates via text field
Enter JSON into the text field on [array tab](https://bazhanius.github.io/simple-geo-tool/?tab=array):
One or more array of coordinates comma separated in square brackets.
* Type `[lat, lon]` for point;
* `[lat, lon, rad]` for circle;
* `[[lat1, lon1], [lat2, lon2]]` for line.

Use any combination of these, such as `[[lat, lon, rad], [lat, lon]]`, to add circle and point at the same time.
Spaces and new lines are optional.

#### Add array of coordinates as query string
Use URL parameters `tab=array` together with `addArray=[{array_here}]`, 
where `{array_here}` is an array as shown in the example above.

For example. To add these three objects:
* `[55.670375, 37.714457]` — point
* `[55.740828, 37.531868, 6000]` — circle
* `[[55.656424, 37.494801], [55.740054, 37.809184]]` — line

at the same time — combine them separated by commas and enclose them in square brackets as shown below or [see it in action](https://bazhanius.github.io/simple-geo-tool/?tab=array&addArray=[[55.670375,37.714457],[55.740828,37.531868,6000],[[55.656424,37.494801],[55.740054,37.809184]]]):
```
https://bazhanius.github.io/simple-geo-tool/?tab=array&addArray=[[55.670375,37.714457],[55.740828,37.531868,6000],[[55.656424,37.494801],[55.740054,37.809184]]]
```

### Dependencies
- [Leaflet](https://github.com/Leaflet/Leaflet)
- [Nominatim](https://github.com/openstreetmap/Nominatim)
- [MDC](https://github.com/material-components/material-components-web) (Material Design Components)
- [MDI](https://github.com/Templarian/MaterialDesign) (Material Design Icons from the Community)
