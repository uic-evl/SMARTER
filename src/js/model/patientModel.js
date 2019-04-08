"use strict"

var App = App || {};

let PatientModel = function() {

    /* Private variables */
    let self = {
        patients: {},
        attributeDomains: {},
        axes: {}
    };

    /* load data from two csv files, returning a promise that resolves upon completion */
    function loadPatients() {
        // let survivalProbabilityFile = "data/SurvivalProbability.csv ";
        // let kaplanMeierFile = "data/correctKaplanMeier.csv";
        let newDataFile = "data/newdata.csv";

        // use promise to notify main when the data has been loaded
        return new Promise(function(resolve, reject) {
            // load data using d3 queue
            let dataLoadQueue = d3.queue();

            dataLoadQueue
                .defer(d3.csv, newDataFile)
                .await(loadAllFiles);

            // called after both files are loaded, and combines the data from two files
            function loadAllFiles(error,
                                  // probData,
                                  // kaplanMeierData,
                                  newData) {
                if (error) {
                    // reject on error in await callback
                    reject(error);
                }
                // console.log(newData);
                // console.log(newData[0]["Dummy ID"]);
                // convert array to object using IDs as the key
                _.forEach(newData, (d, i) => {
                    // if (d['Dummy ID'] === "2006") {
                    //     console.log("Dummy id 2006 ", d);
                    // }
                    self.patients[i] = d;
                    self.patients[i].AgeAtTx = +(d["Age at Diagnosis (Calculated)"]);
                    self.patients[i]["Probability of Survival"] = +(d["overall_survival_5yr_prob"]);
                    self.patients[i].ID = d["Dummy ID"];
                    self.patients[i].OS = +d["OS (Calculated)"];
                    self.patients[i].Censor = +d.Censor;

                });
                // calculatePatientAttributeDomains();

                // resolve within await callback after data finished processing
                resolve( /*self.patients*/ );
            }
        });

    }

    /* get the combined full patient list */
    function getPatients() {
        return self.patients;
    }

    /* get the total number of patients in the list */
    function getPatientNumber() {
        return Object.keys(self.patients).length;
    }

    /* get the patient Info by the ID */
    function getPatientByID(patientID) {
        return self.patients[patientID];
    }

    /* calculate the patient attribute domains including age and pbty */
    function calculatePatientAttributeDomains() {
        let patientObjArray = Object.values(self.patients);

        for (let attribute of App.patientKnnAttributes) {
            let attribute_valueArray = patientObjArray.map(function(o) {
                return o[attribute];
            });
            let uniqueVals = _.uniq(attribute_valueArray);
            self.attributeDomains[attribute] = uniqueVals.sort();
        }

        // self.attributeDomains["AgeAtTx"] = [25, 90];
        // self.attributeDomains["Probability of Survival"] = [0, 1];
    }

    /* get the patient attribute domains */
    function getPatientAttirbuteDomains() {
        return self.attributeDomains;
    }

    /* get the patient knn attribute domains */
    function getPatientKnnAttributeDomains() {
        let knnAttributeDomains = {};

        for (let attribute of App.patientKnnAttributes) {
            knnAttributeDomains[attribute] = self.axes[attribute].domain;
        }

        return knnAttributeDomains;
    }

    /* get a subset of the full patient list based on the filters applied where
       filters is an object with attribute-value pairs
        - e.g. {'Ethnicity': 'white', ... } */
    function filterPatients() {
        let filters = App.models.applicationState.getAttributeFilters();
        let filteredPatients = _.filter(self.patients, filters);

        return _.keyBy(filteredPatients, function(o) {
            return o.ID; // object
        });
    }

    /* calculate the knn to the selected patient based on (patientAttributes - excludedAttributes),
       return the knn info with full attributes */
    function calculateKNN( /*subjectID, excludedAttributes, k*/ ) {
        let otherPatients = [];

        let numberOfNeighbors = App.models.applicationState.getNumberOfNeighbors();
        let subjectID = App.models.applicationState.getSelectedPatientID();
        let patientAttributes = App.patientKnnAttributes;
        let knnExcludedAttributes = App.models.applicationState.getKnnExcludedAttributes();

        // get the actual patient attributes used for calculating knn
        let knnAttributes = _.difference(patientAttributes, knnExcludedAttributes);
        // console.log(knnAttributes);

        // calculate the similarity scores between the selected patient and the rest patients in the list
        for (let patientID of Object.keys(self.patients)) {
            if (patientID !== subjectID && patientID !== 'columns') {
                otherPatients[patientID] = {};
                otherPatients[patientID].id = patientID;
                otherPatients[patientID].score = similarityScore(patientID, subjectID, knnAttributes);
            }
        }

        let sortedPatients = _.reverse(_.sortBy(otherPatients, ['score']));

        // output the top k similar patients
        let topKpatients = [];
        for (let i = 1; i <= numberOfNeighbors; i++) {
            let neighbor = self.patients[sortedPatients[i].id];
            neighbor.score = sortedPatients[i].score;
            topKpatients.push(neighbor);
        }

        return topKpatients;
    }

    /* calculate the similarity between two patients based on the hamming distance
       over a subset of patientAttributes */
    function similarityScore(patientID, subjectID, knnAttributes) {
        let score = 0;
        let tieBreaker = -(Math.abs(self.patients[patientID].AgeAtTx - self.patients[subjectID].AgeAtTx)) / 150; // max age diff - 150

        score += tieBreaker;

        for (let attribute of knnAttributes) {
            // console.log(patientID, self.patients[patientID][axes[attribute].name] === self.patients[subjectID][axes[attribute].name]);
            if (self.patients[patientID][self.axes[attribute].name] === self.patients[subjectID][self.axes[attribute].name]) {
                score += 1;
            }
        }

        return score;
    }

    function setAxes(axes) {
        self.axes = axes;
    }


    /* Return the publicly accessible functions */
    return {
        loadPatients,
        getPatients,
        getPatientNumber,
        getPatientByID,
        getPatientAttirbuteDomains,
        getPatientKnnAttributeDomains,
        filterPatients,
        setAxes,
        getKnn: calculateKNN
    };
}
