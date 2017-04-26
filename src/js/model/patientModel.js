"use strict"

var App = App || {};

let PatientModel = function() {

    let self = {
        patients: {},
        patientAttributes: []
    };

    self.patientAttributes = ["Gender", "Ethnicity", "Tcategory", "Site", "Nodal_Disease", "ecog", "Chemotherapy", "Local_Therapy"];


    // loadData();

    function loadData() {
        // use promise to notify main when the data has been loaded
        return new Promise(function(resolve, reject) {
            // load data using d3 queue
            let dataLoadQueue = d3.queue();

            dataLoadQueue
                .defer(d3.csv, "data/SurvivalProbability.csv")
                .defer(d3.csv, "data/correctKaplanMeier.csv")
                .await(loadAllFiles);

            function loadAllFiles(error, probData, kaplanMeierData) {
                if (error) {
                    // reject on error in await callback
                    reject(error);
                }

                self.patients = probData;

                kaplanMeierData.forEach(function(d, i) {
                    self.patients[i].ID = i + 1;
                    self.patients[i].OS = d.OS;
                    self.patients[i].Censor = d.Censor;
                });

                // resolve within await callback after data finished processing
                resolve( /*self.patients*/ );
            }
        });

    }


    function getData() {
        return self.patients;
    }


    function filterData(filters) {
        let filteredPatients = _.filter(self.patients, filters);

        // let filteredPairs = _.filter(
        //   _.toPairs(self.patients),
        //   (o) => _.isMatch(o[1], filters)
        // );
        //
        // console.log(filteredPairs);
        // console.log(_.fromPairs(filteredPairs));

        return _.keyBy(filteredPatients, function(o) {
          return (o.ID - 1);
        });
    }


    function calculateKNN(subjectID, filters, k) {
      let otherPatients = [];

      // get the actual patient attributes used for calculating knn
      let knnFilters = _.difference(self.patientAttributes, filters);
      console.log(knnFilters);

      for (let patientID of Object.keys(self.patients)) {
        if (patientID != subjectID && patientID != 'columns') {
          otherPatients[patientID] = {};
          otherPatients[patientID].id = patientID;
          otherPatients[patientID].score = similarScore(patientID, subjectID, knnFilters);
        }
      }
      // console.log(otherPatients);

      let sortedPatients =_.reverse(_.sortBy(otherPatients, ['score']));
      // console.log(sortedPatients);

      let topKpatients = [];
      for (let i = 1; i <= k; i++) {
        topKpatients.push(sortedPatients[i]);
      }
      // console.log(topKpatients);

      return topKpatients;
    }


    function similarScore(patientID, subjectID, knnFilters) {
      let score = 0;
      let tieBreaker = -(Math.abs(self.patients[patientID].AgeAtTx - self.patients[subjectID].AgeAtTx)) / 150; // max age diff - 150

      score += tieBreaker;

      for (let f in knnFilters) {
        if (self.patients[patientID][knnFilters[f]] === self.patients[subjectID][knnFilters[f]]) {
          score += 1;
        }
      }

      return score;
    }


    /* Return the publicly accessible functions */
    return {
        loadPatients: loadData,
        getPatients: getData,
        filterPatients: filterData,
        getKnnTo: calculateKNN
    };
}
