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

var init = function(e) {
	document.getElementById("start").addEventListener("click", function() {
		document.getElementById("initial-overlay").classList.toggle("active");
		document.getElementById("autonomous").classList.toggle("active");
	});
	document.getElementById("field-container").addEventListener("click", function(even) {
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
	});
	longPress(document.getElementById("field-container"), function(even) {
		even.preventDefault();
		alert("you're a winner");
	});
};

window.addEventListener("load", init);
