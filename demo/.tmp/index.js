'use strict';

var typography = require('./typography-63859aa8.js');

var index = (function (_a) {
    var files = _a.data.files;
    return (typography.React.createElement(typography.React.Fragment, null,
        typography.React.createElement(typography.H1, null, "Welcome to Starry! \u2728"),
        typography.React.createElement("a", { href: "/about" }, "About"),
        typography.React.createElement("p", null, "This is just a demo. More exciting things to come!"),
        typography.React.createElement("ul", null, files.map(function (file) {
            return typography.React.createElement("li", null, file.name);
        }))));
});

module.exports = index;
