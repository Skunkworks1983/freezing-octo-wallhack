var baseUrl = window.location.href + "api";
var nop = function() {};

var defaultData = {
    "scoutNumber": -1,
    "scoutName": "unknown",
    "currentTeam": -1,
    "color": "green",
    "matchNumber": -1,

    "modeTeleop": false,

    "auto": [],
    "autoMeta": {
        "deadBot": false,
        "status": "noAuto",
        "hotGoal": false,
        "startPosition": {"x": -1, "y": -1},
        "shootPosition": {"x": -1, "y": -1},
        "finalPosition": {"x": -1, "y": -1}
    },

    "teleop": [],
    "teleopMeta": {
        "deadBot": false,
    },

    "fieldCallback": nop,
    "MAX_X": 960,
    "MAX_Y": 437
};
var data = clone(defaultData);

activateSelector("#start", false);
$("#scout-number").on("change", function(e) {
    $("#robot-number").innerHTML = "0000";
    $("#robot-color").innerHTML = "";
    $("#match-number-span").innerHTML = "";
    if (this.value !== "bad") {
        var scoutId = parseInt(this.value, 10);
        data.scoutNumber = scoutId;
        $.get(baseUrl + "/register", { "scout_id": scoutId, "event_id": eventId }, function(serverData) {
            var matchNumbersArray = serverData.map(function(match) {
                return match.match_number;
            });
            var matchNumbers = {};
            matchNumbersArray.forEach(function(num) {
                matchNumbers[num] = num;
            });
            var matches = createSelect("match-numbers", matchNumbers);
            var bad = document.createElement("option");
            bad.value = "bad";
            bad.appendChild(document.createTextNode(""));
            matches.insertBefore(bad, matches.firstChild);
            matches.value = "bad";
            matches.on("change", function() {
                if (this.value !== "bad") {
                    data.matchNumber = parseInt(this.value, 10);
                    activateSelector("#start", true);
                    var match = serverData[data.matchNumber - 1];
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
            $("#match-number-span").appendChild(matches);
        });
    }
});

$("#start").on("click", function(e) {
    activateSelector("#initial-overlay", false);
    activateSelector("#data-mode", true);
});

var littleRobot = spawnLittleRobot(100, 169);
$("#field-container").appendChild(littleRobot);

var fieldContainer = $("#field-container");

fieldContainer.on("click", function(e) {
    var x = e.clientX;
    var y = e.clientY;
    if (x + 25 > data.MAX_X) x = data.MAX_X - 25;
    if (y + 25 > data.MAX_Y) y = data.MAX_Y - 25;
    if (x < 25) x = 25;
    if (y < 25) y = 25;
    littleRobot.style.left = (x - 25) + "px";
    littleRobot.style.top = (y - 25) + "px";
    data.fieldCallback(x, y);
});

fieldContainer.on("mouseup", function(e) {
    setTimeout(function() {
        activateSelector("#scout-buttons", true);
        activateSelector("#field-container", false);
    }, 200);
});

// general

$(".scout.toggle").on("click", function(e) {
    var name = this.id;
    var enabled = this.classList.contains("off");
    this.classList[enabled ? "add" : "remove"]("on");
    this.classList[!enabled ? "add" : "remove"]("off");
    if (this.dataset.value != null) {
        var v = this.value;
        this.value = this.dataset.value;
        this.dataset.value = v;
    }
    getLastXY(function(x, y) {
        storeAction(name, "other", enabled, x, y);
    });
});

$("#reset").on("click", function(e) {
    document.location.reload(true);
});

// auto

$(".scout.auto.position").on("click", function(e) {
    var name = this.id;
    getXY(this.value, function(x, y) {
        data.autoMeta[name] = {"x": x, "y": y};
    });
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
    if (confirm("Confirm autonomous over")) {
        data.modeTeleop = true;
        data.teleopMeta.deadBot = data.autoMeta.deadBot;
        activateSelector("#auto", false);
        activateSelector("#teleop", true);
        activateSelector("#bottom-buttons .auto", false);
        activateSelector("#bottom-buttons .teleop", true);
    }
});

// teleop

$(".scout.teleop.collect").on("click", function(e) {
    var name = this.id;
    getXY(this.value, function(x, y) {
        activateSelector("#collect", false);
        activateSelector("#eject", true);
        storeAction(name, "collect", 1, x, y);
    });
});

$(".scout.teleop.eject").on("click", function(e) {
    var name = this.id;
    getXY(this.value, function(x, y) {
        activateSelector("#collect", true);
        activateSelector("#eject", false);
        storeAction(name, "eject", 1, x, y);
    });
});

$("#undo-teleop").on("click", function(e) {
    if ($("#field-container").classList.contains("not-active")) {
        var action = undoAction();
        var undidCollect = action.category === "collect";
        activateSelector("#collect", undidCollect);
        activateSelector("#eject", !undidCollect);
    }
    activateSelector("#scout-buttons", true);
    activateSelector("#field-container", false);
});

$("#teleop-done").on("click", function(e) {
    if (confirm("Confirm match over")) {
        $.post(baseUrl + "/match", {
            "event_id": eventId,
            "match_number": data.matchNumber,
            "team_number": data.currentTeam,
            "scout_number": parseInt($("#scout-number").value, 10),
            "scout_name": "unknown",
            "actions": data.teleop.map(function(action) {
                return {
                    "action": action.action,
                    "value": action.value,
                    "x": action.x,
                    "y": action.y,
                    "time": action.time
                };
            }),
            "autonomous": data.autoMeta
        }, function(data) {
            console.log(data["error"]);
            cleanup();
        });
    }
});

$("#data-mode input.scout:not(.auto)").on("click", function(e) {
    var self = this;
    $(".scout.defence").each(function(element) {
        if (self !== element) {
            var enabled = false;
            var wasEnabled = element.classList.contains("on");
            element.classList.remove("on");
            element.classList.add("off");
            if (wasEnabled) {
                if (element.dataset.value != null) {
                    var v = element.value;
                    element.value = element.dataset.value;
                    element.dataset.value = v;
                }
                storeAction(element.id, "other", enabled, -1, -1);
            }
        }
    });
});
