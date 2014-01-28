var dataStack = [];
var littleRobotX = -1;
var littleRobotY = -1;

var pushData = function(id, value, x, y) {
	dataStack.push({
		"action": id,
		"value": value,
		"x": x,
		"y": y,
		"time": Date.getTime()
	});
};

var undoData = function() {
	return dataStack.pop();
};

var consolidateData = function() {
	var data = {};
	dataStack.forEach(function(d) {
		data[d.action] != null ? data[d.action] += d.value : data[d.action] = d.value;
	});
	return data;
};

var longPress = function(element, callback) {
	var interval;
	element.addEventListener("mousedown", function(e) {
		e.preventDefault();
		clearTimeout(interval);
		interval = setTimeout(function() {
			callback.call(element, e);
		}, 200);
	});
	element.addEventListener("mouseup", function(e) {
		e.preventDefault();
		clearTimeout(interval);
	});
};

var enableClassButtons = function(className, enabled) {
    var buttons = document.querySelectorAll(".scout." + className);
    for (var i = 0; i < buttons.length; i++) {
        if (!buttons[i].classList.contains("always-on")) {
            buttons[i].disabled = !enabled;
            if (enabled) {
            	buttons[i].classList.remove("disabled");
            } else {
            	buttons[i].classList.add("disabled");
            }
        }
    }
}

var init = function(e) {
	document.getElementById("start").addEventListener("click", function() {
		document.getElementById("initial-overlay").classList.toggle("active");
		document.getElementById("data-mode").classList.toggle("active");
	});
	document.getElementById("field-container").addEventListener("click", function(even) {
		if (littleRobotX === -1 && littleRobotY === -1) {
			enableClassButtons("collect", true);
		}
		fieldImg = document.getElementById("field");
		var maxX = 742
		var maxY = 338
		littleRobot = document.getElementById("little-robot");
		if (littleRobot == null) {
			littleRobot = document.createElement("div");
			littleRobot.id = "little-robot";
			this.appendChild(littleRobot);
		}
		var x = even.x;
		var y = even.y;
		if (x + 25 > maxX) x = maxX - 25;
		if (y + 25 > maxY) y = maxY - 25;
		if (x < 25) x = 25;
		if (y < 25) y = 25;
		littleRobot.style.left = (x - 25) + "px";
		littleRobot.style.top = (y - 25) + "px";
		littleRobotX = x;
		littleRobotY = y;
	});
	longPress(document.getElementById("field-container"), function(even) {
		even.preventDefault();
		alert("you're a winner");
	});
	var buttons = document.querySelectorAll(".scout:not(#start)");
    for (var i = 0; i < buttons.length; i++) {
        var button = buttons[i];
        enableClassButtons("eject", false);
        enableClassButtons("collect", false);

        button.addEventListener("click", function() {
        	pushData(this.id, 1, littleRobotX, littleRobotY);
            var gotBall = this.classList.contains("collect") ? true : false;
            var ballStateChanged = !this.classList.contains("bad") && !this.classList.contains("always-on");
            if (ballStateChanged) {
                if (gotBall) {
                    enableClassButtons("collect", false);
                    enableClassButtons("eject", true);
                } else {
                    enableClassButtons("collect", true);
                    enableClassButtons("eject", false);
                }
            }
        });
    }
};

window.addEventListener("load", init);
