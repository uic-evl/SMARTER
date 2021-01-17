"use strict"

var App = App || {};

let DataUpdateController = function() {

    /* priviate variables */
    let self = {
        data: {},
        dataSize: null,
        attributeDomains: {}
    };

    function getData() {
        return App.models.patients.getPatients();
    }

    function getDataSize() {
        return App.models.patients.getPatientNumber();
    }

    function getAttirbuteDomains() {
        return App.models.patients.getPatientAttirbuteDomains();
    }

    function getKnnAttirbuteDomains() {
        return App.models.patients.getPatientKnnAttributeDomains();
    }

    function updateApplication() {
        // get data
        let updatedData = getData();
        let updatedNumberOfPatients = getDataSize();
        let updatedAttributeDomains = getAttirbuteDomains();
        let updatedKnnAttributeDomains = getKnnAttirbuteDomains();

        if (!_.isEqual(self.attributeDomains, updatedAttributeDomains)) {
            // update views with new domains
            App.views.kiviatDiagram.updateAttributeDomains(updatedKnnAttributeDomains);
            App.views.nomogram.updateAttributeDomains(updatedAttributeDomains);

            // update controllers with new domains
            App.controllers.exploreForm.updateDropdownsWithNewDomains(updatedKnnAttributeDomains);
            App.controllers.addPatientForm.updateDropdownsWithNewDomains(updatedKnnAttributeDomains);
            App.controllers.nomogramAxis.updateAxesWithNewDomains(updatedAttributeDomains);
        }

        // initialize the kaplan-meier model
        // console.log(App.patientKnnAttributes[0])
        // console.log(App.mosaicAttributeOrder[0])
        App.models.kaplanMeierPatient.initPatients(updatedData, App.patientKnnAttributes[0]);

        // update controllers
        App.controllers.patientSelector.updatePateintDropDown();
        // App.controllers.mosaicFilter.updateFilters({});
        App.controllers.nomogramAxis.axisHeightSlider();

        // update views
        App.views.nomogram.updateFilterData(Object.values(updatedData));

        // update attribute selector controller to update the nomogram view and kaplan-meier view
        // App.controllers.attributeSelector.updateAttributeDropDown();
        App.controllers.attributeSelectorUpdated.updateAttributeDropDown();

        // assign the new values to the priviate variables
        self.data = updatedData;
        self.dataSize = updatedNumberOfPatients;
        self.attributeDomains = updatedAttributeDomains;
    }

    function updateApplicationFromState(state) {
        App.controllers.patientSelector.updatePateintDropDown();
        App.controllers.attributeSelector.updateAttributeDropDown();
        App.controllers.filters.updateDataFilters(state.attributeFilters);
        App.controllers.knnAttrSelector.updateSelectedCheckboxes();
    }

    return {
        updateApplication,
        updateApplicationFromState
    };
}
