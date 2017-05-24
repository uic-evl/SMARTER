"use strict"

var App = App || {};

let KaplanMeierPatientModel = function() {

    let self = {
        patients: {},
        selectedAttribute: null,
        patientGroups: {},
        kaplanMeierPatientGroups: {},
        maxOS: 0
    };

    /* initialize the patient list when first launching the application, and
       only be called once - when load the patient data */
    function initPatients(patients, attribute) {
        self.patients = patients;
        self.selectedAttribute = attribute;

        updateData();
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

        // reset
        self.patientGroups = {};
        self.kaplanMeierPatientGroups = {};
        self.maxOS = 0;

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
        // console.log(self.kaplanMeierPatientGroups);

        self.maxOS = Math.ceil(self.maxOS);
        console.log(self.maxOS);
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

        let sortedOSKeys = Object.keys(CensorsAtOS).sort((a, b) => parseFloat(a) - parseFloat(b));

        let probAtOS = []; // [{OS, prob, variance}, {OS, ...}, ...]
        let previousProb = 1;
        let sumForVar = 0;
        let pateintAtRisk = currentPatientGroup.length;

        for (let keyID in sortedOSKeys) {
            probAtOS[keyID] = {};

            probAtOS[keyID].OS = sortedOSKeys[keyID];

            // compute the number of patients died at the current OS
            let patientDied = CensorsAtOS[sortedOSKeys[keyID]].length;
            for (let i = 0; i < CensorsAtOS[sortedOSKeys[keyID]].length; i++) {
                patientDied -= CensorsAtOS[sortedOSKeys[keyID]][i];
            }

            // compute the maximum likelihood estimate using Kaplan-Meier estimator formula
            probAtOS[keyID].prob = previousProb * (pateintAtRisk - patientDied) / pateintAtRisk;
            // compute its variance using the Greenwood's formula
            sumForVar += patientDied / (pateintAtRisk * (pateintAtRisk - patientDied));
            probAtOS[keyID].var = probAtOS[keyID].prob * probAtOS[keyID].prob * sumForVar;

            // assign the prob and number of patients at risk at the current OS as the previous ones for next step
            previousProb = probAtOS[keyID].prob;
            pateintAtRisk -= CensorsAtOS[sortedOSKeys[keyID]].length;
        }

        if (sortedOSKeys.length > 0) {
          self.maxOS = Math.max(self.maxOS, +(sortedOSKeys[sortedOSKeys.length-1]));
        }

        // {current group: {OS: {prob, variance}, OS: {prob, variance} ...}}
        self.kaplanMeierPatientGroups[selectedAttributeValue] = probAtOS;
    }

    /* get the data for kaplan-meier plots */
    function getKaplanMeierPatients() {
        return self.kaplanMeierPatientGroups;
    }

    /* get the maximum value of OS */
    function getMaxOS() {
        return self.maxOS;
    }


    return {
        initPatients,
        updatePatients,
        updateSelectedAttribute,
        getKaplanMeierPatients,
        getMaxOS
    };
}
