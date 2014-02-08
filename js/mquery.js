/* jquery condensed into 461 bytes compressed */
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
