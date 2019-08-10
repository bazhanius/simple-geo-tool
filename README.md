## simple-geo-tool
![img](https://repository-images.githubusercontent.com/194441323/39f32f00-a1b2-11e9-879d-89f8fc50f4b1)

#### Description
Yet another (supposed to be simple) tool to add geo objects on map.

Try it on GitHub Pages: https://bazhanius.github.io/simple-geo-tool/

#### Features
- Adding object by inputting parameters (latitude, longitude and accuracy) in form fields or by clicking on the map.
- Supported object types:
  - point (standalone marker)
  - point with accuracy (marker with radius)
  - line (two markers with line between them)
- List of added objects with opportunity to:
  - locate (fly to) certain object
  - delete certain object
  - show  all objects
  - delete all objects
- Map controls:
  - selecting tile layers (OpenStreetMap, Wikimedia etc.)
  - geolocating current position of the device
  - show address (geocoding) in popup of object's markers

#### Dependencies
- [Leaflet](https://github.com/Leaflet/Leaflet)
- [Nominatim](https://github.com/openstreetmap/Nominatim)
- [MDC](https://github.com/material-components/material-components-web) (Material Design Components)
- [MDI](https://github.com/Templarian/MaterialDesign) (Material Design Icons from the Community)
