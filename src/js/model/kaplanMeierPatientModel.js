"use strict"

var App = App || {};

let KaplanMeierPatientModel = function() {

    let self = {
        patients: {},
        selectedAttribute: null,
        patientGroups: {},
        kaplanMeierPatientGroups: {}
    };

    /* initialize the patient list when first launching the application, and
       only be called once - when load the patient data */
    function initPatients(patients) {
        self.patients = patients;
    }

    /* update the patient list when applying new filters */
    function updatePatients(patients) {
        self.patients = patients;

        updateData();
    }

    /* update the selected attribute */
    function updateSelectedAttribute(attribute) {
        self.selectedAttribute = attribute;

        updateData();
    }

    /* update the patient groups based on the current patients and current selected attribute */
    function updateData() {
        // get all the values of the selected attribute
        let attributeDomains = App.models.patients.getPatientKnnAttributeDomains();
        let groups = attributeDomains[self.selectedAttribute];

        // reset to empty
        self.patientGroups = {};
        self.kaplanMeierPatientGroups = {};

        for (let i = 0; i < groups.length; i++) {
            let filter = {};
            filter[self.selectedAttribute] = groups[i];

            // filter patients by values of the selected attribute
            let thisGroupPateint = _.filter(self.patients, filter);
            self.patientGroups[groups[i]] = _.sortBy(thisGroupPateint, ["OS"]);

            // calculate the data for kaplan-meier plots
            calculateKaplanMeierData(self.patientGroups[groups[i]], groups[i]);
        }
        // console.log(self.patientGroups);
        console.log(self.kaplanMeierPatientGroups);
    }

    /* calculate the data used for kaplan-meier plots */
    function calculateKaplanMeierData(currentPatientGroup, selectedAttributeValue) {
        let CensorsAtOS = {}; // {OS: [censor], OS: [censor, censor, censor], OS: [], ...}

        for (let patientInd in currentPatientGroup) {
            CensorsAtOS[currentPatientGroup[patientInd].OS] = [];
        }

        for (let patientInd in currentPatientGroup) {
            CensorsAtOS[currentPatientGroup[patientInd].OS].push(currentPatientGroup[patientInd].Censor);
        }
        // console.log(CensorsAtOS);

        let probAtOS = {}; // {OS: {prob, variance}, OS: ...}
        let previousProb = 1;
        let sumForVar = 0;
        let pateintAtRisk = currentPatientGroup.length;

        for (let keyOS in CensorsAtOS) {
            probAtOS[keyOS] = {};

            // compute the number of patients died at the current OS
            let patientDied = CensorsAtOS[keyOS].length;
            for (let i = 0; i < CensorsAtOS[keyOS].length; i++) {
                patientDied -= CensorsAtOS[keyOS][i];
            }

            // compute the maximum likelihood estimate using Kaplan-Meier estimator formula
            probAtOS[keyOS].prob = previousProb * (pateintAtRisk - patientDied) / pateintAtRisk;
            // compute its variance using the Greenwood's formula
            sumForVar += patientDied / (pateintAtRisk * (pateintAtRisk - patientDied));
            probAtOS[keyOS].var = probAtOS[keyOS].prob * probAtOS[keyOS].prob * sumForVar;

            // assign the prob and number of patients at risk at the current OS as the previous ones for next step
            previousProb = probAtOS[keyOS].prob;
            pateintAtRisk -= CensorsAtOS[keyOS].length;
        }

        // return {current group: {OS: {prob, variance}, OS: {prob, variance} ...}}
        self.kaplanMeierPatientGroups[selectedAttributeValue] = probAtOS;
    }

    /* get the data for kaplan-meier plots */
    function getKaplanMeierPatients() {
        return self.kaplanMeierPatientGroups;
    }


    return {
        initPatients,
        updatePatients,
        updateSelectedAttribute,
        getKaplanMeierPatients
    };
}
