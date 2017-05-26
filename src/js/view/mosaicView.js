"use strict"

var App = App || {};

let MosaicView = function(targetID) {

    let self = {
        targetElement: null,
        targetSvg: null,
        tileColor: []
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
    }

    /* update the view based on the current two attributes */
    function update(mosaicData) {
        console.log(mosaicData);
        d3.selectAll(".mosaicTile").remove();

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

                let preTileHeight = 0;

                for (let attr1Key of Object.keys(mosaicData[attr0Key]).sort()) {
                    if (attr1Key !== "num") {
                        // console.log(mosaicData[attr0Key][attr1Key].num);
                        let tileHeight = (100 - tilePadding * (attr1_length - 1)) * mosaicData[attr0Key][attr1Key].num / mosaicData[attr0Key].num;
                        tileHeight = (tileHeight > 4) ? tileHeight : tileHeight * 4; // set min height for tiles
                        tileHeight = (tileHeight === 0) ? 0.8 : tileHeight;

                        let probMean = mosaicData[attr0Key][attr1Key].probMean;

                        // draw tiles
                        self.targetSvg.append("rect")
                            .attr("class", "mosaicTile")
                            .attr("x", 20 + preTileWidth)
                            .attr("y", 15 + preTileHeight)
                            .attr("width", tileWidth)
                            .attr("height", tileHeight)
                            .style("fill", function() {
                                if (probMean >= 0.5) {
                                    return self.tileColor[1];
                                } else if (probMean < 0.5 && probMean > 0) {
                                    return self.tileColor[0];
                                } else {
                                    return self.tileColor[2];
                                }
                            })
                            .style("opacity", 0.75);

                        if (preTileWidth===0) {  // only draw y labels once
                            drawYLabels(attr1Key, 16 + preTileHeight + tileHeight / 2);
                        }

                        preTileHeight += tileHeight + tilePadding;
                    }
                }

                drawXLabels(attr0Key, 20 + preTileWidth + tileWidth / 2);

                preTileWidth += tileWidth + tilePadding;
            }
        }

    }

    /* draw labels for tiles */
    function drawXLabels(text, xPos) {
        self.targetSvg.append("text")
            .attr("class", "mosaicTile")
            .attr("transform", "translate(" + xPos + ", 14) rotate(-23)")
            .style("font-size", 4)
            .text(text);
    }

    function drawYLabels(text, yPos) {
        self.targetSvg.append("text")
            .attr("class", "mosaicTile")
            .attr("transform", "translate(18, " + yPos + ")")
            .style("font-size", 4)
            .style("text-anchor", "end")
            .text(text);
    }


    return {
        update
    };
}
