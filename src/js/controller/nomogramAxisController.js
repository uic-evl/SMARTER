"use strict";

let NomogramAxisController = function(listID) {
    let self = {
        list: null,
        selector: null,
        toggleButtons: null,

        checkboxStates: {},
        editMode: "range",
        selectedAxis: null,

        sliderSvg: null,
        sliderBrush: null,
        brushFunc: null,

        attributeRange: {},
        rangeScale: null,

        attributeDomainDefault: {},
        attributeDomain: {},
        domainScale: {},
        axes: {},

        // axis: {
        //     "domain": {},
        //     "range": {}
        // },

        resetElement: null
    };

    init();

    function init() {
        let attributes = App.nomogramAttributes;
        self.axes = App.models.axesModel.getAxesData();

        for (let attribute of attributes) {
            self.checkboxStates[attribute] = true;
        }

        self.resetElement = d3.select("#nomogramResetButton");
        self.resetElement.on("click", resetAxes);
    }

    function attachToList(listID) {
        let attributes = App.nomogramAttributes;

        self.list = d3.select(listID);

        self.list.selectAll(".checkbox-li")
            .data(attributes)
            .enter().append("li")
            .attr("class", "checkbox-li")
            .each(function(d, i) {
                let div = d3.select(this).append("div").attr("class", "checkbox");

                div.append("input")
                    .attr("class", "separated-checkbox")
                    .attr("checked", true)
                    .attr("type", "checkbox")
                    .attr("value", d)
                    .attr("id", "nomoVisCheck" + d)
                    .on("click", checkboxOnChange);

                div.append("label")
                    .attr("for", "nomoVisCheck" + d)
                    .on("click", function() {
                        d3.event.stopPropagation(); // prevent menu close on label click
                    })
                    .text(d);
            });
    }

    function attachToSelect(selectID) {
        // include age and surv prob axes
        let attributes = Object.keys(self.axes);

        self.select = d3.select(selectID)
            .on("change", selectorOnChange);

        self.select.selectAll("option")
            .data(attributes)
            .enter().append("option")
            .attr("value", d => d)
            .text(d => d);

        this.selectedAxis = self.select.node().value;

        self.selectedAxis = this.selectedAxis;
    }

    function attachToDomainRangeToggle(elements) {
        self.toggleButtons =
            d3.selectAll(elements)
                .on("click", toggleButtonOnClick);

    }


    function checkboxOnChange() {
        let checkbox = d3.select(this).node();

        self.checkboxStates[checkbox.value] = checkbox.checked;

        updateNomogramAxisVisibility();
    }

    function selectorOnChange() {
        self.selectedAxis = d3.select(this).node().value;
        // console.log(self.selectedAxis);
        // disable the domain button when the non-age or non-prob axis is selected
        // console.log(self.toggleButtons);
        if (self.selectedAxis !== "AgeAtTx" && self.selectedAxis !== "Predictive Probability") {
            self.toggleButtons
                .attr("disabled", true);

        } else {
            self.toggleButtons
                .attr("disabled", null);
        }

        updateBrush();
    }

    function toggleButtonOnClick() {
        self.editMode = d3.select(this).attr("value");

        self.toggleButtons
            .classed("active", function() {
                return d3.select(this).attr("value") === self.editMode;
            });

        // disable the axis selection in the domain mode
        // console.log(Object.keys(self.axes))
        if (self.editMode === "domain") {
            self.select.selectAll("option")
                .attr("disabled", function(d){
                    console.log(d)
                    let keys = Object.keys(self.axes)
                    for(let key of keys){
                        if(d !== "AgeAtTx" && d !== "Predictive Probability"){
                            return true
                        }else{
                            return null
                        }
                    }
                });
        } else if (self.editMode === "range") {
            self.select.selectAll("option")
                .attr("disabled", null);
        }

        updateBrush();
    }

    function updateNomogramAxisVisibility() {
        // console.log(self.checkboxStates)
        App.views.nomogram.updateAxisVisibility(self.checkboxStates);
    }


    function updateAxesWithNewDomains(newDomains) {
        self.attributeDomain = Object.assign({}, newDomains);
        self.attributeDomainDefault = Object.assign({}, newDomains);
    }


    function axisHeightSlider() {
        let sliderElement = d3.select("#axisHeightSlider");
        let sliderWidth = sliderElement.node().clientWidth;
        let sliderHeight = sliderElement.node().clientHeight;
        //make sure the slider does not get 0px height and width
        if(sliderHeight == 0){
            sliderHeight = 150;
        }
        if(sliderWidth == 0){
            sliderWidth = 15;
        }

        self.sliderSvg = sliderElement.append("svg")
            .attr("width", sliderWidth)
            .attr("height", sliderHeight)
        // .style("background-color", "lightblue");

        // console.log(sliderWidth)
        // console.log(sliderHeight)
        let sliderBar = self.sliderSvg.append("rect")
            .attr("x", sliderWidth / 2.5)
            .attr("y", 0)
            .attr("width", sliderWidth / 6)
            .attr("height", sliderHeight)
            .style("fill", "#cccccc")
            .style("stroke", "none");

        self.brushFunc = d3.brushY()
            .extent([
                [0, 3],
                [sliderWidth, sliderHeight - 3]
            ])
            .on("end", brushended);

        self.sliderBrush = self.sliderSvg.append("g")
            .attr("class", "brush")
            .call(self.brushFunc);

        // console.log(self.sliderBrush)

        // get the attribute range on each axis
        _.forEach(self.axes, function(value, key) {
            self.attributeRange[key] = value["rangeShrink"];
        });

        _.forEach(self.axes, function(value, key){
            self.attributeDomain[key] = value["domain"]
        })


        // set the range scale for all axes
        self.rangeScale = d3.scaleLinear()
            .domain([0, 1])
            .range([sliderHeight - 3, 3]);

        // // set the domain scale for age and prob-surv axis
        self.domainScale["AgeAtTx"] = d3.scaleLinear()
            .domain(self.attributeDomain["AgeAtTx"])
            .range([3, sliderHeight - 3]);

        self.domainScale["Predictive Probability"] = d3.scaleLinear()
            .domain(self.attributeDomain["Predictive Probability"])
            .range([sliderHeight - 3, 3]);

        updateBrush();
    }

    function updateBrush() {
        // console.log(self.axes)
        // console.log(self.selectedAxis)
        // console.log(self.attributeRange)
        // console.log(self.rangeScale)
        if (self.editMode === "range") {
            let range = self.attributeRange[self.selectedAxis];
            self.sliderBrush
                .call(self.brushFunc.move, [
                    self.rangeScale(d3.max(range)), self.rangeScale(d3.min(range))
                ]);
        } else if (self.editMode === "domain") {
            // console.log(self.attributeDomain)
            if(self.attributeDomain[self.selectedAxis] != undefined){
                let domainScaleExtent = d3.extent(self.attributeDomain[self.selectedAxis], d => self.domainScale[self.selectedAxis](d));
                self.sliderBrush
                    .call(self.brushFunc.move, domainScaleExtent);

            }
        }
    }

    function brushended() {
        if (!d3.event.sourceEvent) return;

        // singel click outside of the brush on the slider
        if (!d3.event.selection) {
            // reset to initial state
            if (self.editMode === "range") {
                self.attributeRange[self.selectedAxis] = self.axes[self.selectedAxis]["rangeShrink"];

                updateBrush();
            } else if (self.editMode === "domain") {
                self.attributeDomain[self.selectedAxis] = self.attributeDomainDefault[self.selectedAxis];

                updateBrush();
            }
            return;
        }

        if (self.editMode === "range") {
            // update the axis range
            self.attributeRange[self.selectedAxis] = d3.event.selection.map(self.rangeScale.invert);
            if (self.selectedAxis === "Predictive Probability" || self.selectedAxis === "AgeAtTx") {
                self.attributeRange[self.selectedAxis] = self.attributeRange[self.selectedAxis].reverse();
            }

            // update the nomogram
            App.views.nomogram.updateAxesRange(self.attributeRange);
        } else if (self.editMode === "domain") {
            // update the axis domain
            self.attributeDomain[self.selectedAxis] = d3.event.selection.map(self.domainScale[self.selectedAxis].invert);
            if (self.selectedAxis === "Predictive Probability" || self.selectedAxis === "AgeAtTx") {
              self.attributeDomain[self.selectedAxis] = self.attributeDomain[self.selectedAxis].reverse();
            }

            // update the nomogram
            App.views.nomogram.updateAxesDomain(self.attributeDomain);
        }

    }

    /* reset the axes settings to default */
    function resetAxes() {
        console.log("reset");
        // reset the axis domain and range
        const axes = App.models.axesModel.getAxesData();

        _.forEach(axes, function(value, key) {
            self.attributeRange[key] = value["rangeShrink"];
        });

        _.forEach(axes, function(value, key) {
            self.attributeDomain[key] = value["domain"];
        });

        // update brush
        updateBrush();

        // update the nomogram view
        App.views.nomogram.updateAxesRange(self.attributeRange);
        App.views.nomogram.updateAxesDomain(self.attributeDomain);
    }


    return {
        attachToList,
        attachToSelect,
        attachToDomainRangeToggle,
        axisHeightSlider,
        updateAxesWithNewDomains
    };
};
