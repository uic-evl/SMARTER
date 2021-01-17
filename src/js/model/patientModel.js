"use strict"

var App = App || {};

let PatientModel = function() {

    /* Private variables */
    let self = {
        patients: {},
        attributeDomains: {},
        axes: {},
        commonAttributeValues: {},
        commonKaplanAttributeValues: {},
        // addnewPatient: 0,
        previous_chemo : false
        // statisticsOfAllPatients:{}
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
                    //for attribute statistics
                    self.patients[i].SmokeStatusPacksYear = +d["Smoking status (Packs/Year)"];
                    self.patients[i].TotalDose = +d["Total dose"];
                    self.patients[i].TreatmentDays = +d["Treatment duration (Days)"];
                });

                // console.log(self.patients)
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

    // if new patient is added
    function updatePatient(patientInfo){
        // console.log(getPatientNumber())
        let existing_patient = false;
        let keys = Object.keys(self.patients)
        // console.log(keys.length)
        // let key = 0
        for(let key in keys){
            if(self.patients[key]["Dummy ID"] == patientInfo["Dummy ID"]){
                self.patients[key] = patientInfo;
                // console.log("this is a existing patient")
                // console.log(patientInfo["Dummy ID"])
                existing_patient = true;
            }
        }
        // self.addnewPatient = +(key) + 1;
        // let att = +(key) + 1;
        // console.log(existing_patient)
        if(existing_patient == false){
            let total_patient = getPatientNumber();
            // console.log(total_patient, patientInfo["Dummy ID"])
            self.patients[total_patient] = patientInfo;
            // self.addnewPatient = self.addnewPatient + 1
            
        }
        console.log("single patient info updated")
        // console.log(existing_patient, keys.length, self.patients[self.addnewPatient], self.addnewPatient)
        // console.log(self.patients)
    }

    // if new patient added update the predictions
    function update_prediction_values(predictedValues){
        
        // console.log(predictedValues[0])
        let keys = Object.keys(self.patients)
        for(let key in keys){
            for(let i = 0; i < predictedValues[0].length; i++){
                if(self.patients[key]["Dummy ID"] == predictedValues[0][i]){
                    // let attribute =  ["Dummy ID", "aspiration_prob", "feeding_tube_prob", "overall_survival_5yr_prob", "progression_free_5yr_prob"];
                    self.patients[key]["feeding_tube_prob"] = predictedValues[1][i];
                    self.patients[key]["aspiration_prob"] = predictedValues[2][i];
                    self.patients[key]["overall_survival_5yr_prob"] = predictedValues[3][i];
                    self.patients[key]["Probability of Survival"] = +(self.patients[key]["overall_survival_5yr_prob"]);
                    self.patients[key]["progression_free_5yr_prob"] = predictedValues[4][i];
                }
            }
        }
        
        console.log("prediction updated");
        // console.log(self.patients)
    }

    /* get the total number of patients in the list */
    function getPatientNumber() {
        return Object.keys(self.patients).length;
    }

    /* get the patient Info by the ID 
    this ID is the index number of the patient*/
    function getPatientByID(patientID) {
        return self.patients[patientID];
    }

    // get the dummy ID of the patient
    function getDummyID(index){
        return self.patients[index]["Dummy ID"];
    }

    /**get the total number of patients in the dataset */
    function getTotalPatients(){
        let total = Object.keys(self.patients).length;
        // self.addnewPatient = total;
        return total;
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

    function getCommonAttributeValues() {
        return self.commonAttributeValues;
    }

    //from the DummyId getting the index number in the dataset
    function getPatientIDFromDummyID(patientDummyID){
        // console.log(self.patients[2]["Dummy ID"])
        for(let patient in self.patients){
            if(self.patients[patient]["Dummy ID"] == patientDummyID){
                return patient;
            }
        }
    }

    // //calculate the patient stats
    // function statisticsOfAllPatients(){
    //    let attributeData = App.models.attibuteModel.getAttributeData();
    //    console.log(attributeData)

    // }


     /**
         * Computes how many attributes the kn patients have in common with all, according to kaplanAttribute
         *          * @param {array} knn 
         */
        function computeCommonKaplanAttributeValues(patients, kaplanAttribute, currentPatient){
            // console.log("kaplan attribute values " + currentPatient)
            // console.log(kaplanAttribute)
            self.commonKaplanAttributeValues = {Subgroup : 0};
            // let patientRealID = getPatientIDFromDummyID(currentPatient)
            // console.log(patientRealID);
            if(!currentPatient){
                currentPatient = 0;
            }
            // console.log("patient's dummy ID " + currentPatient)
            // console.log("patient serial id in the data set " + test);
            // console.log(patients[13][kaplanAttribute[0]])
            // console.log(patients[test])

            for (let attribute of kaplanAttribute) {
                // there are two N/A values can be made for race and therap
                // console.log(patients[currentPatient][attribute])
                if(patients[currentPatient][attribute] == "N/A") {
                    if(attribute == "Therapeutic combination"){
                        self.commonKaplanAttributeValues["TherapNA"] = 0;
                    }else if(attribute == "Race"){
                        self.commonKaplanAttributeValues["RaceNA"] = 0;
                    }
                }else{
                    self.commonKaplanAttributeValues[patients[currentPatient][attribute]] = 0;
                }
                for (let patient in patients){
                    if(patients[patient][attribute] == "N/A" && patients[currentPatient][attribute] == "N/A"){
                        if(attribute == "Therapeutic combination"){
                            self.commonKaplanAttributeValues["TherapNA"] += 1;
                        }else if(attribute == "Race" && patients[currentPatient][attribute] == "N/A"){
                            self.commonKaplanAttributeValues["RaceNA"] += 1;
                        }
                    }else if (patients[patient][attribute] === patients[currentPatient][attribute]){
                        self.commonKaplanAttributeValues[patients[currentPatient][attribute]] += 1;
                    }
                }
            }

            //calculate how many pepople are in this sub group
            for(let patient in patients){
                // console.log(patient)
                let check = true ;
                for(let attribute of kaplanAttribute){
                    // console.log(patients[patient][attribute])
                    // console.log(patients[patient][attribute] +  "!=" + patients[currentPatient][attribute])
                    if (patients[patient][attribute] != patients[currentPatient][attribute]) {
                        check = false;
                        break;
                    }
                }
                if(check == true){
                    self.commonKaplanAttributeValues["Subgroup"] += 1;
                }
            }


            // console.log(self.commonKaplanAttributeValues)


            return self.commonKaplanAttributeValues;
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
        // console.log(filters)
        let filteredPatients = _.filter(self.patients, filters);
        // console.log(filteredPatients)

        return _.keyBy(filteredPatients, function(o) {
            return o.ID; // object
        });
    }

    /* calculate the knn to the selected patient based on (patientAttributes - excludedAttributes),
       return the knn info with full attributes */
    function calculateKNN( /*subjectID, excludedAttributes, k*/ ) {
        let otherPatients = [];

        let numberOfNeighbors = App.models.applicationState.getNumberOfNeighbors();
        // console.log("number of neigbors " + numberOfNeighbors)
        let subjectID = App.models.applicationState.getSelectedPatientID();
        // console.log("suject ID "+subjectID)

        let subjectIndexID = getPatientIDFromDummyID(subjectID);
        // console.log("patients Index number on dataset " + subjectIndexID)
        // console.log(getPatientByID(subjectIndexID))

        let patientAttributes = App.patientKnnAttributes;
        // console.log("patient Knn Attributes " + patientAttributes)
        let knnExcludedAttributes = App.models.applicationState.getKnnExcludedAttributes();
        // if(self.previous_chemo){
        //     knnExcludedAttributes = [];  
        //     self.previous_chemo = false;          
        // }
        // // console.log("knn excluded attributes " + knnExcludedAttributes)

        // //exclude attribute if the values are N/A 
        // for(let attr of patientAttributes){
        //     // let id = "#knnAttrCheck"+attr;
        //     // console.log($(id).val())
        //     // document.getElementById(attr).disabled = true;
        //     if(self.patients[subjectIndexID][self.axes[attr].name] == "NA"){
        //         // console.log($("#knnAttrCheck"+attr).val())
        //         // $("#knnAttrCheck"+attr).prop('checked', false);
        //         self.previous_chemo = true;
        //         document.getElementById(attr).disabled = true;
        //         if(!knnExcludedAttributes.includes(attr)){
        //             knnExcludedAttributes.push(attr)
        //         }
        //     }else{
        //         document.getElementById(attr).disabled = false;
        //     }
        // }

        // get the actual patient attributes used for calculating knn
        let knnAttributes = _.difference(patientAttributes, knnExcludedAttributes);
        // console.log("knn attributes" + knnAttributes);

        // calculate the similarity scores between the selected patient and the rest patients in the list
        for (let patientID of Object.keys(self.patients)) {
            // console.log(patientID)
            if (patientID !== subjectIndexID && patientID !== 'columns') {
                otherPatients[patientID] = {};
                otherPatients[patientID].id = patientID;
                otherPatients[patientID].score = similarityScore(patientID, subjectIndexID, knnAttributes);
            }
        }
        // console.log(otherPatients)

        let sortedPatients = _.reverse(_.sortBy(otherPatients, ['score']));

        // console.log(sortedPatients)

        // output the top k similar patients
        let topKpatients = [];
        for (let i = 1; i <= numberOfNeighbors; i++) {
            let neighbor = self.patients[sortedPatients[i].id];
            neighbor.score = sortedPatients[i].score;
            topKpatients.push(neighbor);
        }
        // console.log("topKpatients " + topKpatients)

        computeCommonAttributeValues(topKpatients, knnAttributes, subjectIndexID);
        // console.log(topKpatients)
        // console.log(subjectID)
        // console.log(knnAttributes)
        // console.log(self.patients[2])

        return topKpatients;
    }

    /**
     * Computes how many attributes the kn patients have in common with the subject, for each attribute used in the knn
     * @param {array} knn 
     */
    function computeCommonAttributeValues(topKpatients, knnAttributes, subjectID){
        // console.log("subject id in compute common att " + subjectID)
        self.commonAttributeValues = {};
        // console.log(topKpatients)

        for (let attribute of knnAttributes) {
            self.commonAttributeValues[attribute] = 0;
            for (let patient of topKpatients){
                if (patient[self.axes[attribute].name] === self.patients[subjectID][self.axes[attribute].name]) {
                    self.commonAttributeValues[attribute] += 1;
                }
            }
        }
        // console.log(self.commonAttributeValues)
    }


   

    /* calculate the similarity between two patients based on the hamming distance
       over a subset of patientAttributes */
    function similarityScore(patientID, subjectID, knnAttributes) {
        let score = 0;
        let outOf = 1;

        // console.log(knnAttributes)
        
        //giving error 
        // if(self.patients[patientID].AgeAtTx && self.patients[subjectID].AgeAtTx){
        //     let tieBreaker = -(Math.abs(self.patients[patientID].AgeAtTx - self.patients[subjectID].AgeAtTx)) / 150; // max age diff - 150

        //     score += tieBreaker;

        // }

        let tieBreaker = -(Math.abs(self.patients[patientID].AgeAtTx - self.patients[subjectID].AgeAtTx)) / 150; // max age diff - 150

            score += tieBreaker;
        

        for (let attribute of knnAttributes) {
            // console.log(patientID, self.patients[patientID][axes[attribute].name] === self.patients[subjectID][axes[attribute].name]);
            if (self.patients[patientID][self.axes[attribute].name] === self.patients[subjectID][self.axes[attribute].name]) {
                score += 1;
            }
            if (self.patients[patientID][self.axes[attribute].name] != "N/A" && self.patients[subjectID][self.axes[attribute].name]!= "N/A" ) {
                outOf += 1;
            }
        }
        // let twoDecimalScore = score.toFixed(2)
        let percentage = (score / outOf) * 100;
        // let twoFix = percentage.toFixed(2);
        // let result = percentage.toFixed(2) + " %"

        // result = score + " / " + outOf
        return percentage;
    }

    function setAxes(axes) {
        self.axes = axes;
    }


    /* Return the publicly accessible functions */
    return {
        loadPatients,
        getPatients,
        updatePatient,
        update_prediction_values,
        getPatientNumber,
        getPatientByID,
        getPatientIDFromDummyID,
        getDummyID,
        getPatientAttirbuteDomains,
        getPatientKnnAttributeDomains,
        getCommonAttributeValues,
        computeCommonKaplanAttributeValues,
        filterPatients,
        setAxes,
        getTotalPatients,
        // statisticsOfAllPatients,
        getKnn: calculateKNN
    };
}
