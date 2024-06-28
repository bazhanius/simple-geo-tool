# Simple Geographic Tool

## Table of Contents
* [Description](#description)
* [Main features](#main-features)
* [JSON format](#json-format)
  * [Directly specified objects ](#directly-specified-objects )
  * [Objects based on recently added objects](#objects-based-on-recently-added-objects)
* [JSON usage](#json-usage)
  * [Text field](#text-field)
  * [URL parameters](#url-parameters)
* [Dependencies](#dependencies)

## Description
Yet another (supposed to be simple) tool to add geo objects on map.
[Try it on GitHub Pages](https://bazhanius.github.io/simple-geo-tool/).

<kbd>![img](https://repository-images.githubusercontent.com/194441323/009e73b8-b37e-42fa-a062-6d89bf2e6564)</kbd>

## Main features
- Adding object(s) on the map:
  - via inputting parameters (latitude, longitude and accuracy) in form fields for single object
  - via inputting JSON array of coordinates for single or multiple objects
  - via entering URL parameter
  - by shift-clicking on the map
  - with or without marker's pin or dot
  - with custom color, line weight and line dashes
  - by applying function to recently added objects (group objects)
- Supported object's types:
  - point
  - circle
  - line and polyline
  - polygon
  - rectangle (only in JSON tab)
  - SVG (only as Data URI and in JSON tab)
- List of added objects with opportunity to:
  - view full info
  - copy object to clipboard
  - locate (fly to) certain object
  - delete certain object
  - copy all objects to clipboard
  - show all objects
  - delete all objects
- Map controls:
  - selecting tile layers (OpenStreetMap, Wikimedia etc.)
  - geolocating current position of the device
  - show address (geocoding) in popup of object's markers (disabled by default in settings)
  - ruler for measure distance
- Other:
  - setting of object creation and other options
  - store user settings in localStorage, also last clicked coordinates on the map as the center point of the map 
  on next page load.

## JSON format
### Directly specified objects 
#### Parameters
| Parameter                      | Type | Description                                                                                                                                                                                                                                                                                                                                                                                                                   |
|--------------------------------| --- |-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| <code>type</code> (required)   | String | Enum: <ul><li><code>"point"</code></li><li><code>"circle"</code></li><li><code>"polyline"</code></li><li><code>"polygon"</code></li><li><code>"rectangle"</code></li><li><code>"svgString"</code></li></ul><br>Type of the object.                                                                                                                                                                                            |
| <code>coords</code> (required) | Array of objects | Object of the form:<br><code>{"lat": Number \<double>, "lon": Number \<double>}</code>.<br>Where <code>lat</code> is latitude, from -90.0 to 90.0, and <code>lon</code> is longitude, from -180.0 to 180.0.<br><br>One object for type <code>point</code> or <code>circle</code>, and one or more for other. <br>Two object for <code>"rectangle"</code> and <code>"svgString"</code> — top-left and bottom-right vertices of bounds. |
| <code>radius</code>            | Number \<double> | Radius of the circle, in meters. Only applicable and required to type <code>"circle"</code>, otherwise will be ignored.                                                                                                                                                                                                                                                                                                       |
| <code>azimuth</code>           | Number \<double> | Direction in degrees east of True North (clockwise), from 0° to 360°. If set, the dot will be replaced with an arrow. Only applicable to type <code>"point"</code> and <code>"circle"</code>, otherwise will be ignored.                                                                                                                                                                                                      |
| <code>color</code>             | String | Stroke and fill CSS-color of the object. HEX, RGB(A), name etc.<br>Used as <code>stroke</code> value in <code>"svgString"</code>.                                                                                                                                                                                                                                                                                             |
| <code>weight</code>            | Number \<integer> | Stroke width in pixels. Not applicable to <code>"point"</code>.<br>Used as <code>stroke-width</code> value in <code>"svgString"</code>.                                                                                                                                                                                                                                                                                       |
| <code>fill</code>              | String | Applicable only to <code>"svgString"</code>. Replace each <code>fill</code> value in SVG with given CSS-color.                                                                                                                                                                                                                                                                                                                |
| <code>dashedLine</code>        | Boolean | Create dashes and gaps in the stroke. Not applicable to <code>"point"</code> and <code>"svgString"</code>.                                                                                                                                                                                                                                                                                                                    |
| <code>showMarkerPin</code>     | Boolean| Allows to enable/disable the marker pin for object.                                                                                                                                                                                                                                                                                                                                                                           |
| <code>showMarkerDot</code>     | boolean | Allows to enable/disable the marker dot for object.                                                                                                                                                                                                                                                                                                                                                                           |
#### Usage example

**Point**

Example with all required parameters (<code>"type"</code>, <code>"coords"</code>) and almost all optional (name of <code>"color"</code>, <code>"azimuth"</code>, <code>"showMarkerPin"</code>, <code>"showMarkerDot"</code>):
```json
[
   {
      "type": "point",
      "coords": [
         {
            "lat": 55.039372,
            "lon": 37.552016
         }
      ],
      "color": "black",
      "azimuth": 45,
      "showMarkerPin": false,
      "showMarkerDot": true
   }
]
```

**Circle**

Example with all required parameters (<code>type</code>, <code>coords</code>, <code>radius</code>) and some optional (RGBA <code>color</code>, <code>showMarkerPin</code>):
```json
[
   {
      "type": "circle",
      "coords": [
         {
            "lat": 56.325227,
            "lon": 37.854250
         }
      ],
      "radius": 10000,
      "color": "rgba(51, 136, 255,0.95)",
      "showMarkerPin": false
   }
]
```

**Polyline**

Example with all required parameters (<code>type</code>, <code>coords</code>) and one optional (HEX <code>color</code>):
```json
[
   {
      "type": "polyline",
      "coords": [
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
         }
      ],
      "color": "#6e14ef"
   }
]
```

**Polygon**

Example only with required parameters (<code>type</code>, <code>coords</code>):
```json
[
   {
      "type": "polygon",
      "coords": [
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
            "lon":36.426052,
            "lat":56.181837
         }
      ]
   }
]
```

**Rectangle**

Example only with required parameters (<code>type</code>, <code>coords</code>):
```json
[
   {
      "type": "rectangle",
      "coords": [
         {
            "lon": 37.854319,
            "lat": 55.569630
         },
         {
            "lon": 38.987349,
            "lat": 55.143146
         }
      ]
   }
]
```

**SVG as Data URI**

Example only with required parameters (<code>type</code>, <code>coords</code>):
```json
[
   {
      "type": "svgString",
      "coords": [
         {
            "lon": 37.394619,
            "lat": 55.867370
         },
         {
            "lon": 37.877967,
            "lat": 55.732980
         }
      ],
     "svgDataURI": "data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjgwMHB4IiB3aWR0aD0iODAwcHgiIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIAoJIHZpZXdCb3g9IjAgMCAyODAuMDI4IDI4MC4wMjgiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8Zz4KCTxwYXRoIHN0eWxlPSJmaWxsOiMzMjRENUI7IiBkPSJNMTMxLjI2MywxMzEuMjYzdjE0MC4wMTRjMCw0LjgzOSwzLjkxMiw4Ljc1MSw4Ljc1MSw4Ljc1MXM4Ljc1MS0zLjkxMiw4Ljc1MS04Ljc1MVYxMzEuMjYzSDEzMS4yNjMKCQl6Ii8+Cgk8cGF0aCBzdHlsZT0iZmlsbDojRTI1NzRDOyIgZD0iTTE0MC4wMTQsMGM0OC4zMzEsMCw4Ny41MDksMzkuMTg2LDg3LjUwOSw4Ny41MDlzLTM5LjE3OCw4Ny41MTctODcuNTA5LDg3LjUxNwoJCWMtNDguMzIyLDAuMDA5LTg3LjUwOS0zOS4xOTUtODcuNTA5LTg3LjUxN1M5MS42OTEsMCwxNDAuMDE0LDB6Ii8+Cgk8cGF0aCBzdHlsZT0iZmlsbDojRTg3OTcwOyIgZD0iTTE2Ni4yNjYsNDMuNzYzYzE0LjUsMCwyNi4yNTMsMTEuNzQ0LDI2LjI1MywyNi4yNDRTMTgwLjc2Nyw5Ni4yNiwxNjYuMjY2LDk2LjI2CgkJYy0xNC40OTEsMC0yNi4yNTMtMTEuNzUyLTI2LjI1My0yNi4yNTNDMTQwLjAxNCw1NS41MTUsMTUxLjc3NSw0My43NjMsMTY2LjI2Niw0My43NjN6Ii8+Cgk8cGF0aCBzdHlsZT0iZmlsbDojQ0I0RTQ0OyIgZD0iTTE0OC43NjUsMTY2LjI4NGMtNDguMzEzLDAtODcuNTA5LTM5LjIwNC04Ny41MDktODcuNTI2YzAtMjEuOTM4LDguMTMtNDEuOTM0LDIxLjQ2Ni01Ny4yOTIKCQlDNjQuMjQsMzcuNTI0LDUyLjUwNSw2MS4xMjUsNTIuNTA1LDg3LjUwOWMwLDQ4LjMyMiwzOS4xODYsODcuNTE3LDg3LjUwOSw4Ny41MTdjMjYuMzkzLDAsNDkuOTk0LTExLjc0NCw2Ni4wNDMtMzAuMjE3CgkJQzE5MC42OTksMTU4LjE2MywxNzAuNzAzLDE2Ni4yODQsMTQ4Ljc2NSwxNjYuMjg0eiIvPgo8L2c+Cjwvc3ZnPg=="
   }
]
```

### Objects based on recently added objects

#### Parameters
| Parameter | Type | Description |
| --- | --- | --- |
| <code>type</code> (required) | String |Only <code>"group"</code>. |
| <code>function</code> (required) | String |Enum: <ul><li><code>"drawCircleBounds"</code></li><li><code>"drawRectangleBounds"</code></li></ul><br>Function of calculation. |
| <code>objectIDs</code> (required) | Array of integers | List of recently added objects IDS that will be proccessed by function. Must contain minimum one valid ID.
| <code>color</code> | String | Stroke and fill CSS-color of the object. HEX, RGB(A), name etc.|
| <code>weight</code> | Number \<integer> | Stroke width in pixels. Not applicable to <code>"point"</code>.|
| <code>dashedLine</code> | Boolean | Create dashes and gaps in the stroke. Not applicable to <code>"point"</code>.|
| <code>showMarkerPin</code> | Boolean| Allows to enable/disable the marker pin for object.|
| <code>showMarkerDot</code> | boolean | Allows to enable/disable the marker dot for object. |

#### Usage example
This will add a <code>"circle"</code> object around the objects with the given IDs:
```json
[
   {
      "type": "group",
      "function": "drawCircleBounds",
      "objectIDs": [2, 3, 7],
      "color": "black",
      "weight": 1,
      "showMarkerPin": false,
      "showMarkerDot": true
   }
]
```

## JSON usage

### Text field
Enter JSON into the text field on [array tab](https://bazhanius.github.io/simple-geo-tool/?tab=array).
JSON must contain one array with one or more objects in curly brackets comma separated:
```
[{object_1}, {object_2}, ..., {object_n}]
```

### URL parameters
Use URL parameter `tab=array` together with `addArray=[{obj_1}, {obj_2}, ..., {obj_n}]`:
```
https://bazhanius.github.io/simple-geo-tool/?tab=array&addArray=[{obj_1}, {obj_2}, ..., {obj_n}]
```

## Dependencies
- [Leaflet](https://github.com/Leaflet/Leaflet)
- [Nominatim](https://github.com/openstreetmap/Nominatim)
- [MDC](https://github.com/material-components/material-components-web) (Material Design Components)
- [MDI](https://github.com/Templarian/MaterialDesign) (Material Design Icons from the Community)


## Build
``` 
webpack build
```
