var data = {};

var enableClassButtons = function(className, enabled) {
    var buttons = document.querySelectorAll(".scout:not(#done)." + className);
    for (var i = 0; i < buttons.length; i++) {
        var button = buttons[i];
        if (!button.classList.contains("always-on")) {
            button.disabled = !enabled;
        }
    }
}

var processData = function(robotData) {
    var copy = JSON.parse(JSON.stringify(robotData));
    console.log(copy); // or do other thing
}

window.addEventListener("load", function() {
    var buttons = document.querySelectorAll(".scout:not(#done)");
    for (var i = 0; i < buttons.length; i++) {
        var button = buttons[i];
        button.dataset.originalValue = button.value;
        enableClassButtons("eject", false);

        data[button.id] = 0;
        button.value = button.dataset.originalValue + ": " + data[button.id];
        button.addEventListener("click", function() {
            data[this.id] += 1;
            this.value = this.dataset.originalValue + ": " + data[this.id];
            var ballStateChanged = (this.classList.contains("collect") || this.classList.contains("eject")) && !this.classList.contains("bad");
            if (ballStateChanged) {
                if (this.classList.contains("collect")) {
                    document.getElementById("ball-status").innerHTML = "Yup";
                    enableClassButtons("collect", false);
                    enableClassButtons("eject", true);
                } else {
                    document.getElementById("ball-status").innerHTML = "Nope";
                    enableClassButtons("collect", true);
                    enableClassButtons("eject", false);
                }
            }
        });
    }
    document.getElementById("done").addEventListener("click", function() {
        processData(data);
        var buttons = document.querySelectorAll(".scout:not(#done)");
        for (var i = 0; i < buttons.length; i++) {
            var button = buttons[i];
            data[button.id] = 0;
            button.value = button.dataset.originalValue + ": " + data[button.id];
            document.getElementById("ball-status").innerHTML = "Nope";
            enableClassButtons("collect", true);
            enableClassButtons("eject", false);
        }
    });
});
