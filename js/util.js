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

var storeAction = function(name, category, value, x, y) {
    data[data.modeTeleop ? "teleop" : "auto"].push({
        "action": name,
        "category": category,
        "value": value,
        "x": x,
        "y": y,
        "time": Date.now() / 1000 // postgresql doesn't like millis so this is best fix
    });
};

var undoAction = function() {
    return data[data.modeTeleop ? "teleop" : "auto"].pop();
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
    data.fieldCallback = callback;
    activateSelector("#field-container", true);
    activateSelector("#scout-buttons", false);
};

var getLastXY = function(callback, forceAuto) { // callback because of the other one lol
    callback(data.LAST_X, data.LAST_Y);
};

var cleanup = function() {
    // reset all data
    var newData = defaultData;
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
    newData.scoutNumber = data.scoutNumber;
    newData.scoutName = data.scoutName
    // advance match by one
    newData.matchNumber = data.matchNumber + 1
    var matchChangeEvent = new Event("change", {
        "view": window,
        "bubbles": true,
        "cancelable": true
    });
    $("#match-numbers").value = newData.matchNumber;
    $("#match-numbers").dispatchEvent(matchChangeEvent);
    // reset initial overlay
    activateSelector("#data-mode", false);
    activateSelector("#initial-overlay", true);
    data = newData;
};
