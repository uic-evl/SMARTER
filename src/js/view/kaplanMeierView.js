"use strict"

var App = App || {};

let KaplanMeierView = function(targetID) {

    let self = {
        targetElement: null
    };

    init();

    function init() {
        self.targetElement = d3.select(targetID);
    }

}
