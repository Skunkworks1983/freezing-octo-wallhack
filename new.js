var data = {
    "modeTeleop": false,
    "auto": {},
    "teleop": {},
    "currentX": 100,
    "currentY": 169,
    "MAX_X": 742,
    "MAX_Y": 338
};

$("#start").on("click", function(e) {
    $("#initial-overlay")[0].classList.toggle("active");
    $("#data-mode")[0].classList.toggle("active");
});

var littleRobot = spawnLittleRobot(data.currentX, data.currentY);
$("#field-container")[0].appendChild(littleRobot);

var fieldContainer = $("#field-container")[0];

onLongPress(fieldContainer, function(e) {
    console.log("long");
});

fieldContainer.on("click", function(e) {
    // fill me in pls
});
