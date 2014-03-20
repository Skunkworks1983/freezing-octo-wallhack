var baseUrl = window.location.href + "api";
var nop = function() {};

var defaultData = {
    "scoutNumber": -1,
    "scoutName": "unknown",
    "currentTeam": -1,
    "color": "green",
    "matchNumber": -1,
    "matchLevel": "qm",
    "matchKey": "1970wano_qm-1",

    "modeTeleop": false,

    "auto": [],
    "teleop": [],

    "fieldCallback": nop,

    "MAX_X": 960,
    "MAX_Y": 437,
    "INITIAL_X": 400,
    "INITIAL_Y": 219,
    "LAST_X": -1,
    "LAST_Y": -1
};
var data = clone(defaultData);

activateSelector("#match-info", false);
activateSelector("#start", false);

$("#event-name").innerHTML = eventName;
$("#scout-number").on("change", function(e) {
    if (this.value === "bad") {
        activateSelector("#match-info", false);
        activateSelector("#start", false);
    } else {
        $("#robot-number").innerHTML = "0000";
        $("#robot-number").classList.remove("blue");
        $("#robot-number").classList.remove("red");
        $("#match-number-span").innerHTML = "";
        var scoutId = parseInt(this.value, 10);
        data.scoutNumber = scoutId;
        $.get(baseUrl + "/register", { "scout_id": scoutId, "event_id": eventId }, function(serverData) {
            var matchNumbers = {};
            serverData = serverData.sort(matchListSorter);
            serverData.forEach(function(match) {
                var text;
                switch (match.comp_level) {
                case "qm": // quals
                    text = "" + match.match_number;
                    break;
                case "qf": // quarters
                    text = "QF " + match.set_number + ", " + match.match_number;
                    break;
                case "sf": // semis
                    text = "SF " + match.set_number + ", " + match.match_number;
                    break;
                case "f":  // finals
                    text = "F " + match.match_number;
                    break;
                }
                matchNumbers[match.key] = text;
            });
            var matches = createSelect("match-numbers", matchNumbers);
            var bad = document.createElement("option");
            bad.value = "bad";
            bad.appendChild(document.createTextNode(""));
            matches.insertBefore(bad, matches.firstChild);
            matches.value = "bad";
            matches.on("change", function() {
                if (this.value !== "bad") {
                    var matchKey = this.value;
                    var match = searchServerData(serverData, matchKey);
                    data.matchNumber = match.match_number;
                    data.matchLevel = match.comp_level;
                    data.matchKey = matchKey;
                    $("#robot-number").innerHTML = match.team_number;
                    data.currentTeam = match.team_number;
                    data.color = match.color;
                    $("#robot-number").classList.remove("blue");
                    $("#robot-number").classList.remove("red");
                    $("#robot-number").classList.add(match.color === "blue" ? "blue" : "red");
                    $("#robot-number").innerHTML = match.team_number;
                    $("#the-big-robot-number").classList.remove("blue");
                    $("#the-big-robot-number").classList.remove("red");
                    $("#the-big-robot-number").classList.add(match.color === "blue" ? "blue" : "red");
                    $("#the-big-robot-number").innerHTML = match.team_number;
                    activateSelector("#start", true);
                } else {
                    $("#robot-number").innerHTML = "0000";
                    $("#robot-color").innerHTML = "";
                    activateSelector("#start", false);
                }
            });
            $("#match-number-span").appendChild(matches);
            activateSelector("#match-info", true);
        });
    }
});

$("#start").on("click", function(e) {
    activateSelector("#initial-overlay", false);
    activateSelector("#data-mode", true);
});

var littleRobot = spawnLittleRobot(400, 219);
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
    data.LAST_X = x;
    data.LAST_Y = y;
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
    var pretty = this.value;
    var enabled = this.classList.contains("off");
    this.classList[enabled ? "add" : "remove"]("on");
    this.classList[!enabled ? "add" : "remove"]("off");
    if (this.dataset.value != null) {
        var v = this.value;
        this.value = this.dataset.value;
        this.dataset.value = v;
    }
    getLastXY(function(x, y) {
        storeAction(name, "toggle", enabled, x, y, pretty);
    });
});

// auto

$(".scout.auto").on("click", function(e) {
    var name = (this.dataset.name != null ? this.dataset.name : this.id);
    var pretty = (this.dataset.value != null ? this.dataset.value : this.value);
    var isAutoDone = (this.id === "auto-done");
    console.log(isAutoDone);
    getXY(pretty, function(x, y) {
        storeAction(name, "auto", 1, x, y, pretty);
        if (isAutoDone) {
            confirm("Confirm autonomous over") ? switchToTeleop(true) : undoAction();
        }
    });
});

// teleop

$(".scout.teleop.collect").on("click", function(e) {
    var name = this.id;
    var pretty = this.value;
    getXY(pretty, function(x, y) {
        activateSelector("#collect", false);
        activateSelector("#eject", true);
        storeAction(name, "collect", 1, x, y, pretty);
    });
});

$(".scout.teleop.eject").on("click", function(e) {
    var name = this.id;
    var pretty = this.value;
    getXY(pretty, function(x, y) {
        activateSelector("#collect", true);
        activateSelector("#eject", false);
        storeAction(name, "eject", 1, x, y, pretty);
    });
});

$("#undo").on("click", function(e) {
    if ($("#field-container").classList.contains("not-active")) {
        var action = undoAction();
        if (action.category === "collect" || action.category === "eject") {
            var undidCollect = action.category === "collect";
            activateSelector("#collect", undidCollect);
            activateSelector("#eject", !undidCollect);
        }
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
                var pretty = element.value;
                if (element.dataset.value != null) {
                    var v = element.value;
                    element.value = element.dataset.value;
                    element.dataset.value = v;
                }
                storeAction(element.id, "other", enabled, -1, -1, pretty);
            }
        }
    });
});
