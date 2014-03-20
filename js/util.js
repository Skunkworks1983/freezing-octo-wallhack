var l = function() { console.log.apply(console, arguments); };

var activateSelector = function(selector, activated) {
    $(selector).each(function(element) {
        if (!element.classList.contains("always-on")) {
            if (activated) {
                element.classList.add("active");
                element.classList.remove("not-active");
            } else {
                element.classList.add("not-active");
                element.classList.remove("active");
            }
        }
    });
};

var clone = function(obj) {
    if (obj == null || typeof obj !== "object") return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) {
            if (typeof obj[attr] === "object") {
                copy[attr] = clone(obj[attr]);
            } else {
                copy[attr] = obj[attr];
            }
        }
    }
    return copy;
}


var onLongPress = function(element, callback) {
    var interval;
    element.on("mousedown", function(e) {
        e.preventDefault();
        clearTimeout(interval);
        interval = setTimeout(function() {
            callback.call(element, e);
        }, 200);
    });
    element.on("mouseup", function(e) {
        e.preventDefault();
        clearTimeout(interval);
    });
};

var spawnLittleRobot = function(x, y) {
    var littleRobot = document.createElement("div");
    littleRobot.id = "little-robot";
    littleRobot.style.left = (x - 25) + "px";
    littleRobot.style.top = (y - 25) + "px";
    return littleRobot;
};

var storeAction = function(name, category, value, x, y, prettyName) {
    data[data.modeTeleop ? "teleop" : "auto"].push({
        "action": name,
        "category": category,
        "value": value,
        "x": x,
        "y": y,
        "time": Date.now() / 1000, // postgresql doesn't like millis so this is best fix
        "prettyName": prettyName
    });
    $("#undo-info").innerHTML = prettyName;
};

var undoAction = function() {
    var mode = data.modeTeleop ? "teleop" : "auto";
    if (data[mode].length < 1) return {"category": "collect"}; // nah mate
    var undid = data[mode].pop();
    if (data[mode].length > 0) {
        var pretty = data[mode][data[mode].length - 1].prettyName;
        $("#undo-info").innerHTML = pretty; // kill me
    } else {
        $("#undo-info").innerHTML = "Nothing";
    }
    return undid;
};

var createSelect = function(id, options) {
    var select = document.createElement("select");
    for (var value in options) {
        if (options.hasOwnProperty(value)) {
            var text = options[value];
            if (text.hasOwnProperty("text")) {
                text = text.text;
            }
            var option = document.createElement("option");
            option.value = value;
            option.appendChild(document.createTextNode(text));
            select.appendChild(option);
        }
    }
    select.id = id;
    return select;
};

var getXY = function(displayText, callback) {
    $("#field-text").innerHTML = displayText;
    var period = data.modeTeleop ? "teleop" : "auto";
    activateSelector("#" + period + "-done", false);
    data.fieldCallback = function(x, y) {
        activateSelector("#" + period + "-done", true);
        callback(x, y);
    };
    activateSelector("#field-container", true);
    activateSelector("#scout-buttons", false);
};

var getLastXY = function(callback, forceAuto) { // callback because of the other one lol
    callback(data.LAST_X, data.LAST_Y);
};

var switchToTeleop = function(teleop) {
    if (teleop == null) teleop = true;
    data.modeTeleop = teleop;
    activateSelector("#auto", !teleop);
    activateSelector("#teleop", teleop);
    activateSelector("#bottom-buttons .auto", !teleop);
    activateSelector("#bottom-buttons .teleop", teleop);
}

var cleanup = function() {
    // reset all data
    var oldData = clone(data);
    data = clone(defaultData);
    // reset toggles
    $(".scout.toggle").each(function(element) {
        var enabled = false;
        var wasEnabled = element.classList.contains("on");
        element.classList.remove("on");
        element.classList.add("off");
        if (element.dataset.value != null && wasEnabled) {
            var v = element.value;
            element.value = element.dataset.value;
            element.dataset.value = v;
        }
    });
    // reset auto position
    $(".scout.auto.status").each(function(element) {
        element.classList.remove("selected");
    });
    // reset current xy/littleRobot/field
    $("#field-container").removeChild(littleRobot);
    littleRobot = spawnLittleRobot(100, 169);
    $("#field-container").appendChild(littleRobot);
    activateSelector("#field-container", false);
    activateSelector("#scout-buttons", true);
    // reset auto/teleop
    activateSelector("#auto", true);
    activateSelector("#teleop", false);
    activateSelector("#bottom-buttons .auto", true);
    activateSelector("#bottom-buttons .teleop", false);
    // keep scoutName/Number same
    data.scoutNumber = oldData.scoutNumber;
    data.scoutName = oldData.scoutName;
    // advance match by one
    data.matchNumber = oldData.matchNumber + 1;
    var matchChangeEvent = new Event("change", {
        "view": window,
        "bubbles": true,
        "cancelable": true
    });
    $("#match-numbers").selectedIndex += 1;
    $("#match-numbers").dispatchEvent(matchChangeEvent);
    // reset initial overlay
    activateSelector("#data-mode", false);
    activateSelector("#initial-overlay", true);
    if (data.teleop.length !== 0) {
        console.log("pls no");
    }
};

var compLevelConvert = function(level) {
    switch (level) {
    case "qm":
        return 1;
    case "qf":
        return 2;
    case "sf":
        return 3;
    case "f":
        return 4;
    }
};

var matchListSorter = function(a, b) {
    if (a.key === b.key) return 0;
    if (a.comp_level !== b.comp_level) {
        return (compLevelConvert(a.comp_level) > compLevelConvert(b.comp_level)) ? 1 : -1;
    } else {
        return (a.sort_number > b.sort_number) ? 1 : -1;
    }
};

var searchServerData = function(serverData, matchKey) {
    for (var i = 0; i < serverData.length; i++) { // no foreach here
        if (serverData[i].key === matchKey) return serverData[i];
    }
    return null;
};
