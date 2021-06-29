# Simple Geographic Tool

## Table of Contents
* [Description](#description)
* [Features](#features)
* [Examples of usage](#examples-of-usage)
  * [Add array of coordinates with text field](#add-array-of-coordinates-via-text-field)
  * [Add array of coordinates as query string](#add-array-of-coordinates-as-query-string)
* [Dependencies](#dependencies)

## Description
Yet another (supposed to be simple) tool to add geo objects on map.
[Try it on GitHub Pages](https://bazhanius.github.io/simple-geo-tool/).

<kbd>![img](https://repository-images.githubusercontent.com/194441323/eeae9480-9408-11eb-89e2-4e639eac9282)</kbd>

## Features
- Adding object(s) on the map:
  - via inputting parameters (latitude, longitude and accuracy) in form fields for single object
  - via inputting JSON array of coordinates for single or multiple objects
  - via entering URL parameter
  - by shift-clicking on the map
  - with or without marker pin (marker switcher)
- Supported object's types:
  - point (standalone marker)
  - point with accuracy (marker with radius — circle)
  - line (two markers with line between them)
  - point, circle, polyline and polygon as JSON array of objects
- List of added objects with opportunity to:
  - copy object to clipboard
  - locate (fly to) certain object
  - delete certain object
  - copy all objects to clipboard
  - show all objects
  - delete all objects
- Map controls:
  - selecting tile layers (OpenStreetMap, Wikimedia etc.)
  - geolocating current position of the device
  - show address (geocoding) in popup of object's markers
  - ruler for measure distance
- Other:
  - store last clicked coordinates on the map as the center point of the map 
  on next page load

## Examples of usage
### Add array of coordinates via text field
Enter JSON into the text field on [array tab](https://bazhanius.github.io/simple-geo-tool/?tab=array).
JSON must contain one array with one or more objects in curly brackets comma separated:
```
[{object_1}, {object_2}, ..., {object_n}]
```
#### Supported objects
Use any combination of these objects:
##### Point
```json
{
   "type": "point",
   "coords":[
      {
         "lat": 55.039372,
         "lon": 37.552016
      }
   ]
}
```
##### Circle
```json
{
   "type": "circle",
   "coords":[
      {
         "lat": 56.325227,
         "lon": 37.854250
      }
   ],
   "radius": 10000
}
```
##### Polyline
```json
{
   "type": "polyline",
   "coords":[
      {
         "lat": 55.124319,
         "lon": 36.777198
      },
      {
         "lat": 56.273381,
         "lon": 38.777437
      },
      {
         "lat": 55.630222,
         "lon": 39.332448
      },
      {
         "lat": 55.124319,
         "lon": 36.777198
      }
   ]
}
```
##### Polygon
```json
{
   "type": "polygon",
   "coords":[
      {
         "lon": 36.426052,
         "lat": 56.181837
      },
      {
         "lon": 39.201706,
         "lat": 56.160414
      },
      {
         "lon": 38.987349,
         "lat": 55.143146
      },
      {
         "lon": 36.327118,
         "lat": 55.290538
      },
      {
         "lon": 36.426052,
         "lat": 56.181837
      }
   ]
}
```

### Add array of coordinates as query string
Use URL parameters `tab=array` together with `addArray=[<array_here>]`, 
where `<array_here>` is an array of objects as shown in the example above.
```
https://bazhanius.github.io/simple-geo-tool/?tab=array&addArray=[{obj_1}, {obj_2}, ..., {obj_n}]
```

## Dependencies
- [Leaflet](https://github.com/Leaflet/Leaflet)
- [Nominatim](https://github.com/openstreetmap/Nominatim)
- [MDC](https://github.com/material-components/material-components-web) (Material Design Components)
- [MDI](https://github.com/Templarian/MaterialDesign) (Material Design Icons from the Community)
