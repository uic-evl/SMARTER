"use strict"

var App = App || {};

let KaplanMeierView = function(targetID) {

    let self = {
        targetElement: null,
        targetSvg: null,
        selectedAttribute: null
    };

    init();

    function init() {
        self.targetElement = d3.select(targetID);

        self.targetSvg = self.targetElement.append("svg")
            .attr("width", self.targetElement.node().clientWidth)
            .attr("height", self.targetElement.node().clientHeight)
            .attr("viewBox", "0 0 120 100")
            .attr("preserveAspectRatio", "xMidYMin")
            .style("background-color", "pink");

        drawXAxis();
        drawYAxis();
    }

    function drawXAxis() {
        self.targetSvg.append("line")
            .attr("x1", 10)
            .attr("y1", 90)
            .attr("x2", 110)
            .attr("y2", 90)
            .style("stroke", "black")
            .style("stroke-width", "1px");
    }

    function drawYAxis() {
        self.targetSvg.append("line")
            .attr("x1", 10)
            .attr("y1", 10)
            .attr("x2", 10)
            .attr("y2", 90)
            .style("stroke", "black")
            .style("stroke-width", "1px");

    }

    /* update the attribute for coloring the kaplan-meier plot */
    function updateAttributeColor(KMData, attr) {
        let colorFun = function(d) {
            return App.attributeColors(d[attr]);
        }

        self.selectedAttribute = attr;

        update(KMData);
    }

    /* update the kaplan-meier plot based on the selected attribute*/
    function update(KMData) {
      console.log(KMData);
    }


    return {
        update,
        updateAttributeColor
    };
}
