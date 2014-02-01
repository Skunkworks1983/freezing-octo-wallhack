var data = {
    "modeTeleop": false,

    "auto": [],
    "autoMeta": {
        "deadBot": false,
        "status": "noAuto",
        "hotGoal": false,
        "startPosition": {"x": 0, "y": 0},
        "shootPosition": {"x": 0, "y": 0},
        "finalPosition": {"x": 0, "y": 0}
    },

    "teleop": [],
    "teleopMeta": {
        "deadBot": false,
    },

    "currentX": 100,
    "currentY": 169,
    "MAX_X": 742,
    "MAX_Y": 338
};

$("#start").on("click", function(e) {
    enableSelector("#initial-overlay", false);
    enableSelector("#data-mode", true);
});

var littleRobot = spawnLittleRobot(data.currentX, data.currentY);
$("#field-container").appendChild(littleRobot);

var fieldContainer = $("#field-container");

onLongPress(fieldContainer, function(e) {
    console.log("long");
});

fieldContainer.on("click", function(e) {
    var x = e.x;
    var y = e.y;
    if (x + 25 > data.MAX_X) x = data.MAX_X - 25;
    if (y + 25 > data.MAX_Y) y = data.MAX_Y - 25;
    if (x < 25) x = 25;
    if (y < 25) y = 25;
    data.currentX = x;
    data.currentY = y;
    littleRobot.style.left = (x - 25) + "px";
    littleRobot.style.top = (y - 25) + "px"; // grid cause grace said so nothx
});

fieldContainer.on("mouseup", function(e) {
    setTimeout(function() {
        enableSelector("#field-container", false);
        enableSelector("#scout-buttons", true);
    }, 200);
});

// general

$(".scout.toggle").on("click", function(e) {
    var enabled = !data[data.modeTeleop ? "teleopMeta" : "autoMeta"][this.id];
    data[data.modeTeleop ? "teleopMeta" : "autoMeta"][this.id] = enabled;
    this.classList[enabled ? "add" : "remove"]("on");
    this.classList[!enabled ? "add" : "remove"]("off");
});

$("#reset").on("click", function(e) {
    document.location.reload(true);
});

// auto

$(".scout.auto.position").on("click", function(e) {
    data.autoMeta[this.id] = {"x": data.currentX, "y": data.currentY}; // FIX ME
    enableSelector("#scout-buttons", false);
    enableSelector("#field-container", true);
});

$(".scout.auto.status").on("click", function(e) {
    data.autoMeta.status = this.id;
    $(".scout.auto.status").each(function(element) {
        element.classList.remove("selected");
    });
    this.classList.add("selected");
});

$("#auto-done").on("click", function(e) {
    data.modeTeleop = true;
    data.teleopMeta.deadBot = data.autoMeta.deadBot;
    enableSelector("#auto", false);
    enableSelector("#teleop", true);
    this.classList.add("not-active");
});

// teleop

$(".scout.teleop.collect").on("click", function(e) {
    storeAction(this.id, 1, data.currentX, data.currentY); // FIX ME
    enableSelector("#scout-buttons", false);
    enableSelector("#field-container", true);
    enableSelector("#collect", false);
    enableSelector("#eject", true);
});

$(".scout.teleop.eject").on("click", function(e) {
    storeAction(this.id, 1, data.currentX, data.currentY); // FIX ME
    if (!this.classList.contains("bad")) {
        enableSelector("#field-container", true);
        enableSelector("#scout-buttons", false);
        enableSelector("#eject", false);
        enableSelector("#collect", true);
    }
});
