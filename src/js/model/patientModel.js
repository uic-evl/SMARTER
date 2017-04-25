"use strict"

var App = App || {};

let PatientModel = function() {

    let self = {
        patients: {}
    };


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
                    self.patients[i].ID = i+1;
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

    function filterData(data, filters) {
        // return _.filter(data, filters);

        let filteredPatients = _.filter(data, filters);

        return _.keyBy(filteredPatients, function(o) {
          return (o.ID - 1);
        });
    }

    function calculateKNN(subject, filters, k) {
      for (let patient in self.patients) {

      }
    }


    /* Return the publicly accessible functions */
    return {
        loadPatients: loadData,
        getPatients: getData,
        filterPatients: filterData,
        calculateKNN
    };
}
