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

    /* update the attribute for coloring the kaplan-meier plot */
    function updateAttributeColor(attr) {
        let colorFun = function(d) {
            return App.attributeColors(d[attr]);
        }
    }


    return {
      updateAttributeColor
    };
}
