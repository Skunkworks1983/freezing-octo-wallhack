// 1920×1200

var robot = {};

var enableClassButtons = function(className, enabled) {
    var buttons = document.querySelectorAll(".scout." + className);
    for (var i = 0; i < buttons.length; i++) {
        if (!buttons[i].classList.contains("always-on")) {
            buttons[i].disabled = !enabled;
        }
    }
}

var processData = function(robotData) {
    var copy = dupe(robotData);
    console.log(copy); // or do other thing
}

var dupe = function() {
    var obj = {};
    [].slice.call(arguments, 0).forEach(function(source) {
        if (source) {
            for (var prop in source) {
                obj[prop] = source[prop];
            }
        }
    });
    return obj;
};

window.addEventListener("load", function() {
    var buttons = document.querySelectorAll(".scout:not(#done)");
    for (var i = 0; i < buttons.length; i++) {
        var button = buttons[i];
        button.dataset.originalValue = button.value;
        enableClassButtons("eject", false);

        robot[button.id] = 0;
        button.value = button.dataset.originalValue + ": " + robot[button.id];
        button.addEventListener("click", function() {
            robot[this.id] += 1;
            this.value = this.dataset.originalValue + ": " + robot[this.id];
            var gotBall = this.classList.contains("collect") ? true : false;
            var ballStateChanged = !this.classList.contains("bad") && !this.classList.contains("always-on");
            if (ballStateChanged) {
                document.getElementById("ball-status").innerHTML = (gotBall ? "Yup" : "Nope");
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
    document.getElementById("done").addEventListener("click", function() {
        processData(robot);
        var buttons = document.querySelectorAll(".scout");
        for (var i = 0; i < buttons.length; i++) {
            var button = buttons[i];
            robot[button.id] = 0;
            button.value = button.dataset.originalValue + ": " + robot[button.id];
        }
        enableClassButtons("collect", true);
        enableClassButtons("eject", false);
        document.getElementById("ball-status").innerHTML = "Nope";
    });
});
