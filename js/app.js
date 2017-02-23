//Data
var options = {
    "activities": [{
        "value": "coffee",
        "label": "Looking for a coffee shop"
    },{
        "value": "restaurant",
        "label": "Looking for a bite to eat"
    }, {
        "value": "hotel",
        "label": "Looking for a place to stay"
    }, {
        "value": "bookstore",
        "label": "Looking for a bookstore"
    }, {
        "value": "atm",
        "label": "Looking for an ATM"
    }, {
        "value": "yoga",
        "label": "Looking for a yoga studio"
    }]
};

var neighborhoodNames = {
    "north": ["Andersonville", "Lakeview", "Lincoln Park", "North Center", "Old Town", "Uptown"],
    "downtown": ["Gold Coast", "Loop", "River North", "Streeterville" ,"South Loop"],
    "west": ["Little Italy", "Pilsen", "Wicker Park", "West Town", "West Loop"],
    "south": ["Bridgeport", "Bronzeville", "China Town", "Hyde Park", "Kenwood"]
};


//Model
var exploreOption = function(data) {
    this.label = ko.observable (data.label);
    this.value = ko.observable (data.value);
};

//ViewModel
function viewModel () {
    var self = this;

    //Knockout Bindings for the Header
    //assign initial visibility status for the selection icons and the option box
    this.hamburgerIcon = ko.observable (true);
    this.crossIcon = ko.observable (false);
    this.optionsBox = ko.observable (false);

    //show options box when click on hamburger icon, alternate between hamburger and cross icons
    this.showOptions = function() {
        self.hamburgerIcon(false);
        self.crossIcon(true);
        self.optionsBox(true);
    };

    //hide options box when click on hamburger icon, alternate between hamburger and cross icons
    this.hideOptions = function() {
        self.crossIcon(false);
        self.hamburgerIcon(true);
        self.optionsBox(false);
    };

    //Knockout Bindings for the Neighborhood portion in the options menu
    //Assemble the <li> items for each <ul>
    this.northSide = ko.observableArray([]);
    this.downtown = ko.observableArray([]);
    this.westSide = ko.observableArray([]);
    this.southSide = ko.observableArray([]);

    neighborhoodNames.north.forEach (function (value) {
        self.northSide.push (value);
    })
    neighborhoodNames.downtown.forEach (function (value) {
        self.downtown.push (value);
    })
    neighborhoodNames.west.forEach (function (value) {
        self.westSide.push (value);
    })
    neighborhoodNames.south.forEach (function (value) {
        self.southSide.push (value);
    })

    this.selectedNeighborhood = ko.observable();
    this.pickNeighborhood = function (clickedNeighborhood) {
        self.selectedNeighborhood (clickedNeighborhood)
    }

    //Knockout Bindings for the Explore portion in the options menu
    //Assemble the <li> items for the <ul> and make the options <ul> show on screen
    this.optionsList = ko.observableArray([]);
    for (key in options) {
        options[key].forEach (function (item) {
            self.optionsList.push (new exploreOption (item));
        })
    }

    this.chosenOption = ko.observable ();
    this.setOption = function(clickedOption) {
        self.chosenOption(clickedOption);
        console.log ("KO testing value: " + self.chosenOption().value());
    }
};

ko.applyBindings (new viewModel());

//Zoom to neighborhood as user click on a name on each neighborhood list
viewModel.zoomToSelected = function() {
}

// Google Map
var map;
var markers = {};
var defaultIcon;
var highlightedIcon;

/* Put markers into different catergories so we can pick and choose which ones to show or hide
markers = {
    atm: [],
    coffee: [],
    etc...
}
*/
for (key in options) {
    options[key].forEach (function (item) {
        markers[item.value] = [];
    });
}


//While most other APIs just return data, Google Maps API is unusual 
//in that it include its own View Model that is downloaded when you make a successful Google Maps request.
//This function initMap() is the calback of Google Maps API
function initMap() {
    //style the map
    var styles = [
        {
            featureType: 'poi',
            elementType: 'poi.attraction',
            stylers : [
                { weight: 10 }
            ]
        },
        {
            featureType: 'poi',
            elementType: 'poi.park',
            stylers : [
                { weight: 9 }
            ]
        },
        {
            featureType: 'road',
            elementType: 'road.highway',
            stylers : [
                { visibility: 'simplified' }
            ]
        },
        {
            featureType: 'road.highway',
            elementType: 'labels.icon',
            stylers: [
              { visibility: 'off' }
            ]
        },
        {
            featureType: 'administrative',
            elementType: 'administrative.neighborhood',
            stylers : [
                { visibility: 'off' }
            ]
        }
    ];
    map = new google.maps.Map(document.getElementById('map'), {
        //center: {lat: 41.880629, lng: -87.674048}, //United Center
        //center: {lat: 41.879436, lng: -87.644418}, //Old St. Patrick Church
        center: {lat: 41.878876, lng: -87.635915}, //Willis Tower
        zoom: 14,
        styles: styles,
        mapTypeControl: false
    });

    // Style the markers
    defaultIcon = makeMarkerIcon('0091ff');

    // Create a "highlighted location" marker color for when the user
    // mouses over the marker.
    highlightedIcon = makeMarkerIcon('ff0000');
}

