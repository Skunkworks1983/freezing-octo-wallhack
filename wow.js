var init = function(e) {
    var limitedChars = document.querySelectorAll(".limit-chars");
    for (var i = 0; i < limitedChars.length; i++) {
        limitedChars[i].addEventListener("input", function(e) {
            this.value = this.value.replace(/[^\d]/g, "");
            if (this.value.length > this.dataset.maxLength) {
                this.value = this.value.substring(0, this.dataset.maxLength);
            }
        });
    }
};

window.addEventListener("load", init);