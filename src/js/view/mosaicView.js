"use strict"

var App = App || {};

let MosaicView = function(targetID) {

    let self = {
        targetElement: null,
        targetSvg: null,
        attrOrder: [],
        currentAttrs: []
    };

    init();

    function init() {
        self.targetElement = d3.select(targetID);

        self.targetSvg = self.targetElement.append("svg")
            .attr("width", self.targetElement.node().clientWidth)
            .attr("height", self.targetElement.node().clientHeight)
            .attr("viewBox", "0 0 100 100")
            .attr("preserveAspectRatio", "xMidYMin")
            .style("background", "pink");

        self.attrOrder = App.mosaicAttributeOrder;
        self.currentAttrs = [self.attrOrder[0], self.attrOrder[1]];
    }

    /* update the view based on the current two attributes */
    function update() {

    }

    return {
        update
    };
}
