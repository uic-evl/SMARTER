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
            .style("stroke-width", "0.6px");
    }

    function drawYAxis() {
        self.targetSvg.append("line")
            .attr("x1", 10)
            .attr("y1", 10)
            .attr("x2", 10)
            .attr("y2", 90)
            .style("stroke", "black")
            .style("stroke-width", "0.6px");

    }


    /* update the kaplan-meier plot based on the selected attribute*/
    function update(KMData) {
        // console.log(KMData);
        d3.selectAll(".kmVar").remove();
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
        // draw rect for showing variances
        for (let j = 0; j < data.length - 1; j++) {
            let x1 = xScale(data[j].OS);
            let x2 = xScale(data[j + 1].OS);
            let y1 = yScale(Math.max(0, data[j].prob - 1.96 * Math.sqrt(data[j].var)));
            let y2 = yScale(Math.min(1, data[j].prob + 1.96 * Math.sqrt(data[j].var)));

            self.targetSvg.append("rect")
                .attr("class", "kmVar")
                .attr("x", x1)
                .attr("y", y2)
                .attr("width", x2 - x1)
                .attr("height", y1 - y2)
                .style("stroke", "none")
                .style("fill", color)
                .style("opacity", 0.5);
        }

        // draw line
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

        self.targetSvg.append("path")
            .attr("class", "kmPlots")
            .attr("d", lineFunc(lineData))
            .style("stroke", color)
            .style("stroke-width", "0.8px")
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
