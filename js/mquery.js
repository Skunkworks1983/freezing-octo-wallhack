/* jquery condensed into 797 bytes compressed */
;(function(global, doc) {

// dom

var $ = function() {
    var elementList = document.querySelectorAll.apply(doc, arguments);
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

// ajax

var request = function(type, url, data, callback) {
    var xhr = new XMLHttpRequest(); // lol chrome
    var fd;
    if (typeof data === "function") {
        callback = data;
        data = null;
    }
    xhr.open(type, url);
    if (type === "POST" && data != null) {
        fd = new FormData();
        for (var key in data) {
            fd.append(key, JSON.stringify(data[key]));
        }
    }
    xhr.onload = function() {
        callback(JSON.parse(this.response));
    };
    xhr.send((data != null) ? fd : null);
};

$.get = request.bind(global, "GET");
$.post = request.bind(global, "POST");

// attach

global.$ = $;

})(this, this.document, undefined);