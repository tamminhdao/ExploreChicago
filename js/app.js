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
        self.zoomToSelected();
        console.log ("KO selected neighborhood: " + self.selectedNeighborhood());
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
        console.log ("KO chosen option: " + self.chosenOption().value());
    }
};

ko.applyBindings (new viewModel());

//Zoom to neighborhood as user click on a name on each neighborhood list
viewModel.zoomToSelected = function() {
    var geocoder = new google.maps.Geocoder ();
    geocoder.geocode ({
        address: self.selectedNeighborhood(), //obtain selected neighborhood name to use as zoom-in address
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

    //Call viewModel methods
    viewModel.zoomToSelected();
}
