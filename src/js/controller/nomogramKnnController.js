"use strict"

var App = App || {};

let NomogramKnnController = function(targetID) {

    let self = {
        targetElement: null
    };

    init();

    function init() {
        self.targetElement = d3.select(targetID);
        self.targetElement.on("change", checkKnnSelection);
    }

    function checkKnnSelection() {
        let selected = self.targetElement.property('checked');

        if (selected) {
            // update nomogram with the knn mode
            App.views.nomogram.setMode("knn");
        } else {
            // update nomogram with the normal mode
            App.views.nomogram.setMode("filter");
        }
    }

}
