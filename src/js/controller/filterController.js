"use strict";

let FilterController = function() {
    let self = {
        filters: {}
    };

    /**
     * This is called by other controllers when the data filters are to be
     * updated to be newDataFilters
     */
    function updateDataFilters(newDataFilters) {
        // Only perform updates if the filters are different than the current
        if (!_.isEqual(newDataFilters, self.filters)) {
            self.filters = newDataFilters;

            updateModelsWithNewFilters(newDataFilters);

            updateControllersWithNewFilters(newDataFilters);

            updateViewsWithNewFilters(newDataFilters);
        }
    }

    /**
     * Updates applicationState to contain the new filter set
     */
    function updateModelsWithNewFilters(filters) {
        // set filters to be the selected items
        App.models.applicationState.setAttributeFilters(filters);

        // update the patients in the kaplan-meier model to recalculate the output
        let filteredPatients = App.models.patients.filterPatients();
        App.models.kaplanMeierPatient.updatePatients(filteredPatients);
    }

    /**
     * Updates the controllers to be accruate based on the new filters
     */
    function updateControllersWithNewFilters(filters) {
        // update patient selector with new subset of patients based on the filters
        App.controllers.patientSelector.updatePateintDropDown();

        // update explore patient form with new data filters
        App.controllers.exploreForm.updateDropdownsWithCurrentFilters();

        // disable the attributes based on new data filters
        App.controllers.attributeSelector.disableFilteredAttributes();
    }

    /**
     * Update the views based on the current filters
     */
    function updateViewsWithNewFilters(filters) {
        // get the filtered data and update the nomogram view
        let filteredPatients = App.models.patients.filterPatients();
        App.views.nomogram.updateFilterData(Object.values(filteredPatients));

        // get the updated kaplan-meier patients and update the view
        let maxOS = App.models.kaplanMeierPatient.getMaxOS();
        App.views.kaplanMeier.setMaxOS(maxOS);
        let updatedKaplanMeierData = App.models.kaplanMeierPatient.getKaplanMeierPatients();
        App.views.kaplanMeier.update(updatedKaplanMeierData);
    }

    return {
        updateDataFilters
    };
}
