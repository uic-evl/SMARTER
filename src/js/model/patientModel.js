"use strict"

var App = App || {};

let PatientModel = function() {

    /* Private variables */
    let self = {
        patients: {},
        patientAttributes: []
    };

    // eight attributes for calculating knn and also eight axes in the kiviat diagram
    self.patientAttributes = ["Gender", "Ethnicity", "Tcategory", "Site", "Nodal_Disease", "ecog", "Chemotherapy", "Local_Therapy"];

    /* load data from two csv files, returning a promise that resolves upon completion */
    function loadPatients() {
        let survivalProbabilityFile = "data/SurvivalProbability.csv ";
        let kaplanMeierFile = "data/correctKaplanMeier.csv";

        // use promise to notify main when the data has been loaded
        return new Promise(function(resolve, reject) {
            // load data using d3 queue
            let dataLoadQueue = d3.queue();

            dataLoadQueue
                .defer(d3.csv, survivalProbabilityFile)
                .defer(d3.csv, kaplanMeierFile)
                .await(loadAllFiles);

            // called after both files are loaded, and combines the data from two files
            function loadAllFiles(error, probData, kaplanMeierData) {
                if (error) {
                    // reject on error in await callback
                    reject(error);
                }

                self.patients = probData;

                // added properties to patients which are only present in the second file
                kaplanMeierData.forEach(function(d, i) {
                    self.patients[i].ID = i;
                    self.patients[i].OS = d.OS;
                    self.patients[i].Censor = d.Censor;
                });

                // resolve within await callback after data finished processing
                resolve( /*self.patients*/ );
            }
        });

    }

    /* get the combined full patient list */
    function getPatients() {
        return self.patients;
    }

    /* get the patient Info by the ID */
    function getPatientByID(patientID) {
        return self.patients[patientID];
    }

    /* get a subset of the full patient list based on the filters applied where
       filters is an object with attribute-value pairs
        - e.g. {'Ethnicity': 'white', ... } */
    function filterPatients(filters) {
        let filteredPatients = _.filter(self.patients, filters);

        return _.keyBy(filteredPatients, function(o) {
            return o.ID;
        });
    }

    /* calculate the knn to the selected patient based on (patientAttributes - excludedAttributes),
       return the knn info with full attributes */
    function calculateKNN( /*subjectID, excludedAttributes, k*/ ) {
        let otherPatients = [];

        let numberOfNeighbors = App.models.applicationState.getNumberOfNeighbors();
        let subjectID = App.models.applicationState.getSelectedPatientID();
        let knnExcludedAttributes = App.models.applicationState.getKnnExcludedAttributes();

        // get the actual patient attributes used for calculating knn
        let knnAttributes = _.difference(self.patientAttributes, knnExcludedAttributes);
        console.log(knnAttributes);

        // calculate the similarity scores between the selected patient and the rest patients in the list
        for (let patientID of Object.keys(self.patients)) {
            if (patientID != subjectID && patientID != 'columns') {
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
            if (self.patients[patientID][attribute] === self.patients[subjectID][attribute]) {
                score += 1;
            }
        }

        return score;
    }


    /* Return the publicly accessible functions */
    return {
        loadPatients,
        getPatients,
        getPatientByID,
        filterPatients,
        getKnn: calculateKNN
    };
}
