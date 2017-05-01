"use strict"

var App = App || {};

let NomogramView = function() {

    let self = {
        targetID: null,
        targetElement: null,
        knnNomogram: null,
        axesRange: [],
        axesDomain: []
    };

    function init(targetID) {
        self.targetID = "#" + targetID;
        self.targetElement = d3.select("#" + targetID);
    }

    function updateKnn(patients) {
        self.targetElement.selectAll("*").remove();

        let axesKnnFiltered = Object.keys(App.nomogramAxesRange);

        self.knnNomogram = new Nomogram()
            .data(patients.neighbors)
            .target(self.targetID)
            .setAxes(axesKnnFiltered.map(el => {
                return {
                    name: el,
                    // label: axisLabels[el],
                    // domain: axesDomain[el].map(d => d),
                    // rangeShrink: axesRange[el]
                };
            }), "reduce")
            .margins({
                top: 20,
                left: 40,
                bottom: 50,
                right: 80
            })
            .titlePosition("bottom")
            .titleRotation(-10)
            .brushable(true)
            .onMouseOver("hide-other")
            .onMouseOut("reset-paths")
            .draw();

    }

    /* get the updated attribute domians */
    function updateAttributeDomains(newDomains) {
    }


    return {
        init,
        updateKnn,
        updateAttributeDomains
    };
}
