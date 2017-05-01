"use strict"

var App = App || {};

let NomogramKnnController = function(targetID) {

    let self = {
        targetElement: null
    };

    init();

    function init() {
        self.targetElement = d3.select(targetID);
        self.targetElement.on("change", selectKnn);
    }

    function selectKnn() {
        let selected = self.targetElement.property('checked');
        console.log("knnCheckBox: " + selected);

        if (selected) {
            // update nomogram with the knn mode
            App.views.nomogram.setMode("knn");

        } else { 
            // update nomogram with the normal mode
            App.views.nomogram.setMode("filter");
        }
        App.views.nomogram.updateView();
    }

    return {
      selectKnn
    };
}
