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
    }

    /**
     * Updates the controllers to be accruate based on the new filters
     */
    function updateControllersWithNewFilters(filters) {
        // update patient selector with new subset of patients based on the filters
        App.controllers.patientSelector.updatePateintDropDown();

        // update explore patient form with new data filters
        App.controllers.exploreForm.updateDropdownsWithCurrentFilters();
    }

    /**
     * Update the views based on the current filters
     */
    function updateViewsWithNewFilters(filters) {
        // get the filtered data
        let filteredPatients = App.models.patients.filterPatients();
        console.log(filteredPatients);
        // update views with filtered data
        App.views.nomogram.updateFilterData(Object.values(filteredPatients));
    }

    return {
        updateDataFilters
    };
}
