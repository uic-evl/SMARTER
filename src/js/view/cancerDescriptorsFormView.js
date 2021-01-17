"use strict";

var App = App || {};

let CancerDescriptorsFormView = function() {

    init ();

    function init() {
        self.tumorSiteElement = d3.select("#tumor-site");
        self.tumorSubsiteElement = d3.select("#tumor-subsite");
        self.hpvp16Element = d3.select("#hpvp16-element");
        /*
        self.ajcc71Radio = d3.select("#ajcc7-1");
        self.ajcc72Radio = d3.select("#ajcc7-2");
        self.ajcc73Radio = d3.select("#ajcc7-3");
        self.ajcc74Radio = d3.select("#ajcc7-4");
        self.ajcc81Radio = d3.select("#ajcc8-1");
        self.ajcc82Radio = d3.select("#ajcc8-2");
        self.ajcc83Radio = d3.select("#ajcc8-3");
        self.ajcc84Radio = d3.select("#ajcc8-4");
        */
        self.tcat1Radio = d3.select("#tcat1");
        self.tcat2Radio = d3.select("#tcat2");
        self.tcat3Radio = d3.select("#tcat3");
        self.tcat4Radio = d3.select("#tcat4");
        // self.ncatNARadio = d3.select("#ncat-na");
        self.ncat0Radio = d3.select("#ncat-0");
        self.ncat1Radio = d3.select("#ncat-1");
        self.ncat2Radio = d3.select("#ncat-2");
        self.ncat3Radio = d3.select("#ncat-3");
        self.pgrade1Radio = d3.select("#pgrade1");
        self.pgrade2Radio = d3.select("#pgrade2");
        self.pgrade3Radio = d3.select("#pgrade3");
        self.pgrade4Radio = d3.select("#pgrade4");
        self.pgradeNARadio = d3.select("#pgradeNA");
        self.affectedLymph = d3.select("#affected-lymph");
    }

    function updateForm(data) {
        let tmlateral, tumorsubSite, hpv_stat, tcat, ncat, /*ajcc7, ajcc8,*/ affected_lymph_node, pgrade = ""
        if(data === undefined){
            tmlateral = $('#tumor-site').val();
            tumorsubSite = $('#tumor-subsite').val();
            hpv_stat = $('#hpvp16-element').val();
            tcat = $("input:radio[name='T-category']:checked").val();
            /*
            ajcc7 = $("input:radio[name='AJCC 7th edition']:checked").val();
            ajcc8 = $("input:radio[name='AJCC 8th edition']:checked").val();
            */
            affected_lymph_node = $('#affected-lymph').val(); 
            ncat = $("input:radio[name='N-category']:checked").val();
            pgrade = $("input:radio[name='Pathological Grade']:checked").val();

        }else{
            tmlateral = data["Tm Laterality (R/L)"];
            tumorsubSite = data["Tumor subsite (BOT/Tonsil/Soft Palate/Pharyngeal wall/GPS/NOS)"];
            hpv_stat = data["HPV/P16 status"];
            tcat = data["T-category"];
            /*
            ajcc7 = data["AJCC 7th edition"];
            ajcc8 = data["AJCC 8th edition"];
            */
            affected_lymph_node = data["Affected Lymph node cleaned"];
            ncat = data["N-category"];
            pgrade = data["Pathological Grade"];
        }
        // let {"Tm Laterality (R/L)":tmlateral,"Tumor subsite (BOT/Tonsil/Soft Palate/Pharyngeal wall/GPS/NOS)": tumorsubSite, "T-category": tcat, "N-category":ncat,
        // "AJCC 7th edition":ajcc7, "AJCC 8th edition":ajcc8, "Affected Lymph node cleaned":affected_lymph_node, "Pathological Grade":pgrade} = data;
        setTumorSiteElement(tmlateral)
        setTumorSubsiteElement(tumorsubSite);
        setHpvp16Element(hpv_stat);
        setTcatElement(tcat);
        /*
        setAjcc7Element(ajcc7);
        setAjcc8Element(ajcc8);
        */
        setAffectedLymphNodeElement(affected_lymph_node);
        setNcatElement(ncat);
        setPGradeElement(pgrade);
    }

    function consolidateData() {
        return {
            site: getTumorSiteElement(),
            subsite: getTumorSubsiteElement(),
            hpvp16: getHpvp16Element(),
            /*
            ajcc7: getAjcc7Element(),
            ajcc8: getAjcc8Element(),
            */
            tcat: getTcatElement(),
            ncat: getNcatElement(),
            pgrade: getPGradeElement(),
            affected_lymph_node: getAffectedLymphNodeElement()
        };
    }

    function setTumorSiteElement(data) {
        if (data !== undefined) {
            // self.tumorSiteElement
            //     .attr("value", data)
            //     .text(data);
            document.getElementById("tumor-site").value = data;
        }
    }

    function getTumorSiteElement() {
        return self.tumorSiteElement.attr("value");
    }

    function setTumorSubsiteElement(data) {
        if (data !== undefined) {
            // self.tumorSubsiteElement
            //     .attr("value", data)
            //     .text(data);
            document.getElementById("tumor-subsite").value = data;
        }
    }

    function getTumorSubsiteElement() {
        return self.tumorSubsiteElement.attr("value");
    }



    function getHpvp16Element() {
        return self.hpvp16Element.attr("value");
    }

    function setHpvp16Element(data) {
        if (data !== undefined) {
            // self.hpvp16Element
            //     .attr("value", data)
            //     .text(data);
            document.getElementById("hpvp16-element").value = data;
        }
    }

    /*
    function setAjcc7Element(data) {
        if (data !== undefined) {
            if (data === "I") {
                self.ajcc71Radio
                    .property("checked", true);
                self.ajcc72Radio
                    .property("checked", false);
                self.ajcc73Radio
                    .property("checked", false);
                self.ajcc74Radio
                    .property("checked", false);
            } else if (data === "II") {
                self.ajcc71Radio
                    .property("checked", false);
                self.ajcc72Radio
                    .property("checked", true);
                self.ajcc73Radio
                    .property("checked", false);
                self.ajcc74Radio
                    .property("checked", false);
            } else if (data === "III") {
                self.ajcc71Radio
                    .property("checked", false);
                self.ajcc72Radio
                    .property("checked", false);
                self.ajcc73Radio
                    .property("checked", true);
                self.ajcc74Radio
                    .property("checked", false);
            } else if (data === "IV") {
                self.ajcc71Radio
                    .property("checked", false);
                self.ajcc72Radio
                    .property("checked", false);
                self.ajcc73Radio
                    .property("checked", false);
                self.ajcc74Radio
                    .property("checked", true);
            }
        }
    }

    function getAjcc7Element() {
        let i = self.ajcc71Radio.property("checked");
        let ii = self.ajcc72Radio.property("checked");
        let iii = self.ajcc73Radio.property("checked");
        let iv = self.ajcc74Radio.property("checked");

        if (i)
            return "I";
        if (ii)
            return "II";
        if (iii)
            return "III";
        if (iv)
            return "IV";

        return null;
    }

    function setAjcc8Element(data) {
        if (data !== undefined) {
            if (data === "I") {
                self.ajcc81Radio
                    .property("checked", true);
                self.ajcc82Radio
                    .property("checked", false);
                self.ajcc83Radio
                    .property("checked", false);
                self.ajcc84Radio
                    .property("checked", false);
            } else if (data === "II") {
                self.ajcc81Radio
                    .property("checked", false);
                self.ajcc82Radio
                    .property("checked", true);
                self.ajcc83Radio
                    .property("checked", false);
                self.ajcc84Radio
                    .property("checked", false);
            } else if (data === "III") {
                self.ajcc81Radio
                    .property("checked", false);
                self.ajcc82Radio
                    .property("checked", false);
                self.ajcc83Radio
                    .property("checked", true);
                self.ajcc84Radio
                    .property("checked", false);
            } else if (data === "IV") {
                self.ajcc81Radio
                    .property("checked", false);
                self.ajcc82Radio
                    .property("checked", false);
                self.ajcc83Radio
                    .property("checked", false);
                self.ajcc84Radio
                    .property("checked", true);
            }
        }
    }

    function getAjcc8Element() {
        let i = self.ajcc81Radio.property("checked");
        let ii = self.ajcc82Radio.property("checked");
        let iii = self.ajcc83Radio.property("checked");
        let iv = self.ajcc84Radio.property("checked");

        if (i)
            return "I";
        if (ii)
            return "II";
        if (iii)
            return "III";
        if (iv)
            return "IV";

        return null;
    }

    */

    function setTcatElement(data) {
        if (data !== undefined) {
            if (data === "T1") {
                self.tcat1Radio
                    .property("checked", true);
                self.tcat2Radio
                    .property("checked", false);
                self.tcat3Radio
                    .property("checked", false);
                self.tcat4Radio
                    .property("checked", false);
            } else if (data === "T2") {
                self.tcat1Radio
                    .property("checked", false);
                self.tcat2Radio
                    .property("checked", true);
                self.tcat3Radio
                    .property("checked", false);
                self.tcat4Radio
                    .property("checked", false);
            } else if (data === "T3") {
                self.tcat1Radio
                    .property("checked", false);
                self.tcat2Radio
                    .property("checked", false);
                self.tcat3Radio
                    .property("checked", true);
                self.tcat4Radio
                    .property("checked", false);
            } else if (data === "T4") {
                self.tcat1Radio
                    .property("checked", false);
                self.tcat2Radio
                    .property("checked", false);
                self.tcat3Radio
                    .property("checked", false);
                self.tcat4Radio
                    .property("checked", true);
            }
        }
    }

    function getTcatElement() {
        let t1 = self.tcat1Radio.property("checked");
        let t2 = self.tcat2Radio.property("checked");
        let t3 = self.tcat3Radio.property("checked");
        let t4 = self.tcat4Radio.property("checked");

        if (t1)
            return "T1";
        if (t2)
            return "T2";
        if (t3)
            return "T3";
        if (t4)
            return "T4";

        return null;
    }

    function setNcatElement(data) {
        if (data !== undefined) {
            /* if (data === "N/A") {
                self.ncatNARadio
                    .property("checked", true);
                self.ncat0Radio
                    .property("checked", false);
                self.ncat1Radio
                    .property("checked", false);
                self.ncat2Radio
                    .property("checked", false);
                self.ncat3Radio
                    .property("checked", false);
            } else */ if (data === "N0") {
                // self.ncatNARadio
                //     .property("checked", false);
                self.ncat0Radio
                    .property("checked", true);
                self.ncat1Radio
                    .property("checked", false);
                self.ncat2Radio
                    .property("checked", false);
                self.ncat3Radio
                    .property("checked", false);
            } else if (data === "N1") {
                // self.ncatNARadio
                //     .property("checked", false);
                self.ncat0Radio
                    .property("checked", false);
                self.ncat1Radio
                    .property("checked", true);
                self.ncat2Radio
                    .property("checked", false);
                self.ncat3Radio
                    .property("checked", false);
            } else if (data === "N2") {
                // self.ncatNARadio
                //     .property("checked", false);
                self.ncat0Radio
                    .property("checked", false);
                self.ncat1Radio
                    .property("checked", false);
                self.ncat2Radio
                    .property("checked", true);
                self.ncat3Radio
                    .property("checked", false);
            } else if (data === "N3") {
                // self.ncatNARadio
                //     .property("checked", false);
                self.ncat0Radio
                    .property("checked", false);
                self.ncat1Radio
                    .property("checked", false);
                self.ncat2Radio
                    .property("checked", false);
                self.ncat3Radio
                    .property("checked", true);
            }
        }
    }

    function getNcatElement() {
        // let nna = self.ncatNARadio.property("checked");
        let n0 = self.ncat0Radio.property("checked");
        let n1 = self.ncat1Radio.property("checked");
        let n2 = self.ncat2Radio.property("checked");
        let n3 = self.ncat3Radio.property("checked");

        /*
        if (nna)
            return "N/A"; */
        if (n0)
            return "N0";
        if (n1)
            return "N1";
        if (n2)
            return "N2";
        if (n3)
            return "N3";

        return null;
    }

    function setPGradeElement(data) {
        if (data !== undefined) {
            if (data === "I") {
                self.pgrade1Radio
                    .property("checked", true);
                self.pgrade2Radio
                    .property("checked", false);
                self.pgrade3Radio
                    .property("checked", false);
                self.pgrade4Radio
                    .property("checked", false);
                self.pgradeNARadio
                    .property("checked", false);
            } else if (data === "II") {
                self.pgrade1Radio
                    .property("checked", false);
                self.pgrade2Radio
                    .property("checked", true);
                self.pgrade3Radio
                    .property("checked", false);
                self.pgrade4Radio
                    .property("checked", false);
                self.pgradeNARadio
                    .property("checked", false);                
            } else if (data === "III") {
                self.pgrade1Radio
                    .property("checked", false);
                self.pgrade2Radio
                    .property("checked", false);
                self.pgrade3Radio
                    .property("checked", true);
                self.pgrade4Radio
                    .property("checked", false);
                self.pgradeNARadio
                    .property("checked", false);
            } else if (data === "IV") {
                self.pgrade1Radio
                    .property("checked", false);
                self.pgrade2Radio
                    .property("checked", false);
                self.pgrade3Radio
                    .property("checked", false);
                self.pgrade4Radio
                    .property("checked", true);
                self.pgradeNARadio
                    .property("checked", false);
            } else if (data === "N/A"){
                self.pgrade1Radio
                    .property("checked", false);
                self.pgrade2Radio
                    .property("checked", false);
                self.pgrade3Radio
                    .property("checked", false);
                self.pgrade4Radio
                    .property("checked", false);
                self.pgradeNARadio
                    .property("checked", true);

            }
        }
    }

    function getPGradeElement() {
        let p1 = self.pgrade1Radio.property("checked");
        let p2 = self.pgrade2Radio.property("checked");
        let p3 = self.pgrade3Radio.property("checked");
        let p4 = self.pgrade4Radio.property("checked");
        let pNA = self.pgradeNARadio.property("checked");

        if (p1)
            return "I";
        if (p2)
            return "II";
        if (p3)
            return "III";
        if (p4)
            return "IV";
        if (pNA)
            return "N/A";

        return null;
    }

    function setAffectedLymphNodeElement(data) {
        if (data !== undefined) {
            // self.affectedLymph
            //     .attr("value", data)
            //     .text(data);
            document.getElementById("affected-lymph").value = data;
        }
    }

    function getAffectedLymphNodeElement() {
        return self.affectedLymph.attr("value");
    }

    return {
        updateForm,
        consolidateData
    }

};