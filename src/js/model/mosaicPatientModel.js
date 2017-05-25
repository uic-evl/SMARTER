"use strict"

var App = App || {};

let MosaicPatientModel = function() {

    let self = {
        patients: {},
        filters: {}, // attributes that were already applied
        nextTwoAttributes: [] // attributes that will be applied
    };

    function setAppliedFilters(filters) {
        self.filters = filters;
    }

    function setNextTwoAttributes(attrs) {
        self.nextTwoAttributes = attrs;
    }

    /* update the patient list based on the attributes applied */
    function updatePatients() {
        let fullPatients = App.models.patients.getPatients();

    }


    return {
        setAppliedFilters,
        setNextTwoAttributes,
        updatePatients
    };
}
