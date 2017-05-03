"use strict"

var App = App || {};

let AttributeSelectorController = function() {

    let self = {
        attributeDropDown: null
    };

    /* display the attribute drop down list */
    function populateAttributeDropDown() {
        self.attributeDropDown
            .selectAll("option")
            .data(App.patientKnnAttributes)
            .enter()
            .append("option")
            .text((d) => d);
    }

    /* attach the event listener to the patient drop down list */
    function attachToSelect(element) {
        self.attributeDropDown = d3.select(element)
            .on("change", function(d) {
                let selectedAttribute = d3.select(this).node().value;
                updateSelectedAttribute(selectedAttribute);
            });

        populateAttributeDropDown();

        // initial state
        updateSelectedAttribute(App.patientKnnAttributes[0]);
    }

    /* get the selected attribute and update views */
    function updateSelectedAttribute(selectedAttribute) {
        App.views.nomogram.updateAttributeColor(selectedAttribute);
        App.views.kaplanMeier.updateAttributeColor(selectedAttribute);
    }

    function disableFilteredAttributes() {
      let filters = App.models.applicationState.getAttributeFilters();

      self.attributeDropDown
      .selectAll("option")
        .attr("disabled", (d) => filters[d]);
    }


    /* return the pubilicly accessible functions */
    return {
        attachToSelect,
        disableFilteredAttributes
    };
}
