"use strict"

var App = App || {};

let MosaicFilterController = function() {

    let self = {
        filters: {},
        nextTwoAttributes: []
    };

    function updateFilters(filters) {

        let nextTwoAttributes = _.slice(_.difference(App.mosaicAttributeOrder, Object.keys(filters)), 0, 2);
        console.log(Object.keys(filters));
        console.log(nextTwoAttributes);

        // get updated patients from the mosaicPatient model
        App.models.mosaicPatient.setAppliedFilters(filters);
        App.models.mosaicPatient.setNextTwoAttributes(nextTwoAttributes);
        let currentPatients = App.models.mosaicPatient.updatePatients();

        // update mosiac view

    }

    return {
        updateFilters
    };
}
