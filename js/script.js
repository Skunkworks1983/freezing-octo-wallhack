var baseUrl = "http://10.76.4.150/api"; // change me

var data = {
    "currentTeam": -1,
    "color": "green",
    "matchNumber": -1,

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
    "MAX_X": 960,
    "MAX_Y": 437
};

activateSelector("#start", false);
$("#scout-number").on("change", function(e) {
    $("#robot-number").innerHTML = "0000";
    $("#robot-color").innerHTML = "";
    $("#match-number-span").innerHTML = "";
    if (this.value !== "bad") {
        scoutId = parseInt(this.value, 10);
        $.get(baseUrl + "/register?scout_id=" + scoutId + "&event_id=2013wase", function(serverData) {
            matchNumbersArray = serverData.map(function(match) {
                return match.match_number;
            });
            matchNumbers = {}
            matchNumbersArray.forEach(function(num) {
                matchNumbers[num] = num;
            });
            matches = createSelect("match-numbers", matchNumbers);
            matches.on("change", function() {
                if (this.value !== "bad") {
                    data.matchNumber = parseInt(this.value, 10);
                    activateSelector("#start", true);
                    match = serverData[data.matchNumber - 1];
                    $("#robot-number").innerHTML = match.team_number;
                    data.currentTeam = match.team_number;
                    data.color = match.color;
                    $("#robot-color").classList.remove("blue");
                    $("#robot-color").classList.remove("red");
                    $("#robot-color").classList.add(match.color === "blue" ? "blue" : "red");
                    $("#robot-color").innerHTML = (match.color === "blue") ? "blue" : "red";
                } else {
                    $("#robot-number").innerHTML = "0000";
                    $("#robot-color").innerHTML = "";
                    activateSelector("#start", false);
                }
            });
            var bad = document.createElement("option");
            bad.value = "bad";
            bad.appendChild(document.createTextNode(""));
            matches.insertBefore(bad, matches.firstChild);
            $("#match-number-span").appendChild(matches);
        });
    }
});

$("#start").on("click", function(e) {
    activateSelector("#initial-overlay", false);
    activateSelector("#data-mode", true);
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
    littleRobot.style.top = (y - 25) + "px";
});

fieldContainer.on("mouseup", function(e) {
    setTimeout(function() {
        activateSelector("#field-container", false);
        activateSelector("#scout-buttons", true);
    }, 200);
});

// general

$(".scout.toggle").on("click", function(e) {
    var enabled = !data[data.modeTeleop ? "teleopMeta" : "autoMeta"][this.id];
    data[data.modeTeleop ? "teleopMeta" : "autoMeta"][this.id] = enabled;
    this.classList[enabled ? "add" : "remove"]("on");
    this.classList[!enabled ? "add" : "remove"]("off");
    if (this.dataset.value != null) {
        var v = this.value;
        this.value = this.dataset.value;
        this.dataset.value = v;
    }
});

$("#reset").on("click", function(e) {
    document.location.reload(true);
});

// auto

$(".scout.auto.position").on("click", function(e) {
    data.autoMeta[this.id] = {"x": data.currentX, "y": data.currentY}; // FIX ME
    activateSelector("#scout-buttons", false);
    activateSelector("#field-container", true);
});

$(".scout.auto.status").on("click", function(e) {
    if (data.autoMeta.status != this.id) {
        data.autoMeta.status = this.id;
        $(".scout.auto.status").each(function(element) {
            element.classList.remove("selected");
        });
        this.classList.add("selected");
    } else {
        data.autoMeta.status = "noAuto";
        this.classList.remove("selected");
    }
});

$("#auto-done").on("click", function(e) {
    data.modeTeleop = true;
    data.teleopMeta.deadBot = data.autoMeta.deadBot;
    activateSelector("#auto", false);
    activateSelector("#teleop", true);
    activateSelector("#bottom-buttons .auto", false);
    activateSelector("#bottom-buttons .teleop", true);
});

// teleop

$(".scout.teleop.collect").on("click", function(e) {
    storeAction(this.id, "collect", 1, data.currentX, data.currentY); // FIX ME
    activateSelector("#scout-buttons", false);
    activateSelector("#field-container", true);
    activateSelector("#collect", false);
    activateSelector("#eject", true);
});

$(".scout.teleop.eject").on("click", function(e) {
    storeAction(this.id, "eject", 1, data.currentX, data.currentY); // FIX ME
    if (!this.classList.contains("bad")) {
        activateSelector("#scout-buttons", false);
        activateSelector("#field-container", true);
        activateSelector("#collect", true);
        activateSelector("#eject", false);
    }
});

$("#undo-teleop").on("click", function(e) { // FIX ME
    var action = undoAction();
    undidCollect = action.category === "collect";
    activateSelector("#scout-buttons", true);
    activateSelector("#field-container", false);
    activateSelector("#collect", undidCollect);
    activateSelector("#eject", !undidCollect);
});

$("#teleop-done").on("click", function(e) {
    $.post(baseUrl + "/match", {
        "event_id": "2013wase",
        "match_number": data.matchNumber,
        "team_number": data.currentTeam,
        "actions": data["teleop"].map(function(action) {
            return {
                "action": action.action,
                "value": action.value,
                "x": action.x,
                "y": action.y,
                "time": action.time
            };
        })
    }, function(data) {
        console.log(data);
        alert("success, refresh the page");
    });
});
