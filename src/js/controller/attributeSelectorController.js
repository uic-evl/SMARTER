"use strict"

var App = App || {};

let AttributeSelectorController = function() {

    let self = {
        attributeDropDown: null,
        currentAttribute: null
    };

    /* display the attribute drop down list */
    function populateAttributeDropDown() {
        self.attributeDropDown
            .selectAll("option")
            .data(App.patientKnnAttributes)
            .enter()
            .append("option")
            .attr("value", (d) => d)
            .text((d) => d);
    }

    /* attach the event listener to the patient drop down list */
    function attachToSelect(element) {
        self.attributeDropDown = d3.select(element)
            .on("change", function(d) {
                let selectedAttribute = d3.select(this).node().value;
                self.currentAttribute = selectedAttribute;
                updateSelectedAttribute(selectedAttribute);
            });

        populateAttributeDropDown();
    }

    /* if the selected attribute exists in the attribute list, stays with it,
       if not, rest to the first attribute in the list */
    function updateAttributeDropDown() {
        let stateSelectedAttribute = App.models.applicationState.getSelectedAttribute();

        if (stateSelectedAttribute) {
            self.attributeDropDown.node().value = stateSelectedAttribute;
            if (self.currentAttribute !== stateSelectedAttribute) {
                self.currentAttribute = stateSelectedAttribute;
            }
        } else {
            self.attributeDropDown.node().selectedIndex = "0";
            self.currentAttribute = App.patientKnnAttributes[0];
        }

        updateSelectedAttribute(self.currentAttribute);
    }

    /* get the selected attribute and update views */
    function updateSelectedAttribute(selectedAttribute) {
        // update the application state
        App.models.applicationState.setSelectedAttribute(selectedAttribute);

        // update views
        App.views.nomogram.updateAttributeColor(selectedAttribute);
        App.views.kaplanMeier.updateAttributeColor(selectedAttribute);
    }

    /* disable the attributes that are currently applied in the application */
    function disableFilteredAttributes() {
        let filters = App.models.applicationState.getAttributeFilters();

        self.attributeDropDown
            .selectAll("option")
            .attr("disabled", (d) => filters[d]);

        // check if the selected attibute is disabled
        
    }


    /* return the pubilicly accessible functions */
    return {
        attachToSelect,
        updateAttributeDropDown,
        disableFilteredAttributes
    };
}
