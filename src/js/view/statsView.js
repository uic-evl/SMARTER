"use strict"

var App = App || {};

let StatsView = function () {

    self = {
        dendrogramButton: null,
        lymphNodeButton: null,
        camprtButton: null,
        totalPatientsText: null,
        commonAttributesTable: null,
        detailsStatistics: null,
        index : 0
    };

    init();
    function init() {
        // Code to link the Tim's lymph repo
        self.dendrogramButton = d3.select("#dendrogramlinker");
        // self.lymphNodeButton = d3.select("#lymphthingylinker");

        self.commonAttributesTable = d3.select("#commonAttributesTable");

        // Code to link CAMP-RT
        // self.camprtButton = d3.select("#camprtlinker");
        self.totalPatientsText = d3.select("#total-patient-span");

        //code to show statistics
        self.detailsStatistics = d3.select("#statisticsPatients")

    }

    function setStatisticsPatients(){
        App.models.attributeModel.statisticsOfAllPatients();
        let url = `statistics.html`;
        self.detailsStatistics.attr("href", url);
        // self.detailsStatistics.on("click", App.models.attributeModel.populateStatisticsTable())
    }


    function setDendrogramButtons(pid) {
        // Tim's work currently hosted using GH pages.
        // let url = `https://uic-evl.github.io/LymphaticCancerViz/dendrogram/?id=${pid}`;
        let url = "Lymphnode.html"
        // document.getElementById("dendrogramlinker").removeAttribute("class");
        self.dendrogramButton
            .attr("href", url);
    }
/*
    function setLymphButton(pid) {
        // Tim's work currently hosted using GH pages.
        let url = `https://uic-evl.github.io/LymphaticCancerViz/?id=${pid}`;
        self.lymphNodeButton
            .attr("href", url)
    }

    function setCamprtButton(pid) {
        // let url = `https://uic-evl.github.io/CAMP-RT/?id=${pid}`;
        let url = `https://mnipu2.people.uic.edu/CAMP-RT/?id=${pid}`;
        self.camprtButton
            .attr("href", url);
    }
*/
    function updatePatientsCount() {
        //all of the patients in the data set 
        let patients = App.models.patients.filterPatients();
        // console.log(patients)
        self.totalPatientsText
            .text(Object.keys(patients).length);

        // console.log(self.totalPatientsText.text(Object.keys(patients).length))
    }

    function populateCommonAttributeTable(currentPatient){
        //stats view modification
        if(!currentPatient){
            currentPatient = 0;
        }

        // console.log(currentPatient)
        //getting the current patients values from patient model
        let currentPatientAttributes = App.models.patients.getPatientByID(currentPatient);
        // console.log(currentPatientAttributes)
        //group of the kaplam view
        let kaplanMeierGroup = App.mosaicAttributeOrderForCohortTable;
        // console.log(kaplanMeierGroup)
        
        let allPatients = App.models.patients.getPatients();
        // console.log(allPatients)
        // console.log(kaplanMeierGroup)
        // console.log(currentPatientAttributes)
        //getting the keys of the patients all attribute
        // let keys = Object.keys(currentPatientAttributes)
        // console.log(keys)

        //count all the values of kaplan meier
        let kaplamMeierGroupValues = App.models.patients.computeCommonKaplanAttributeValues(allPatients, kaplanMeierGroup, currentPatient)
        // console.log(kaplamMeierGroupValues)


        $("table.order-list").empty();
        let kaplanGroupNameCounter = 0;

        for (let attr of Object.keys(kaplamMeierGroupValues)) {
            
            // console.log(attr)
            var newRow = $("<tr>");
            var cols = "";

            if(attr == "Subgroup"){
                cols += `<td class="col-sm-6">`+"Patient ID: "+ `<span class="">${currentPatientAttributes["Dummy ID"]}</span> <span class="">${attr}</span></td>`;
            }else{
                if(attr == "TherapNA"){
                    cols += `<td class="col-sm-6"><span class="">${kaplanMeierGroup[kaplanGroupNameCounter]}</span>`+ " : " + `<span class="">N/A</span></td>`;
                     kaplanGroupNameCounter++;
                }else if(attr == "RaceNA"){
                    cols += `<td class="col-sm-6"><span class="">${kaplanMeierGroup[kaplanGroupNameCounter]}</span>`+ " : " + `<span class="">N/A</span></td>`;
                    kaplanGroupNameCounter++;
                }else{
                    cols += `<td class="col-sm-6"><span class="">${kaplanMeierGroup[kaplanGroupNameCounter]}</span>`+ " : " + `<span class="">${attr}</span></td>`;
                    kaplanGroupNameCounter++;
                }
            }
            
            cols += `<td class="col-sm-6"><span class="">${kaplamMeierGroupValues[attr]}</span></td>`;

            // console.log(attr + "and its value is : " + commonAttributeValues[attr])  
            // console.log("keys " : + Object.keys(commonAttributeValues))  
            newRow.append(cols);
            $("table.order-list").append(newRow);

            
        }
        // console.log(newRow)
    }

/*

    function disableLymphnode() {
        // document.getElementById("dendrogramlinker-class").disabled = true;
        document.getElementById("lymphthingylinker-class").disabled = true;
        // document.getElementById("camprtlinker-class").disabled = true;

    }

    function enableLymphnode(){
        // document.getElementById("dendrogramlinker-class").disabled = false;
        document.getElementById("lymphthingylinker-class").disabled = false;
        // document.getElementById("camprtlinker-class").disabled = false;

    }

    function disaleCampRT() {
        // document.getElementById("dendrogramlinker-class").disabled = true;
        // document.getElementById("lymphthingylinker-class").disabled = true;
        document.getElementById("camprtlinker-class").disabled = true;

    }
    function enableCampRT(){
        // document.getElementById("dendrogramlinker-class").disabled = false;
        // document.getElementById("lymphthingylinker-class").disabled = false;
        document.getElementById("camprtlinker-class").disabled = false;

    }

    */


    function updateButtons(currentPatient) {
        //getting the index for our lymphnode

        if(currentPatient !== undefined){
            // console.log(App.models.patients.getDummyID(currentPatient));
             // console.log(currentPatient > 200)
            if(currentPatient != 0 && currentPatient <= 356){ //lymph node has 356 patients
                setIndex(currentPatient)
            }else{
                setIndex(1);
            } 
        }
            /*
            //camp rt 
            //get the dummy ID
            let campDummy = App.models.patients.getDummyID(currentPatient);
            // console.log(campDummy)
            // console.log(self.campRTPatientList)
            // console.log(self.campRTPatientList.includes(campDummy))
            for(let i = 0; i < self.campRTPatientList.length; i++){
                // console.log("yes")
                // dummy ID is in camp RT - enable the link
                if(self.campRTPatientList[i] == campDummy){
                    // console.log("camp enable")
                    enableCampRT();
                    setCamprtButton(campDummy);
                    break;
                }else{
                    // dummy ID is not in camp RT - disable the link
                    // console.log("camp disable")
                    disaleCampRT()
                }
            }

            */

            // setCamprtButton(currentPatient); 
            setDendrogramButtons(currentPatient);     
            setStatisticsPatients();
            // console.log("current patient " + currentPatient)

            populateCommonAttributeTable(currentPatient); 
        //}

    }

    function setIndex(index){
        self.index = index;
    }
    function getIndex(){
        return self.index;
    }

    return {
        updateButtons,
        updatePatientsCount,
        setIndex,
        getIndex
    }
};