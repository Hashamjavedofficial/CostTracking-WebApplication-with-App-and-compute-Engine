$(document).ready(function () {
    var button = $("#getLocation");
    button.click(function () {
        button.text("Locating...");
        button.attr('disabled', true);
        navigator.geolocation.getCurrentPosition(function (position) {
            button.text("Get Location");
            button.attr('disabled', false);
            $("#lat").val(position.coords.longitude);
            $("#long").val(position.coords.latitude);
        }, function (error) {
            alert(error.message);
        }, {
            enableHighAccuracy: false,
            maximumAge: 50000
        })
    });
})