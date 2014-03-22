/* jquery but small and with bad practices */
;(function(global, doc) {

// dom

var $ = function() {
    var elementList = doc.querySelectorAll.apply(doc, arguments);
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

// only one that can't be predefined
NodeList.prototype.each = function(callback) {
    for (var i = 0; i < this.length; ++i) {
        var element = this[i];
        callback(element, i, this);
    }
    return this;
};

"on|dispatchEvent".split("|").forEach(function(functionName) {
    NodeList.prototype[functionName] = function() {
        var args = arguments;
        this.each(function(element) {
            element[functionName].apply(element, args);
        });
        return this;
    };
});

// ajax

var request = function(type, url, data, callback) {
    var xhr = new XMLHttpRequest(); // lol chrome
    var fd;
    var posting = false;
    var actualUrl = url;
    if (typeof data === "function") {
        callback = data;
        data = null;
    }
    if (data != null && Object.keys(data).length !== 0) {
        if (type === "POST" || type === "PUT") {
            posting = true;
            fd = new FormData();
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    fd.append(key, JSON.stringify(data[key]));
                }
            }
        } else {
            actualUrl = actualUrl + "?" + Object.keys(data).map(function(key) {
                var val = key + "=";
                if (Array.isArray(data[key])) {
                    return data[key].map(function(v) {
                        return val + JSON.stringify(v);
                    }).join("&");
                } else {
                    return val + data[key];
                }
            }).join("&");
        }
    }
    xhr.open(type, actualUrl);
    xhr.onload = function() {
        var incomingData;
        try {
            incomingData = JSON.parse(this.response);
        } catch (e) {
            incomingData = {"error": e};
        }
        callback(incomingData);
    };
    xhr.send(posting ? fd : null);
};

$.get = request.bind(global, "GET");
$.post = request.bind(global, "POST");
$.delete = request.bind(global, "DELETE");
$.put = request.bind(global, "PUT");

// attach

global.$ = $;

})(this, this.document, undefined);
