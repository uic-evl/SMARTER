"use strict"

var App = App || {};

let TreatmentFormView = function () {

    init();

    function init() {
        self.chemoElement = d3.select("#chemo-element");
        self.localTherapyElement = d3.select("#local-therapy-element");
        self.durationElement = d3.select("#duration-element");
        self.totalDoseElement = d3.select("#total-dose-element");
        self.dosePerDayElement = d3.select("#dose-element");
        self.totalFractionElement = d3.select("#total-fraction-element");
        self.neckElement = d3.select("#neck-dissection-element");
        self.neckBoostYesRadio = d3.select("#neck-boost-y-radio");
        self.neckBoostNoRadio = d3.select("#neck-boost-n-radio");
    }

    function updateForm(data) {
        let {Chemotherapy: chemo, Local_Therapy: local_therapy} = data;
        setChemoElement(chemo);
        setLocalTherapyElement(local_therapy);
    }

    function consolidateData() {
        return {
            "chemo": getChemoElement(),
            "local_therapy": getLocalTherapyElement(),
            "duration": getDurationElement(),
            "total_dose": getTotalDoseElement(),
            "dose_per_day": getDosePerDayElement(),
            "total_fraction": getTotalFractionElement(),
            "neck_dissection": getNeckElement(),
            "neck_boost": getNeckBoostElement()
        }
    }

    function getChemoElement() {
        return self.chemoElement.attr("value");
    }

    function setChemoElement(data) {
        if (data !== undefined) {
            self.chemoElement
                .attr("value", data)
                .text(data);
        }
    }

    function getLocalTherapyElement() {
        return self.localTherapyElement.attr("value");
    }

    function setLocalTherapyElement(data) {
        if (data !== undefined) {
            self.localTherapyElement
                .attr("value", data)
                .text(data);
        }
    }

    function getDurationElement() {
        return self.durationElement.attr("value");
    }

    function setDurationElement(data) {
        if (data !== undefined) {
            self.durationElement
                .attr("value", data)
                .text(data);
        }
    }

    function getTotalDoseElement() {
        return self.totalDoseElement.attr("value");
    }

    function setTotalDoseElement(data) {
        if (data !== undefined) {
            self.totalDoseElement
                .attr("value", data)
                .text(data);
        }
    }

    function getDosePerDayElement() {
        return self.dosePerDayElement.attr("value");
    }

    function setDosePerDayElement(data) {
        if (data !== undefined) {
            self.dosePerDayElement
                .attr("value", data)
                .text(data);
        }
    }

    function getTotalFractionElement() {
        return self.totalFractionElement.attr("value");
    }

    function setTotalFractionElement(data) {
        if (data !== undefined) {
            self.totalFractionElement
                .attr("value", data)
                .text(data);
        }
    }

    function getNeckElement() {
        return self.neckElement.attr("value");
    }

    function setNeckElement(data) {
        if (data !== undefined) {
            self.neckElement
                .attr("value", data)
                .text(data);
        }
    }

    function getNeckBoostElement() {
        let neckBoostYes = self.neckBoostYesRadio.property("checked");
        let neckBoostNo = self.neckBoostNoRadio.property("checked");

        if (neckBoostYes)
            return "yes";
        if (neckBoostNo)
            return "no";

        return null;
    }

    function setNeckBoostElement(data) {
        if (data !== undefined) {
            if (data === "yes") {
                self.neckBoostYesRadio
                    .property("checked", true);
                self.neckBoostNoRadio
                    .property("checked", false);
            } else if (data === "no") {
                self.neckBoostYesRadio
                    .property("checked", false);
                self.neckBoostNoRadio
                    .property("checked", true);
            }
        }
    }

    return {
        updateForm,
        consolidateData
    }
}