"use strict"

var App = App || {};

let KaplanMeierPatientModel = function() {

    let self = {
        patients: {},
        selectedAttribute: null,
        patientGroups: {},
        kaplanMeierPatientGroups: {},
        maxOS: 0,
        medianOS:{}
    };

    /* initialize the patient list when first launching the application, and
       only be called once - when load the patient data */
    function initPatients(patients, attribute) {
        self.patients = patients;
        // console.log(self.patients)
        self.selectedAttribute = attribute;
        // console.log(self.selectedAttribute)

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
        // console.log(self.selectedAttribute)

        updateData();
    }

    /* update the patient groups based on the current patients and current selected attribute */
    function updateData() {
        // get all the values of the selected attribute
        let attributeDomains = App.models.patients.getPatientKnnAttributeDomains();
        let groups = attributeDomains[self.selectedAttribute];
        // console.log("groups from kaplan meier " + groups)
        // console.log(attributeDomains)

        // reset
        self.patientGroups = {};
        self.kaplanMeierPatientGroups = {};
        self.maxOS = 0;

        for (let i = 0; i < groups.length; i++) {
            let filter = {};
            filter[self.selectedAttribute] = groups[i];
            // console.log(filter)

            // filter patients by values of the selected attribute
            // all patients data with filter i.e. all male patients with their all data
            let thisGroupPateint = _.filter(self.patients, filter);
            // console.log(thisGroupPateint)
            self.patientGroups[groups[i]] = _.sortBy(thisGroupPateint, ["OS"]);
            // console.log(self.patientGroups[groups[i]])
            // console.log(groups[i])

            // calculate the data for kaplan-meier plots
            calculateKaplanMeierData(self.patientGroups[groups[i]], groups[i]);
        }
        // console.log("self.patienGroups")
        // console.log(self.patientGroups);
        // console.log("self.kaplanMeierPatientGroups")
        // console.log(self.kaplanMeierPatientGroups);

        self.maxOS = Math.ceil(self.maxOS);
        // console.log(self.maxOS);

        self.medianOS = findMedianProbabilityOS(self.kaplanMeierPatientGroups)
        // console.log(self.medianOS)
    }

    /* calculate the data used for kaplan-meier plots */
    function calculateKaplanMeierData(currentPatientGroup, selectedAttributeValue) {
        // console.log(currentPatientGroup)
        // console.log(selectedAttributeValue)
        let CensorsAtOS = {}; // {OS: [censor], OS: [censor, censor, censor], OS: [], ...}
        let calculateMedian = {};

        for (let patientInd in currentPatientGroup) {
            CensorsAtOS[currentPatientGroup[patientInd].OS] = [];
            // calculateMedian[currentPatientGroup[patientInd].OS] = 0;
        }
        // console.log(calculateMedian)

        for (let patientInd in currentPatientGroup) {
            CensorsAtOS[currentPatientGroup[patientInd].OS].push(currentPatientGroup[patientInd].Censor);
        }

        let sortedOSKeys = Object.keys(CensorsAtOS).sort((a, b) => parseFloat(a) - parseFloat(b));
        // console.log(CensorsAtOS)
        // console.log(sortedOSKeys)

        let probAtOS = []; // [{OS, prob, variance}, {OS, ...}, ...]
        let previousProb = 1;
        let sumForVar = 0;
        let pateintAtRisk = currentPatientGroup.length;
      
        //true means use KM estimator prediction
        // console.log("true")
        for (let keyID in sortedOSKeys) {
            // console.log(keyID)
            // let previousProb = currentPatientGroup[keyID]["Probability of Survival"]
            probAtOS[keyID] = {};

            probAtOS[keyID].OS = sortedOSKeys[keyID];

            // compute the number of patients died at the current OS
            let patientDied = CensorsAtOS[sortedOSKeys[keyID]].length;
            // console.log(patientDied)
            for (let i = 0; i < CensorsAtOS[sortedOSKeys[keyID]].length; i++) {
                // console.log(CensorsAtOS[sortedOSKeys[keyID]][i])
                patientDied -= CensorsAtOS[sortedOSKeys[keyID]][i];
            }


            /*
            if($('#kmcheckbox').is(":checked")){
                //using KM estimator
                // compute the maximum likelihood estimate using Kaplan-Meier estimator formula
                probAtOS[keyID].prob = previousProb * (pateintAtRisk - patientDied) / pateintAtRisk;
                // compute its variance using the Greenwood's formula
            }else{

                // use feeding tube , progression etc
                // console.log('false')
                // let nomogram = $('#nomogram-selector').val()
                let nomogram_data = App.models.axesModel.getAxesData();
                let predictionToShow = nomogram_data["Predictive Probability"].name
                probAtOS[keyID].prob = +(currentPatientGroup[keyID][predictionToShow]);
                // console.log(currentPatientGroup[keyID])
                // console.log(currentPatientGroup[keyID][predictionToShow])
                // console.log(nomogram)
                // console.log(predictionToShow)
            }
            */
        
            //using KM estimator
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
        // console.log(probAtOS)
        // console.log(CensorsAtOS)
        self.kaplanMeierPatientGroups[selectedAttributeValue] = probAtOS;
        // console.log(self.kaplanMeierPatientGroups)
    }

    // get the median survival
    function findMedianProbabilityOS(groups){
        if(groups !== undefined){
            let result = {}
            let key = Object.keys(groups)
            for(let k of key){
                result[k] = 0
                let sum = 0
                let count = 0
                // let group = groups[k]
                // console.log(group)
                // console.log(groups[k][5])
                if(groups[k].length != 0){
                    // console.log(groups[k])
                    for(let i = 0 ; i < groups[k].length; i++){
                        let value = groups[k][i]
                        value.OS = +(value.OS)
                        // console.log(value.prob)
                        if(value.prob >= 0.5 && value.prob < 0.6){
                            sum = sum + value.OS;
                            count = count + 1;
                        }
                    }

                }
                // console.log(k, sum, count)
                if(count == 0){ // not to get NaN or infinity
                    result[k] = 0;
                }else{
                    result[k] = sum / count;
                }
            }
            
            return result
        }
    }

    //get the value of a particular OS i.e. OS 10 mean all that are >= 10 and < 11
    //result sum / count 
    function getProbValue(roundOS, groupPatients){
        if(groupPatients !== undefined){
            let result = {}
            let key = Object.keys(groupPatients)
            for(let k of key){
                result[k] = 0
                let sum = 0
                let count = 0
                if(groupPatients[k].length != 0){
                    // console.log(groups[k])
                    for(let i = 0 ; i < groupPatients[k].length; i++){
                        let value = groupPatients[k][i]
                        value.OS = +(value.OS)
                        // console.log(value, value.prob, 'prob')
                        if(value.OS >= roundOS && value.OS < roundOS + 10){
                            sum = sum + value.prob;
                            count = count + 1;
                        }
                    }

                }
                // console.log(k, sum, count)
                if(count == 0){ // not to get NaN or infinity
                    result[k] = 'N/A';
                }else{
                    result[k] = sum / count;
                }
            }
            
            return result
        }

    }

    // get the median OS
    function getMedianOS(){
        return self.medianOS;
    }

    /* get the data for kaplan-meier plots */
    function getKaplanMeierPatients() {
        return self.kaplanMeierPatientGroups;
    }

    /* get the maximum value of OS */
    function getMaxOS() {
        return self.maxOS;
    }

    function getSelectedAttribute(){
        return self.selectedAttribute;
    }


    return {
        initPatients,
        updatePatients,
        updateSelectedAttribute,
        updateData,
        getKaplanMeierPatients,
        getMaxOS,
        getSelectedAttribute,
        getMedianOS,
        getProbValue
    };
}
