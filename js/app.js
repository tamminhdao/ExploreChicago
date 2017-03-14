//Slide in Menu
$(".cross").hide();
$(".options-box").hide();

$(".hamburger").click(function() {
    $(".options-box").animate ({width: 'toggle'});
    $(".hamburger").hide();
    $(".cross").show();
});

$(".cross").click(function() {
    $(".options-box").animate ({width: 'toggle'});
    $(".cross").hide();
    $(".hamburger").show();
});

//Feautured neighborhoods 
var neighborhoodNames = {
    "north": ["Andersonville", "Lakeview", "Lincoln Park", "North Center", "Old Town", "Uptown"],
    "downtown": ["Gold Coast", "Loop", "River North", "Streeterville" ,"South Loop"],
    "west": ["Little Italy", "Pilsen", "Wicker Park", "West Town", "West Loop"],
    "south": ["Bridgeport", "Bronzeville", "China Town", "Hyde Park", "Kenwood"]
};

var htmlNames = '<li class="neighborhoods">%data%</li>';

for (key in neighborhoodNames) {
    neighborhoodNames[key].forEach (function (value) {
        var formattedNames = htmlNames.replace ("%data%", value);
        $("#" + key).append(formattedNames);
    });
}

//A list of Explore options

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
        "value": "yoga",
        "label": "Looking for a yoga studio"
    }]
};

var htmlOptions = '<li> <p class="options" data-value="%value%"> %label% </p> <button class="clear">&#735;</button> </li>';

for (key in options) {
    options[key].forEach (function (item) {
        var formattedOptions = htmlOptions.replace("%label%", item.label);
        var formattedOptions = formattedOptions.replace("%value%", item.value);
        $("#interest").append(formattedOptions);
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

//Error handling for Google Maps APIs
function errorHandling () {
    var notice = '<h1 align="center"> GOOGLE MAPS DOESN\'T WORK!</h1>';
    notice += '<h1 align="center"> Please try again later! </h1>';
    $('#map').append(notice);
}

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

    //Reset map for a new search
    $(".reload").click (function() {
        resetMap();
    });

    //Zoom to neighborhood as user click on a name on the list
    $(".neighborhoods").click (function() {
        //make sure only one neighborhood is selected at a time
        $(".neighborhoods").removeClass ("selected");
        $(this).addClass ("selected");
        //clear all previous search results
        hideAllListings();
        //Reset value of the neighborhood search box (display on mobile)
        $("#neighborhood").val (function () {
            return this.defaultValue;
        });
        zoomToSelected();
    });

    //Zoom to neighborhood when user manually type in a neighborhood name on the search box (display on mobile)
    $("#zoomToArea").click (function() {
        //clear previous seach results
        hideAllListings ();
        //Remove any previously selected neighborhoods from the svgmap list
        $(".neighborhood").removeClass ("selected");
        //initialize the geocoder
        zoomToNeighborhood();
    });

    //Drop markers on the map when user select an explore option
    $(".options").click (function() {
        //make sure only one item is chosen at a time
        $(".options").removeClass ("chosen");
        $(this).addClass ("chosen");
        //Show the cross 
        $(".chosen ~ button"). show();
        //Foursquare API ajax request 
        foursquareCall();
    });

    $(".clear").click (function() {
        var catergory = $(this).siblings(".options").attr('data-value');
        console.log ('Clear markers for: ' + catergory);
        //empty only the matching catergory array in the {markers}
        for (i=0; i < markers[catergory].length; i++) {
            markers[catergory][i].setMap(null);
        }
        //hide the cross
        $(this).hide();
        //if <p> happens to be chosen, remove class chosen
        $(this).siblings(".options").removeClass("chosen");
    });

    $("#empty").click (function() {
        hideAllListings(); //one click to wipe out all search results in the explore section (not neighborhood)
    });
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
    var chosenName = $(".selected").text() + ' Chicago';
    console.log (chosenName);
    var geocoder = new google.maps.Geocoder ();
    geocoder.geocode ({
        address: chosenName,
        //componentRestrictions: {locality: 'Chicago'}
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
    var neighborhood = $("#neighborhood").val() + ' Chicago';
    //make sure the input value is not blank
    if (neighborhood == '') {
        window.alert ('You must enter an valid neighborhood name');
    } else {
        geocoder.geocode ({
            address: neighborhood,
            //componentRestrictions: {locality: 'Chicago'}
        }, function(results, status) {
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

    //create one infowindow instances to share among all markers
    var oneInfowindow = new google.maps.InfoWindow();

    var foursquareUrl = "https://api.foursquare.com/v2/venues/search?ll=" + latlng + "&query=" + searchKeyword + "&radius=800&client_id=POWMWFWIJYX2DYSPVDZGWUALNC4RON5ROTEPHNDZKIYOTUTR&client_secret=PHC4Z52PPQJM5SMCLNN4UAGVYW5PQIKOWX23FDQWLCVB3J3S&v=20170203";
    console.log(foursquareUrl);

    $.ajax({
        method: 'GET',
        url: foursquareUrl,
        dataType: 'jsonp'
    }).done (function (response) {
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
                    var name = restaurantList[i].name || 'No name provided';
                    var address = restaurantList[i].location.address || 'No address provided';
                    var phoneNumber = restaurantList[i].contact.formattedPhone || 'No phone number provided';
                    //obtain the details of each venue to use later in infowindow
                    var info = 'Name: ' + name + '<br><br>'
                                + 'Address: ' + address + '<br><br>' 
                                + 'Phone Number: ' + phoneNumber;

                    var marker = new google.maps.Marker({
                        position: latLng,
                        map: map,
                        icon: defaultIcon,
                        title: info,
                        animation: google.maps.Animation.DROP,
                    });

                    //Push each marker into our array of markers
                    //so we can hide all markers of the same catergory
                    markers[searchKeyword].push(marker);

                    //extend map bounds to include all markers on the screen
                    var bounds = new google.maps.LatLngBounds();
                    markers[searchKeyword].forEach (function (marker) {
                        bounds.extend(marker.position);
                    });
                    //make sure map markers always fit on screen as user resizes their browser window
                    google.maps.event.addDomListener(window, 'resize', function() {
                        map.fitBounds(bounds);
                    });

                    //Create an onclick event to open an infowindow when each marker is clicked
                    marker.addListener('click', function() {
                        populateInfoWindow (this, oneInfowindow);
                    });

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
        }).fail (function(jqXHR, textStatus, errorThrown) {
        console.log ('Status code: ' + jqXHR.status); 
        console.log ('Text status: ' + textStatus);
        console.log ('Error thrown: ' + errorThrown);
        window.alert ('Cannot retrieve data from Foursquare at the moment!');
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

