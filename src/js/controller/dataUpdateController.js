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
        }

        // update controllers
        App.controllers.patientSelector.updatePateintDropDown();

        // update views
        // App.views.nomogram.createView(/*Object.values(updatedData)*/);
        App.views.nomogram.updateFilterData(Object.values(updatedData));
        // App.views.nomogram.updateView();

        // assign the new values to the priviate variables
        self.data = updatedData;
        self.dataSize = updatedNumberOfPatients;
        self.attributeDomains = updatedAttributeDomains;
    }

    return {
        updateApplication
    };
}
