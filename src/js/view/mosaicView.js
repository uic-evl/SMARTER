"use strict"

var App = App || {};

let MosaicView = function(targetID) {

    let self = {
        targetElement: null,
        targetSvg: null,
        tileColor: [],
        tileTip: null,
        filters: {},
        attributes: []
    };

    init();

    function init() {
        self.targetElement = d3.select(targetID);

        self.targetSvg = self.targetElement.append("svg")
            .attr("width", self.targetElement.node().clientWidth)
            .attr("height", self.targetElement.node().clientHeight)
            .attr("viewBox", "0 0 120 130")
            .attr("preserveAspectRatio", "xMidYMin");

        self.tileColor = ["#d18161", "#70a4c2", "#000000"];

        createTileTip();
    }

    function createTileTip() {
        self.tileTip = d3.tip()
            .attr("class", "d3-tip")
            .html(function(d) {
                return "Number of Patients: " + d.num + "<br>5 Year Survival Probability: " + d.probMean.toFixed(2);
            });
    }

    function updateAttributes(attrs) {
        self.attributes = attrs;

        // update();
    }

    /* update the view based on the current two attributes */
    function update(mosaicData) {
        console.log(mosaicData);
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
                let tileWidth = (100 - tilePadding * (attr0_length - 1)) * mosaicData[attr0Key].num / mosaicData.num;
                tileWidth = (tileWidth > 4) ? tileWidth : tileWidth * 4; // set min width for tiles
                // tileWidth = (tileWidth === 0) ? 4 : tileWidth;

                let preTileHeight = 0;

                for (let attr1Key of Object.keys(mosaicData[attr0Key]).sort()) {
                    if (attr1Key !== "num") {
                        // console.log(mosaicData[attr0Key][attr1Key].num);
                        let tileHeight = (100 - tilePadding * (attr1_length - 1)) * mosaicData[attr0Key][attr1Key].num / mosaicData[attr0Key].num;
                        tileHeight = (tileHeight > 1) ? tileHeight : tileHeight * 3; // set min height for tiles
                        tileHeight = (tileHeight === 0) ? 0.8 : tileHeight;

                        // draw tiles
                        self.targetSvg.append("rect")
                            .attr("class", "mosaicTile")
                            .datum(mosaicData[attr0Key][attr1Key])
                            .attr("x", 20 + preTileWidth)
                            .attr("y", 15 + preTileHeight)
                            .attr("width", tileWidth)
                            .attr("height", tileHeight)
                            .style("fill", function(d) {
                                if (d.probMean >= 0.5) {
                                    return self.tileColor[1];
                                } else if (d.probMean < 0.5 && d.probMean > 0) {
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

    /* click the tile to update the mosaic filters */
    function onClickFunction(attr0Val, attr1Val) {
        self.filters[self.attributes[0]] = attr0Val;
        self.filters[self.attributes[1]] = attr1Val;

        App.controllers.mosaicFilter.updateFilters(self.filters);
    }

    /* draw labels for tiles */
    function drawXLabels(text, xPos) {
        self.targetSvg.append("text")
            .attr("class", "mosaicTile")
            .attr("transform", "translate(" + xPos + ", 14) rotate(-22)")
            .style("font-size", 4.5)
            .text(text);
    }

    function drawYLabels(text, yPos) {
        self.targetSvg.append("text")
            .attr("class", "mosaicTile")
            .attr("transform", "translate(18, " + yPos + ")")
            .style("font-size", 5)
            .style("text-anchor", "end")
            .text(text);
    }


    return {
        update,
        updateAttributes
    };
}
