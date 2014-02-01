/* jquery condensed into 27 lines */
var $ = function() {
    var elementList = document.querySelectorAll.apply(document, arguments);
    if (elementList.length === 1) elementList = elementList[0];
    return elementList;
};
Element.prototype.on = function() {
    this.addEventListener.apply(this, arguments);
    return this;
};
Element.prototype.each = function(callback) {
    callback(this, 1, [this]);
    return this;
};
NodeList.prototype.on = function() {
    var args = arguments;
    this.each(function(element) {
        element.on.apply(element, args);
    });
    return this;
};
NodeList.prototype.each = function(callback) {
    for (var i = 0; i < this.length; ++i) {
        var element = this[i];
        callback(element, i, this);
    }
    return this;
};

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
    littleRobot.style.top = (y - 25) + "px"; // grid cause grace said so nothx
    return littleRobot;
};

var storeAction = function(name, value, x, y) {
    data[data.modeTeleop ? "teleop" : "auto"].push({
        "action": name,
        "value": value,
        "x": x,
        "y": y,
        "time": Date.now()
    });
};

var undoAction = function() {
    return data[data.modeTeleop ? "teleop" : "auto"].pop();
};
