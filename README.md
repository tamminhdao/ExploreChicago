# Explore Chicago
===============================

### Overview
This is a single-page, responsive application, hosted on Github Pages at https://tamminhdao.github.io/ExploreChicago.
The app is built with jQuery. The svg map on the menu is built with Raphael.js

### App functionalities
1. The app collects data using Google Maps APIs and Foursquare APIs.
2. The app notifies users if an error occurs. 
3. The map automatically adapts to different viewports, adjusts bounds and zooms to accommodate all markers.
4. The menu slides open and close on the left hand side. 
    This menu can be manipulated with the hamburger/ cross icons on the header upper right-hand side.
5. The svg map on the menu is clickable. 
  By clicking on one of the four color coded areas and selecting a neighborhood name, the map will zoom into that neighborhood.
  On mobile devices, this functionality is replaced by a simple input box for users to enter any neighborhood name of their choice.
6. Choosing one of the explore options will cause markers to be dropped on the map. Each marker represent a venue that matches the chosen explore option.
7. Explore options can be turned off individually by clicking the cross sign next to each previously chosen option and the corresponding markers will also disappear. Alternatively, clicking the "Hide All Listings" button will turn off all options and all markers.
8. Hovering over a marker causes it to change color.
    Clicking on a marker openes an infowindow that reveals more infomation about the location.
9. Refresh the app by clicking on the refresh icon on the header upper right-hand side.
