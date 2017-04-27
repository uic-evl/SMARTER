"use strict"

var App = App || {};

let ApplicationStateModel = function() {

    /* Private variables */
    let self = {
        numberOfNeighbors: 5,
        selectedPatientID: 0, // 0 as defualt
        knnExcludedAttributes: [] // empty as default
    };

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

    function setKnnExcludedAttributes(attributes) {
        self.knnExcludedAttributes = attributes;
    }

    function getKnnExcludedAttributes() {
        return self.knnExcludedAttributes;
    }


    /* Return the publicly accessible functions */
    return {
        setNumberOfNeighbors,
        getNumberOfNeighbors,
        setSelectedPatientID,
        getSelectedPatientID,
        setKnnExcludedAttributes,
        getKnnExcludedAttributes
    };
}
