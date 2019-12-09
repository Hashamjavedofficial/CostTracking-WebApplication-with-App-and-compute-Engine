var long = document.getElementById("long1").value;
var laat = document.getElementById("lat1").value;

var map;
var marker;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 31.504793600000003,
            lng: 74.3235584

        },
        zoom: 11
    });



}

function showMap(id) {
    $.get('/api/get-location/' + id, function (response) {
        if (marker) {
            marker.setMap(null);
        }
        marker = new google.maps.Marker({
            position: {
                lat: response.long,
                lng: response.lat
            },
            map: map,
            title: response.shopName + "  Address:  " + response.address,
            animation: google.maps.Animation.BOUNCE

        });

    });
}