"use strict"

var App = App || {};

let KaplanMeierView = function(targetID) {

    let self = {
        targetElement: null,
        targetSvg: null,
        maxOS: null
    };

    init();

    function init() {
        self.targetElement = d3.select(targetID);

        self.targetSvg = self.targetElement.append("svg")
            .attr("width", self.targetElement.node().clientWidth)
            .attr("height", self.targetElement.node().clientHeight)
            .attr("viewBox", "0 0 120 100")
            .attr("preserveAspectRatio", "xMidYMin");

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
            .style("stroke-width", "1");

    }


    /* update the kaplan-meier plot based on the selected attribute*/
    function update(KMData) {
        console.log(KMData);
        d3.selectAll(".kmPlots").remove();

        let x = d3.scaleLinear()
            .domain([0, self.maxOS])
            .range([10, 110]);

        let y = d3.scaleLinear()
            .domain([0, 1])
            .range([90, 10]);

        for (let attrKey of Object.keys(KMData)) {
            if (KMData[attrKey].length > 0) {
                drawKMPlot(KMData[attrKey], x, y, App.attributeColors(attrKey));
            }
        }
    }

    /* draw the kaplan-meier plot */
    function drawKMPlot(data, xScale, yScale, color) {
        let lineData = [{
            x: xScale(data[0].OS),
            y: yScale(1)
        }, {
            x: xScale(data[0].OS),
            y: yScale(data[0].prob)
        }];

        for (let i = 1; i < data.length; i++) {
            lineData.push({
                x: xScale(data[i].OS),
                y: yScale(data[i - 1].prob)
            });
            lineData.push({
                x: xScale(data[i].OS),
                y: yScale(data[i].prob)
            });
        }

        let lineFunc = d3.line()
            .x(function(d) {
                return d.x;
            })
            .y(function(d) {
                return d.y;
            });

        let plot = self.targetSvg.append("path")
            .attr("class", "kmPlots")
            .attr("d", lineFunc(lineData))
            .style("stroke", color)
            .style("stroke-width", 1)
            .style("fill", "none");
    }

    /* set the maximum value on X-axis */
    function setMaxOS(os) {
        self.maxOS = os;
    }


    return {
        update,
        setMaxOS
    };
}
