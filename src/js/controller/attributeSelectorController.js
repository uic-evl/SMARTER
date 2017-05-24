"use strict"

var App = App || {};

let AttributeSelectorController = function() {

    let self = {
        attributeDropDown: null,
        currentAttribute: App.patientKnnAttributes[0]
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

        // update the kaplan-meier patient model to recalculate the output
        App.models.kaplanMeierPatient.updateSelectedAttribute(selectedAttribute);

        // update views
        App.views.nomogram.updateAttributeColor(selectedAttribute);

        // get the updated kaplan-meier patients
        let maxOS = App.models.kaplanMeierPatient.getMaxOS();
        App.views.kaplanMeier.setMaxOS(maxOS);
        let updatedKaplanMeierData = App.models.kaplanMeierPatient.getKaplanMeierPatients();      
        App.views.kaplanMeier.update(updatedKaplanMeierData);
    }

    /* disable the attributes that are currently applied in the application */
    function disableFilteredAttributes() {
        let filters = App.models.applicationState.getAttributeFilters();

        self.attributeDropDown
            .selectAll("option")
            .attr("disabled", (d) => filters[d]);

        // check if the selected attibute is disabled
        let attributeIntersection = _.indexOf(Object.keys(filters), self.currentAttribute);

        // if it is, then find the first enabled attribute and set it to the new current attribute
        if (attributeIntersection != -1) {

            let attributeEnabled = _.difference(App.patientKnnAttributes, Object.keys(filters));

            // get the first enable attribute
            self.currentAttribute = attributeEnabled[0];
            self.attributeDropDown.node().value = self.currentAttribute;
            updateSelectedAttribute(self.currentAttribute);
        }
    }


    /* return the pubilicly accessible functions */
    return {
        attachToSelect,
        updateAttributeDropDown,
        disableFilteredAttributes
    };
}
