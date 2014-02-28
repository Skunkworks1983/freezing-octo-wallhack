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

var getXY = function(callback) {
    data.fieldCallback = callback;
    activateSelector("#scout-buttons", false);
    activateSelector("#field-container", true);
};

var getLastXY = function(callback, forceAuto) { // callback because of the other one lol
    callback(data.LAST_X, data.LAST_Y);
};
