"use strict"

var App = App || {};

let StatsView = function () {

    self = {
        dendrogramButton: null,
        lymphNodeButton: null,
        camprtButton: null,
        totalPatientsText: null,
        commonAttributesTable: null
    };

    init();

    function init() {
        // Code to link the Tim's lymph repo
        self.dendrogramButton = d3.select("#dendrogramlinker");
        self.lymphNodeButton = d3.select("#lymphthingylinker");

        self.commonAttributesTable = d3.select("#commonAttributesTable");

        // Code to link CAMP-RT
        self.camprtButton = d3.select("#camprtlinker");
        self.totalPatientsText = d3.select("#total-patient-span");
    }

    function setDendrogramButtons(pid) {
        // Tim's work currently hosted using GH pages.
        let url = `https://uic-evl.github.io/LymphaticCancerViz/dendrogram/?id=${pid}`;
        self.dendrogramButton
            .attr("href", url);
    }

    function setLymphButton(pid) {
        // Tim's work currently hosted using GH pages.
        let url = `https://uic-evl.github.io/LymphaticCancerViz/?id=${pid}`;
        self.lymphNodeButton
            .attr("href", url)
    }

    function setCamprtButton(pid) {
        let url = `https://uic-evl.github.io/CAMP-RT/?id=${pid}`;
        self.camprtButton
            .attr("href", url);
    }

    function updatePatientsCount() {
        let patients = App.models.patients.filterPatients();
        self.totalPatientsText
            .text(Object.keys(patients).length);
    }

    function populateCommonAttributeTable(commonAttributeValues){
        $("table.order-list").empty();
        for (let attr of Object.keys(commonAttributeValues)) {
            var newRow = $("<tr>");
            var cols = "";
    
            cols += `<td class="col-sm-6"><span class="">${attr}</span></td>`;
            cols += `<td class="col-sm-6"><span class="">${commonAttributeValues[attr]}</span></td>`;
    
            newRow.append(cols);
            $("table.order-list").append(newRow);
        }
    }


    function updateButtons(currentPatient) {
        setDendrogramButtons(currentPatient);
        setLymphButton(currentPatient);
        setCamprtButton(currentPatient);

        populateCommonAttributeTable(App.models.patients.getCommonAttributeValues());
    }

    return {
        updateButtons,
        updatePatientsCount
    }
};