"use strict"

var App = App || {};

let MosaicPatientModel = function() {

    let self = {
        patients: {},
        patientGroupInfo: {},
        filters: {}, // filters that were already applied
        nextTwoAttributes: [] // attributes that will be applied
    };

    init();

    /* initialize the patient list */
    function init() {
        self.patients = App.models.patients.getPatients();
    }

    function updateAppliedFilters(filters) {
        self.filters = filters;

        updatePatients();
    }

    function updateNextTwoAttributes(attrs) {
        self.nextTwoAttributes = attrs;

        groupPatients();
    }

    /* update the patient list based on the filters applied */
    function updatePatients() {
        let fullPatients = App.models.patients.getPatients();

        self.patients = _.filter(fullPatients, self.filters);
    }

    /* group the patients based on the next two attributes */
    function groupPatients() {
        self.patientGroupInfo = {};

        let attributeDomains = App.models.patients.getPatientKnnAttributeDomains();
        console.log(attributeDomains);
        console.log(self.nextTwoAttributes);
        let attr0_length = attributeDomains[self.nextTwoAttributes[0]].length;
        let attr1_length = attributeDomains[self.nextTwoAttributes[1]].length;

        // patientGroupInfo is an object that uses the attribute value as the key and number of patients (prob mean) as the value
        for (let i = 0; i < attr0_length; i++) {
            self.patientGroupInfo[attributeDomains[self.nextTwoAttributes[0]][i]] = {};
            let patientNumOnAttr0 = 0;

            for (let j = 0; j < attr1_length; j++) {
                self.patientGroupInfo[attributeDomains[self.nextTwoAttributes[0]][i]][attributeDomains[self.nextTwoAttributes[1]][j]] = {};

                // get the patients in the current group
                let filter = {};
                filter[self.nextTwoAttributes[0]] = attributeDomains[self.nextTwoAttributes[0]][i];
                filter[self.nextTwoAttributes[1]] = attributeDomains[self.nextTwoAttributes[1]][j];
                let patients = _.filter(self.patients, filter);

                // get the number of patients in the current group
                self.patientGroupInfo[attributeDomains[self.nextTwoAttributes[0]][i]][attributeDomains[self.nextTwoAttributes[1]][j]].num = patients.length;

                // calculate the mean of probabilities of the current group of patients
                let probSum = 0;
                for (let patientInd in patients) {
                    probSum += patients[patientInd]["Probability of Survival"];
                }
                self.patientGroupInfo[attributeDomains[self.nextTwoAttributes[0]][i]][attributeDomains[self.nextTwoAttributes[1]][j]].probMean = probSum / patients.length;

                patientNumOnAttr0 += patients.length;
            }
            self.patientGroupInfo[attributeDomains[self.nextTwoAttributes[0]][i]].num = patientNumOnAttr0;
        }

        self.patientGroupInfo.num = self.patients.length;

        // console.log(self.patientGroupInfo);
    }

    function getPatients() {
        return self.patients;
    }

    function getPatientGroupInfo() {
        return self.patientGroupInfo;
    }


    return {
        updateAppliedFilters,
        updateNextTwoAttributes,
        // getPatients,
        getPatientGroupInfo
    };
}