//Reset map for a new search
function resetMap() {
        //reset google map to wide view
        map.setCenter({lat: 41.878876, lng: -87.635915});
        map.setZoom(14);
        //delete all markers and empty out the markers object
        hideAllListings(); 
        //Reset value of the neighborhood search box
        $("#neighborhood").val(function () {
            return this.defaultValue;
        });
        //Remove any previously selected neighborhoods
        $(".neighborhoods").removeClass ("selected");
        //Remove explore options
        $(".options").removeClass ("chosen");
        //Reset the svg map introduction
        for (area in chicago) {
            document.getElementById(area).style.display = "none";
            }
        document.getElementById("intro").style.display = "block";
}

//Zoom to neighborhood as user click on a name on the list
function zoomToSelected() {
    var chosenName = $(".selected").text();
    var geocoder = new google.maps.Geocoder ();
    geocoder.geocode ({
        address: chosenName,
        componentRestrictions: {locality: 'Chicago'}
    }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
                map.setCenter(results[0].geometry.location);
                map.setZoom(15);
        }
        else {
            window.alert ('We are having problems locating this neighborhood. Please try again!');
        }
    });
}

//Zoom to neighborhood when user manually type in a name
function zoomToNeighborhood() {
    var geocoder = new google.maps.Geocoder();
    //obtain the user-input adress
    var neighborhood = $("#neighborhood").val();
    //make sure the input value is not blank
    if (neighborhood == '') {
        window.alert ('You must enter an valid neighborhood name');
    } else {
        geocoder.geocode ({
            address: neighborhood,
            componentRestrictions: {locality: 'Chicago'}
        }, function(results, status){
            if (status == google.maps.GeocoderStatus.OK) {
                map.setCenter(results[0].geometry.location);
                map.setZoom(15);
            }
            else {
                window.alert ('We cannot locate your neighborhood. Please try again!');
            }
        });
    }
}

function foursquareCall() {
    //Obtain the map's latlng center for the ll param
    var lat = map.center.lat();
    var lng = map.center.lng();
    var latlng = lat + "," + lng;

    //Obtain the search keyword for the query param
    var searchKeyword = $(".chosen").attr('data-value');
    console.log('Searching for: ' + searchKeyword);
    
    var largeInfowindow = new google.maps.InfoWindow();

    var foursquareUrl = "https://api.foursquare.com/v2/venues/search?ll=" + latlng + "&query=" + searchKeyword + "&radius=800&client_id=POWMWFWIJYX2DYSPVDZGWUALNC4RON5ROTEPHNDZKIYOTUTR&client_secret=PHC4Z52PPQJM5SMCLNN4UAGVYW5PQIKOWX23FDQWLCVB3J3S&v=20170203";
    console.log(foursquareUrl);

    //Handle Error
    var requestTimeout = setTimeout (function(){
        window.alert ("Foursquare is taking longer than usual to response.");
    }, 5000); //wait 5 sec

    $.ajax({
        url: foursquareUrl,
        dataType: 'jsonp',
        success: function (response) {
            //If ajax resquest went through, abort error alert
            clearTimeout (requestTimeout);

            var restaurantList = response.response.venues;
            //check if the ajax request return any result
            if (restaurantList.length == 0) {
                window.alert ('We cannot find any venue that matches your search.');
                //Do not show the cross sign on selected options
                $(".chosen ~ button"). hide();
            }
            else {
                for (var i=0; i < restaurantList.length; i++) {
                    var latitude = restaurantList[i].location.lat;
                    var longitude = restaurantList[i].location.lng;
                    var latLng = new google.maps.LatLng(latitude, longitude);
                    //obtain the name of each venue to use later in infowindow
                    var title = restaurantList[i].name;
                    var marker = new google.maps.Marker({
                        position: latLng,
                        map: map,
                        icon: defaultIcon,
                        title: title,
                        animation: google.maps.Animation.DROP,
                    })

                    //Push each marker into our array of markers
                    //so we can hide all markers of the same catergory
                    markers[searchKeyword].push(marker);

                    //Create an onclick event to open an infowindow when each marker is clicked
                    marker.addListener('click', function() {
                        populateInfoWindow (this, largeInfowindow);
                    })

                    // Two event listeners - one for mouseover, one for mouseout,
                    // to change the colors back and forth.
                    marker.addListener ('mouseover', function() {
                        this.setIcon(highlightedIcon);
                    });
                    marker.addListener ('mouseout', function() {
                        this.setIcon(defaultIcon);
                    });
                }
            }
            //console.log (markers[searchKeyword].length);
        }
    });
}

// This function takes in a COLOR, and then creates a new marker
// icon of that color. The icon will be 21 px wide by 34 high, have an origin
// of 0, 0 and be anchored at 10, 34).
function makeMarkerIcon(markerColor) {
    var markerImage = {
        url: 'https://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
        '|40|_|%E2%80%A2',
        size: new google.maps.Size(21, 34),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(10, 34),
        scaledSize: new google.maps.Size(21, 34)
        };
    return markerImage;
}

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
// Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
        infowindow.marker = marker;
        infowindow.setContent('<div>' + marker.title + '</div>');
        infowindow.open(map, marker);
    }
}

function hideAllListings() {
    //remove all chosen items
    $(".options").removeClass ("chosen");
    //hide all the cross
    $(".clear").hide();
    //hide all markers on the map and empty all array in {markers}
    for (key in markers) {
        for (i=0; i < markers[key].length; i++) {
            markers[key][i].setMap(null);
        }
        markers[key] = [];
    }
}

