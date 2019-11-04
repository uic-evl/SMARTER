"use strict"

var App = App || {};

let MosaicView = function(targetID) {

    let self = {
        targetElement: null,
        targetSvg: null,
        menuBarElement: null,
        tileColor: [],
        tileTip: null,
        filters: {},
        attributes: [],
        threshold: 0.5
    };

    init();

    function init() {
        self.targetElement = d3.select(targetID);

        self.targetSvg = self.targetElement.append("svg")
            .attr("width", self.targetElement.node().clientWidth)
            .attr("height", self.targetElement.node().clientHeight)
            .attr("viewBox", "0 0 150 130")
            .attr("preserveAspectRatio", "xMidYMin");

        self.menuBarElement = d3.select(targetID + "Header");

        self.tileColor = ["#d18161", "#70a4c2", "#000000"];

        createTileTip();

        menuBar();
        probThresholdBar();
    }

    function createTileTip() {
        self.tileTip = d3.tip()
            .attr("class", "d3-tip")
            .html(function(d) {
                return "Number of Patients: " + d.num + "<br>5 Year Survival Probability: " + d.probMean.toFixed(2);
            });
    }

    /* slider for changing the probability threshold */
    function probThresholdBar() {
        let xScale = d3.scaleLinear()
            .domain([0, 1])
            .range([22, 147]);

        let drag = d3.drag()
            .on("drag", function() {
                let newX = parseFloat(d3.select(this).attr("cx")) + d3.event.dx;
                newX = (newX > 147) ? 147 : newX;
                newX = (newX < 22) ? 22 : newX;
                d3.select(this).attr("cx", newX);
                updateThreshold(newX);
            });

        self.targetSvg.append("rect")
            .attr("class", "thresholdBar")
            .attr("x", 22)
            .attr("y", 116)
            .attr("width", 125)
            .attr("height", 4)
            .style("fill", "lightgray");

        self.targetSvg.append("circle")
            .attr("cx", xScale(self.threshold))
            .attr("cy", 118)
            .attr("r", 3.5)
            .style("fill", "darkgray")
            .call(drag);

        self.targetSvg.append("text")
            .attr("x", 18)
            .attr("y", 120)
            .style("font-size", "5px")
            .style("text-anchor", "end")
            .text("5 Year Survival: ");

        self.targetSvg.append("text")
            .attr("id", "thresholdText")
            .attr("x", 151)
            .attr("y", 120)
            .style("font-size", "5px")
            .style("text-anchor", "start")
            .text(self.threshold);
    }

    /* update the probability threshold */
    function updateThreshold(xPos) {
        self.threshold = ((xPos - 22) / 125).toFixed(2);
        // console.log(self.threshold);
        d3.select("#thresholdText").text(self.threshold);
        updateColor();
    }

    /* update the two attributes on x/y-axis */
    function updateAttributes(attrs) {
        self.attributes = attrs;

        // update();
    }

    /* update the mosaic tile color based on the threshold */
    function updateColor() {
        d3.selectAll(".mosaicTile")
            .style("fill", function(d) {
                if (d != undefined) {
                    if (d.probMean >= self.threshold) {
                        return self.tileColor[1];
                    } else if (d.probMean < self.threshold && d.probMean > 0) {
                        return self.tileColor[0];
                    } else {
                        return self.tileColor[2];
                    }
                }
            });
    }

    /* update the view based on the current two attributes */
    function update(mosaicData) {
        // console.log(mosaicData);
        d3.selectAll(".mosaicTile").remove();

        self.targetSvg.call(self.tileTip);

        let attr0_length = Object.keys(mosaicData).length - 1;
        let attr1_length;

        for (let attrKey in mosaicData) {
            attr1_length = Object.keys(mosaicData[attrKey]).length;
            break;
        }
        attr1_length -= 1;

        let tilePadding = 4;

        let preTileWidth = 0;

        for (let attr0Key of Object.keys(mosaicData).sort()) {
            if (attr0Key !== "num") {
                // console.log(mosaicData[attr0Key]);
                let tileWidth = (130 - tilePadding * (attr0_length - 1)) * mosaicData[attr0Key].num / mosaicData.num;
                tileWidth = (tileWidth > 4) ? tileWidth : tileWidth * 4; // set min width for tiles
                // tileWidth = (tileWidth === 0) ? 4 : tileWidth;

                let preTileHeight = 0;

                if (tileWidth !== 0) {
                    for (let attr1Key of Object.keys(mosaicData[attr0Key]).sort()) {
                        if (attr1Key !== "num") {
                            // console.log(mosaicData[attr0Key][attr1Key].num);
                            let tileHeight = (90 - tilePadding * (attr1_length - 1)) * mosaicData[attr0Key][attr1Key].num / mosaicData[attr0Key].num;
                            tileHeight = (tileHeight > 1) ? tileHeight : tileHeight * 3; // set min height for tiles
                            tileHeight = (tileHeight === 0) ? 0.8 : tileHeight;

                            // draw tiles
                            self.targetSvg.append("rect")
                                .attr("class", "mosaicTile")
                                .datum(function() {
                                    let dataToBind = mosaicData[attr0Key][attr1Key]

                                    if (dataToBind == undefined) {
                                        console.log(attr0Key, attr1Key);
                                    }

                                    return dataToBind;
                                })
                                .attr("x", 20 + preTileWidth)
                                .attr("y", 15 + preTileHeight)
                                .attr("width", tileWidth)
                                .attr("height", tileHeight)
                                .style("fill", function(d) {
                                    if (d.probMean >= self.threshold) {
                                        return self.tileColor[1];
                                    } else if (d.probMean < self.threshold && d.probMean > 0) {
                                        return self.tileColor[0];
                                    } else {
                                        return self.tileColor[2];
                                    }
                                })
                                .style("opacity", 0.75)
                                .on("click", function() {
                                    onClickFunction(attr0Key, attr1Key);
                                })
                                .on("mouseover", self.tileTip.show)
                                .on("mouseout", self.tileTip.hide);

                            if (preTileWidth === 0) { // only draw y labels once
                                drawYLabels(attr1Key, 16 + preTileHeight + tileHeight / 2);
                            }

                            preTileHeight += tileHeight + tilePadding;
                        }
                    }

                    if (tileWidth > 0) {
                        drawXLabels(attr0Key, 20 + preTileWidth + tileWidth / 2);
                    }

                    preTileWidth += tileWidth + tilePadding;
                }
            }
        }

    }

    /* click the tile to update the mosaic filters */
    function onClickFunction(attr0Val, attr1Val) {
        self.filters[self.attributes[0]] = attr0Val;
        self.filters[self.attributes[1]] = attr1Val;

        App.controllers.mosaicFilter.updateFilters(self.filters);

        updateMenuBar([attr0Val, attr1Val]);
    }

    /* create the menu bar for resting the filters */
    function menuBar() {
        self.menuBarElement.append("h6")
            .attr("class", "menuBar")
            .text("Showing: Total Data ")
            .on("click", function() {
                // remove the options for filtering
                for (let i = 1; i <= Object.keys(self.filters).length / 2; i++) {
                    d3.select("#menuBar" + i).remove();
                }
                // reset to the state where no filter applied
                self.filters = {};
                App.controllers.mosaicFilter.updateFilters(self.filters);
            });
    }

    /* update the menu bar based on the filters applied currently */
    function updateMenuBar(attrVals) {
        let filtersLength = Object.keys(self.filters).length / 2;

        self.menuBarElement.append("h6")
            .attr("class", "menuBar")
            .attr("id", "menuBar" + filtersLength)
            .text(attrVals[0] + ", " + attrVals[1])
            .on("click", function() {
                // remove the options for filtering
                for (let i = filtersLength + 1; i <= Object.keys(self.filters).length / 2; i++) {
                    d3.select("#menuBar" + i).remove();
                }

                // get the attributes based on the values
                let key0 = _.findKey(self.filters, _.partial(_.isEqual, attrVals[0]));
                let key1 = _.findKey(self.filters, _.partial(_.isEqual, attrVals[1]));

                let key0Ind = App.mosaicAttributeOrder.indexOf(key0);
                let key1Ind = App.mosaicAttributeOrder.indexOf(key1);

                // remove the attributes after attrVals
                let newFilters = {};
                for (let i = 0; i <= key1Ind; i++) {
                    newFilters[App.mosaicAttributeOrder[i]] = self.filters[App.mosaicAttributeOrder[i]];
                }

                App.controllers.mosaicFilter.updateFilters(newFilters);

                self.filters = newFilters;
            });
    }

    /* draw labels for tiles */
    function drawXLabels(text, xPos) {
        self.targetSvg.append("text")
            .attr("class", "mosaicTile")
            .attr("transform", "translate(" + xPos + ", 14) rotate(-20)")
            .style("font-size", "5px")
            .text(text);
    }

    function drawYLabels(text, yPos) {
        self.targetSvg.append("text")
            .attr("class", "mosaicTile")
            .attr("transform", "translate(18, " + yPos + ")")
            .style("font-size", "5px")
            .style("text-anchor", "end")
            .text(text);
    }


    return {
        update,
        updateAttributes
    };
}
