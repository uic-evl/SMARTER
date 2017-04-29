"use strict"

var App = App || {};

let ApplicationStateModel = function() {

    /* Private variables */
    let self = {
        numberOfNeighbors: 5, // 5 as default
        selectedPatientID: 0, // 0 as defualt
        patientKnnAttributes: [],
        knnExcludedAttributes: [], // empty as default
        attributeFilters: {} // empty as default
    };

    // eight attributes for calculating knn and also eight axes in the kiviat diagram
    self.patientKnnAttributes = ["Gender", "Ethnicity", "Tcategory", "Site", "Nodal_Disease", "ecog", "Chemotherapy", "Local_Therapy"];

    function setNumberOfNeighbors(number) {
        self.numberOfNeighbors = numbers;
    }

    function getNumberOfNeighbors() {
        return self.numberOfNeighbors;
    }

    function setSelectedPatientID(subjectID) {
        self.selectedPatientID = subjectID;
    }

    function getSelectedPatientID() {
        return self.selectedPatientID;
    }

    function setPatientKnnAttributes(attributes) {
        self.patientKnnAttributes = attributes;
    }

    function getPatientKnnAttributes() {
        return self.patientKnnAttributes;
    }

    function setKnnExcludedAttributes(attributes) {
        self.knnExcludedAttributes = attributes;
    }

    function getKnnExcludedAttributes() {
        return self.knnExcludedAttributes;
    }

    function setAttributeFilters(filters) {
        self.attributeFilters = filters;
    }

    function getAttributeFilters() {
        return self.attributeFilters;
    }

    /* Return the publicly accessible functions */
    return {
        setNumberOfNeighbors,
        getNumberOfNeighbors,
        setSelectedPatientID,
        getSelectedPatientID,
        setPatientKnnAttributes,
        getPatientKnnAttributes,
        setKnnExcludedAttributes,
        getKnnExcludedAttributes,
        setAttributeFilters,
        getAttributeFilters
    };
}
