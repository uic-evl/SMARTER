"use strict"

var App = App || {};

let AddNewPatient = function() {

    let self = {
        patientInfo:{},
        all_patients: App.models.patients.getPatients(),
        patientID : 0,
        lastPatient: 10206,
        change_made : false,
        name : ["ID", "Feeding Tube", "Aspiration", "Overall Survival", "Progression Free"],
        prediction: []
    };

    function addNewPatient(){
        // calling it from landingFormController
        //$('.submitButton').on('click', function(){
            // console.log(App.controllers.landingFormController.getValidation())
            // console.log($('.idSelect').val())
            self.patientID = $('.idSelect').val();
            if(self.patientID == 'N/A'){
                // console.log("N/A")
                // self.patientID = self.lastPatient + 1;
                // self.lastPatient = self.patientID;
                self.patientInfo['Dummy ID'] = ''+self.lastPatient + 1+'';
                self.patientInfo.ID = self.patientInfo["Dummy ID"];
                self.lastPatient = self.lastPatient + 1;
                //age
                self.patientInfo[$('#age-element').attr('name')] = $('#age-element').val();
                self.patientInfo.AgeAtTx = +(self.patientInfo["Age at Diagnosis (Calculated)"]);
                //gender
                self.patientInfo[$('#male-radio').attr('name')] = $("input:radio[name=Gender]:checked").val();
                //race
                self.patientInfo[$('#race-element').attr('name')] = $('#race-element').val();
                //aspiration
                self.patientInfo[$('#aspiration-y-radio').attr('name')] = $("input:radio[name='Aspiration rate Pre-therapy']:checked").val();
                //hpv
                self.patientInfo[$('#hpvp16-element').attr('name')] = $('#hpvp16-element').val();
                //smoking status
                self.patientInfo[$('#smoking-never-radio').attr('name')] = $("input:radio[name='Smoking status at Diagnosis (Never/Former/Current)']:checked").val();
                //packsper year
                if($('#packs-per-year-element').val() == ""){
                    self.patientInfo[$('#packs-per-year-element').attr('name')] = "N/A"
                }else{
                    self.patientInfo[$('#packs-per-year-element').attr('name')] = $('#packs-per-year-element').val();
                    self.patientInfo.SmokeStatusPacksYear = +self.patientInfo["Smoking status (Packs/Year)"];
                }
                //tumor-site
                self.patientInfo[$('#tumor-site').attr('name')] = $('#tumor-site').val();
                //sub site
                self.patientInfo[$('#tumor-subsite').attr('name')] = $('#tumor-subsite').val();
                // ajcc 7th
                // self.patientInfo[$('#ajcc7-1').attr('name')] = $("input:radio[name='AJCC 7th edition']:checked").val();
                //ajcc 8th
                // self.patientInfo[$('#ajcc8-1').attr('name')] = $("input:radio[name='AJCC 8th edition']:checked").val();
                //t-cat
                self.patientInfo[$('#tcat1').attr('name')] = $("input:radio[name='T-category']:checked").val();
                //n-cat
                self.patientInfo[$('#ncat-0').attr('name')] = $("input:radio[name='N-category']:checked").val();
                //pathological grade
                self.patientInfo[$('#pgrade1').attr('name')] = $("input:radio[name='Pathological Grade']:checked").val();
                //affected lymph node
                self.patientInfo[$('#affected-lymph').attr('name')] = $('#affected-lymph').val();
                //therapeutic
                self.patientInfo[$('#chemo-element').attr('name')] = $('#chemo-element').val();
                //censor
                // self.patientInfo[$('#local-therapy-element').attr('name')] = $('#local-therapy-element').val();
                // self.patientInfo.Censor = +self.patientInfo.Censor;
                //treatment days
                if($('#duration-element').val() == ""){
                    self.patientInfo[$('#duration-element').attr('name')] = "N/A";
                    // self.patientInfo.TreatmentDays = +self.patientInfo["Treatment duration (Days)"];
                }else{
                    self.patientInfo[$('#duration-element').attr('name')] = $('#duration-element').val();
                    self.patientInfo.TreatmentDays = +self.patientInfo["Treatment duration (Days)"];
                }
                
                //total dose
                if($('#total-dose-element').val() == ""){
                    self.patientInfo[$('#total-dose-element').attr('name')] = "N/A" ;
                    // self.patientInfo.TotalDose = +self.patientInfo["Total dose"];
                }else{
                    self.patientInfo[$('#total-dose-element').attr('name')] = $('#total-dose-element').val();
                    self.patientInfo.TotalDose = +self.patientInfo["Total dose"];
                }
                //total fraction
                if($('#total-fraction-element').val() == ""){
                    self.patientInfo[$('#total-fraction-element').attr('name')] = "N/A";
                }else{
                    self.patientInfo[$('#total-fraction-element').attr('name')] = $('#total-fraction-element').val();
                }
                //dose element
                if($('#dose-element').val() == ""){
                    self.patientInfo[$('#dose-element').attr('name')] = "N/A";
                }else{
                    self.patientInfo[$('#dose-element').attr('name')] = $('#dose-element').val();
                }
                
                //neck dissection
                self.patientInfo[$('#neck-dissect-y-radio').attr('name')] = $("input:radio[name='Neck Disssection after IMRT (Y/N)']:checked").val();
                // self.patientInfo[$('#neck-dissection-element').attr('name')] = $('#neck-dissection-element').val();
                //neck boost
                self.patientInfo[$('#neck-boost-y-radio').attr('name')] = $("input:radio[name='Neck boost (Y/N)']:checked").val();

                // static values needs to make dynamic later
                // these are the predictive initial values... no need to change
                //as our prediction analysis will provide the values and they will be updated
                self.patientInfo["feeding_tube_prob"] = 0.5; // self.all_patients[0]["feeding_tube_prob"];
                self.patientInfo["aspiration_prob"] = 0.5; // self.all_patients[0]["aspiration_prob"];
                self.patientInfo["overall_survival_5yr_prob"] = 0.5; // self.all_patients[0]["overall_survival_5yr_prob"];
                self.patientInfo["Probability of Survival"] = 0.5; // +(self.patientInfo["overall_survival_5yr_prob"]);
                self.patientInfo["progression_free_5yr_prob"] = 0.5; // self.all_patients[0]["progression_free_5yr_prob"];

                //overal survival days calculated - needed in the R code and in the Kaplan meier
                self.patientInfo["OS (Calculated)"] = 0; //self.all_patients[0]["OS (Calculated)"];
                self.patientInfo.OS = 0; // +self.patientInfo["OS (Calculated)"];

                //we need censor value for KM
                // in KM censor is used for patient died... i suppose it means
                //censor 1 - patient died, censor 0 - patient alive
                // i am assuming new patient will be alive hence censor is given 0
                self.patientInfo.Censor = 0;

                //these values are needed for R prediction
                //these are needed in survuval
                self.patientInfo["Overall Survival (1=alive, 0=dead)"] = 1; //assuming the new patient will be alive
                self.patientInfo["Distant Control (1=no DM, 0=DM)"] = "N/A" // self.all_patients[0]["Distant Control (1=no DM, 0=DM)"]
                self.patientInfo["Locoregional control (Time)"] = "N/A" //self.all_patients[0]["Locoregional control (Time)"]
                self.patientInfo["Locoregional Control(1=Control,0=Failure)"] = "N/A" // self.all_patients[0]["Locoregional Control(1=Control,0=Failure)"]
                self.patientInfo["FDM (months)"] = "N/A" //self.all_patients[0]["FDM (months)"]
                // feeding tube is needed as the R code removes those who 
                // does not have feeding tube
                self.patientInfo["Feeding tube 6m"] = "N/A" // self.all_patients[0]["Feeding tube 6m"]

                // console.log(Object.keys(self.patientInfo).length)
                
                //making other values N/A
                for(let key of Object.keys(self.all_patients[0])){
                    if( (key in self.patientInfo) == false ){
                        // console.log(key)
                        self.patientInfo[key] =  "N/A" // self.all_patients[0][key]
                    }
                }
                // console.log(Object.keys(self.patientInfo).length)

                self.change_made = true;

            }else{
                //getting the index number of the patient from the dataset using the dummy ID
                let patient_index = App.models.patients.getPatientIDFromDummyID(self.patientID);
                // console.log(patient_index)
                //getting the patients data using the index
                self.patientInfo = App.models.patients.getPatientByID(patient_index);
                // console.log(self.patientInfo)

                //check if the value is changed.. if changed update the value
                //age
                if(Math.round(self.patientInfo[$('#age-element').attr('name')]) != $('#age-element').val()){
                    self.patientInfo[$('#age-element').attr('name')] = $('#age-element').val();
                    self.patientInfo.AgeAtTx = +(self.patientInfo["Age at Diagnosis (Calculated)"]);
                    self.change_made = true;
                    // console.log("age",self.patientInfo[$('#age-element').attr('name')] , $('#age-element').val())
                }
                //Gender
                if(self.patientInfo[$('#male-radio').attr('name')] != $("input:radio[name=Gender]:checked").val()){
                    self.patientInfo[$('#male-radio').attr('name')] = $("input:radio[name=Gender]:checked").val();
                    self.change_made = true;
                    // console.log("gender", self.patientInfo[$('#male-radio').attr('name')] , $("input:radio[name=Gender]:checked").val())
                }
                //Race
                if(self.patientInfo[$('#race-element').attr('name')] != $('#race-element').val()){
                    self.patientInfo[$('#race-element').attr('name')] = $('#race-element').val();
                    self.change_made = true;
                    console.log("race", $('#race-element').attr('name'), $('#race-element').val())
                }
                //Aspiration
                if(self.patientInfo[$('#aspiration-y-radio').attr('name')] != $("input:radio[name='Aspiration rate Pre-therapy']:checked").val()){
                    self.patientInfo[$('#aspiration-y-radio').attr('name')] = $("input:radio[name='Aspiration rate Pre-therapy']:checked").val();
                    self.change_made = true;
                    // console.log("aspiration",self.patientInfo[$('#aspiration-y-radio').attr('name')],$("input:radio[name='Aspiration rate Pre-therapy']:checked").val())
                }
                //HPV/P16
                if(self.patientInfo[$('#hpvp16-element').attr('name')] != $('#hpvp16-element').val()){
                    self.patientInfo[$('#hpvp16-element').attr('name')] = $('#hpvp16-element').val();
                    self.change_made = true;
                    // console.log("hpv",self.patientInfo[$('#hpvp16-element').attr('name')], $('#hpvp16-element').val())
                }
                //smoking status
                if(self.patientInfo[$('#smoking-never-radio').attr('name')] != $("input:radio[name='Smoking status at Diagnosis (Never/Former/Current)']:checked").val()){
                    self.patientInfo[$('#smoking-never-radio').attr('name')] = $("input:radio[name='Smoking status at Diagnosis (Never/Former/Current)']:checked").val();
                    self.change_made = true;
                    // console.log("smoking status",self.patientInfo[$('#smoking-never-radio').attr('name')], $("input:radio[name='Smoking status at Diagnosis (Never/Former/Current)']:checked").val())
                }
                //packs per year
                if(self.patientInfo[$('#packs-per-year-element').attr('name')] != $('#packs-per-year-element').val()){
                    self.patientInfo[$('#packs-per-year-element').attr('name')] = $('#packs-per-year-element').val();
                    self.patientInfo.SmokeStatusPacksYear = +self.patientInfo["Smoking status (Packs/Year)"];
                    self.change_made = true;
                    // console.log("packs per year",self.patientInfo[$('#packs-per-year-element').attr('name')], $('#packs-per-year-element').val())
                }
                
                //cancer descriptors
                //tumoe site
                if(self.patientInfo[$('#tumor-site').attr('name')] != $('#tumor-site').val()){
                    self.patientInfo[$('#tumor-site').attr('name')] = $('#tumor-site').val();
                    self.change_made = true;
                    // console.log("tumor site",self.patientInfo[$('#tumor-site').attr('name')], $('#tumor-site').val())
                }
                // tumor sub site
                if(self.patientInfo[$('#tumor-subsite').attr('name')] != $('#tumor-subsite').val()){
                    self.patientInfo[$('#tumor-subsite').attr('name')] = $('#tumor-subsite').val();
                    self.change_made = true;
                    // console.log("tumor subsite",self.patientInfo[$('#tumor-subsite').attr('name')], $('#tumor-subsite').val())
                }
                //AJCC 7th
                if(self.patientInfo[$('#ajcc7-1').attr('name')] != $("input:radio[name='AJCC 7th edition']:checked").val()){
                    self.patientInfo[$('#ajcc7-1').attr('name')] = $("input:radio[name='AJCC 7th edition']:checked").val();
                    self.change_made = true;
                    // console.log("ajcc 7th",self.patientInfo[$('#ajcc7-1').attr('name')], $("input:radio[name='AJCC 7th edition']:checked").val())
                }
                //AJCC 8th
                if(self.patientInfo[$('#ajcc8-1').attr('name')] != $("input:radio[name='AJCC 8th edition']:checked").val()){
                    self.patientInfo[$('#ajcc8-1').attr('name')] = $("input:radio[name='AJCC 8th edition']:checked").val();
                    self.change_made = true;
                    // console.log("ajcc 8th", self.patientInfo[$('#ajcc8-1').attr('name')], $("input:radio[name='AJCC 8th edition']:checked").val())
                }
                //T-cat
                if(self.patientInfo[$('#tcat1').attr('name')] != $("input:radio[name='T-category']:checked").val()){
                    self.patientInfo[$('#tcat1').attr('name')] = $("input:radio[name='T-category']:checked").val();
                    self.change_made = true;
                    // console.log("t category", self.patientInfo[$('#tcat1').attr('name')], $("input:radio[name='T-category']:checked").val())
                }
                //N-cat
                if(self.patientInfo[$('#ncat-0').attr('name')] != $("input:radio[name='N-category']:checked").val()){
                    self.patientInfo[$('#ncat-0').attr('name')] = $("input:radio[name='N-category']:checked").val();
                    self.change_made = true;
                    // console.log("n category", self.patientInfo[$('#ncat-na').attr('name')], $("input:radio[name='N-category']:checked").val())
                }
                //Pathological Grade
                if(self.patientInfo[$('#pgrade1').attr('name')] != $("input:radio[name='Pathological Grade']:checked").val()){
                    self.patientInfo[$('#pgrade1').attr('name')] = $("input:radio[name='Pathological Grade']:checked").val();
                    self.change_made = true;
                    // console.log("pathological grade", self.patientInfo[$('#pgrade1').attr('name')], $("input:radio[name='Pathological Grade']:checked").val())
                }
                //affected lymph nodes
                if(self.patientInfo[$('#affected-lymph').attr('name')] != $('#affected-lymph').val()){
                    self.patientInfo[$('#affected-lymph').attr('name')] = $('#affected-lymph').val();
                    self.change_made = true;
                    // console.log("lymph node", self.patientInfo[$('#affected-lymph').attr('name')], $('#affected-lymph').val())
                }

                // treatment info
                //chemotherapy
                if(self.patientInfo[$('#chemo-element').attr('name')] != $('#chemo-element').val()){
                    self.patientInfo[$('#chemo-element').attr('name')] = $('#chemo-element').val();
                    self.change_made = true;
                    // console.log("therapeutic combination", self.patientInfo[$('#chemo-element').attr('name')], $('#chemo-element').val())
                }

                /*
                //local therapy
                if(self.patientInfo[$('#local-therapy-element').attr('name')] != $('#local-therapy-element').val()){
                    self.patientInfo[$('#local-therapy-element').attr('name')] = $('#local-therapy-element').val();
                    self.patientInfo.Censor = +self.patientInfo.Censor;
                    self.change_made = true;
                    // console.log("censor", self.patientInfo[$('#local-therapy-element').attr('name')], $('#local-therapy-element').val())
                }
                */

                //treatment duration
                if(self.patientInfo[$('#duration-element').attr('name')] != $('#duration-element').val()){
                    self.patientInfo[$('#duration-element').attr('name')] = $('#duration-element').val();
                    self.patientInfo.TreatmentDays = +self.patientInfo["Treatment duration (Days)"];
                    self.change_made = true;
                    // console.log("treatment duration", self.patientInfo[$('#duration-element').attr('name')], $('#duration-element').val())
                }
                //total dose
                if(self.patientInfo[$('#total-dose-element').attr('name')] != $('#total-dose-element').val()){
                    self.patientInfo[$('#total-dose-element').attr('name')] = $('#total-dose-element').val();
                    self.patientInfo.TotalDose = +self.patientInfo["Total dose"];
                    self.change_made = true;
                    // console.log("total dose", self.patientInfo[$('#total-dose-element').attr('name')], $('#total-dose-element').val())
                }
                //total fraction
                if(self.patientInfo[$('#total-fraction-element').attr('name')] != $('#total-fraction-element').val()){
                    self.patientInfo[$('#total-fraction-element').attr('name')] = $('#total-fraction-element').val();
                    self.change_made = true;
                    // console.log("total fraction", self.patientInfo[$('#total-fraction-element').attr('name')], $('#total-fraction-element').val())
                }
                //dose/fraction
                if(self.patientInfo[$('#dose-element').attr('name')] != $('#dose-element').val()){
                    self.patientInfo[$('#dose-element').attr('name')] = $('#dose-element').val();
                    self.change_made = true;
                    // console.log("total dose", self.patientInfo[$('#dose-element').attr('name')], $('#dose-element').val())
                }
                //neck dissection
                if(self.patientInfo[$('#neck-dissect-y-radio').attr('name')] != $("input:radio[name='Neck Disssection after IMRT (Y/N)']:checked").val()){
                    // self.patientInfo[$('#neck-dissection-element').attr('name')] = $('#neck-dissection-element').val();
                    self.patientInfo[$('#neck-dissect-y-radio').attr('name')] = $("input:radio[name='Neck Disssection after IMRT (Y/N)']:checked").val();
                    self.change_made = true;
                    // console.log("neck dissection", self.patientInfo[$('#neck-dissection-element').attr('name')], $('#neck-dissection-element').val())
                }
                //Neck boost
                if(self.patientInfo[$('#neck-boost-y-radio').attr('name')] != $("input:radio[name='Neck boost (Y/N)']:checked").val()){
                    self.patientInfo[$('#neck-boost-y-radio').attr('name')] = $("input:radio[name='Neck boost (Y/N)']:checked").val();
                    self.change_made = true;
                    // console.log("neck boost", self.patientInfo[$('#neck-boost-y-radio').attr('name')], $("input:radio[name='Neck boost (Y/N)']:checked").val())
                }

            }

            // console.log(self.patientInfo)
            if(self.change_made == true){
                self.change_made = false;
                //new object
                let update_data = JSON.parse(JSON.stringify(self.patientInfo));
                // console.log(self.patientInfo)
                // console.log(update_data)
                App.controllers.landingFormController.updateLandingForms(update_data)
                App.models.patients.updatePatient(update_data);
                //update the kaplan meier
                App.models.kaplanMeierPatient.updateData()
                
                //send data to the server to get the result
                // making the data type according to R
                //making a deep copy of the patientInfo object
                //so that change in post_data does not affect self.patientInfo
                let post_data = JSON.parse(JSON.stringify(self.patientInfo));
                // let post_data = self.patientInfo;
                post_data["Dummy ID"] = +post_data["Dummy ID"] 
                post_data["Age at Diagnosis (Calculated)"] = +post_data["Age at Diagnosis (Calculated)"] 
                if(post_data["Smoking status (Packs/Year)"] != "N/A"){
                    post_data["Smoking status (Packs/Year)"] = +post_data["Smoking status (Packs/Year)"] 
                }    
                if(post_data["Overall Survival (1=alive, 0=dead)"] != "N/A"){
                    post_data["Overall Survival (1=alive, 0=dead)"] = +post_data["Overall Survival (1=alive, 0=dead)"]
                }  
                if(post_data["Distant Control (1=no DM, 0=DM)"] != "N/A"){
                    post_data["Distant Control (1=no DM, 0=DM)"] = +post_data["Distant Control (1=no DM, 0=DM)"]
                }  
                if(post_data["OS (Calculated)"] != "N/A"){
                    post_data["OS (Calculated)"] = +post_data["OS (Calculated)"]
                }   
                if(post_data["Locoregional control (Time)"] != "N/A"){
                    post_data["Locoregional control (Time)"] = +post_data["Locoregional control (Time)"]
                } 
                if(post_data["Locoregional Control(1=Control,0=Failure)"] != "N/A"){
                    post_data["Locoregional Control(1=Control,0=Failure)"] = +post_data["Locoregional Control(1=Control,0=Failure)"]
                }   
                if(post_data["FDM (months)"] != "N/A"){
                    post_data["FDM (months)"] = +post_data["FDM (months)"]
                }
                // console.log(post_data)

                //deleting the values that are not in the dataset
                delete post_data.AgeAtTx;
                delete post_data.ID;
                delete post_data.OS;
                delete post_data["Probability of Survival"];
                delete post_data.SmokeStatusPacksYear;
                delete post_data.TotalDose;
                delete post_data.TreatmentDays;

                // console.log(post_data)
                //assume we have therapeutic value
                let therapeutic_bool = true;
                // if not we will make it false
                if(post_data["Therapeutic combination"] == "N/A"){
                    therapeutic_bool = false;
                }

                
                axios.post('http://131.193.78.149:8080/output', {patient: post_data, therap: therapeutic_bool})
                .then(function (response) {
                    console.log('prediction data received')
                    // console.log(response.data);
                    self.prediction = response.data;
                    //update all the values
                    App.models.patients.update_prediction_values(self.prediction);

                    // let data = consolidateData();
                    // console.log(data);
                    // if (data.age === null)
                    //     return;
                    // else {
                        $(".landing-form").hide();
                        let currentPatient = $('.idSelect').val();
                        // console.log(currentPatient)
                        App.controllers.patientSelector.updatePateintDropDown();
                        App.controllers.patientSelector.setPatient(currentPatient);

                        // makeing list of attributes used in the prediction
                         App.views.predictionAttributeModal.attribute_List_Server(); 
                    // }

                    // console.log(self.prediction)
                    let clusterData = []
                    for(let i = 7 ; i <= 10; i++){
                        //getting the cluster values
                        clusterData.push(self.prediction[i])
                    }
                    App.views.radiomicView.populateClusterData(clusterData);

                })
                .catch(function (error) {
                    console.log(error);
                });
            }
        //});

    }

    function get_result_name(){
        return self.patientInfo;
    }

    function get_change(){
        return self.change_made;
    }

    function get_prediction_result(){
        return self.prediction;
    }

    function consolidateData() {
        return {
            ...App.views.demographForm.consolidateData(),
            ...App.views.treatmentForm.consolidateData(),
            ...App.views.cancerDescriptorsForm.consolidateData()
        }
    }

    return {
        addNewPatient,
        get_prediction_result,
        get_result_name,
        consolidateData,
        get_change
    }
}