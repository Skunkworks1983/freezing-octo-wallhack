var $ = document.querySelectorAll.bind(document);
Element.prototype.on = Element.prototype.addEventListener;
NodeList.prototype.on = function() {
	var args = arguments;
	this.forEach(function(element, i) {
		Element.prototype.addEventListener.apply(element, args);
	});
};
NodeList.prototype.forEach = function(callback) {
    for (var i = 0; i < this.length; ++i) {
        var element = this[i];
        callback(element, i, this);
    }
};

var enableButtons = function(selector, enabled) {
	$(selector).forEach(function(element) {
		if (!element.classList.contains("always-on")) {
            element.disabled = !enabled;
            if (enabled) {
                element.classList.remove("disabled");
            } else {
                element.classList.add("disabled");
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
}

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
    return dataStack.pop();
};
