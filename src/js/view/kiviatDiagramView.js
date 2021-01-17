"use strict"

var App = App || {};

let KiviatDiagramView = function(targetID) {

    let self = {
        attributeScales: {},
        colorScale: null,
        subjectElement: null,
        subjectSvg: null,
        neighborsElement: null,
        neighborsSvgs: null,
        legendElement: null,
        legendSvg: null,
        legendHeight: null,
        axisTip: null,
        centerTip: null,
        axes: {},
        groupPatients:{},
        attributes : ["AgeAtTx", "Gender", "Race","Smoking Status","HPV/P16",
         "T-category", "N-category","Tumor Subsite","Therapeutic combination"]
    };

    function init() {
        
        self.subjectElement = d3.select(targetID + "-subject");
        self.neighborsElement = d3.select(targetID + "-neighbors");
        self.legendElement = d3.select(targetID + "-legend");

        let titleHeight = document.getElementById("title").clientHeight;
        self.legendHeight = ( window.innerHeight / 3 ) - (2.5 * titleHeight)


        // console.log(self.subjectElement.node().clientHeight)

        self.axes = App.models.axesModel.getAxesData();

        self.subjectSvg = self.subjectElement.append("svg")
            .attr("width", self.subjectElement.node().clientWidth)
            .attr("height", ( window.innerHeight / 2 ) - (2 * titleHeight))
            .attr("viewBox", "0 0 100 100")
            .attr("preserveAspectRatio", "xMidYMid")
            .each(createKiviatDiagram);

        self.neighborsSvgs = self.neighborsElement.selectAll(".patientNeighborSVG");

        self.legendSvg = self.legendElement.append("svg")
            .attr("width", self.legendElement.node().clientWidth)
            .attr("height", ( window.innerHeight / 3 ) - (2.5 * titleHeight))
            .attr("viewBox", "0 0 150 100")
            .attr("preserveAspectRatio", "xMidYMid");


        // console.log(App.kiviatAttributes)
        // initialize the range of each attribute
        for (let attribute of App.kiviatAttributes) {
            self.attributeScales[attribute] = d3.scaleOrdinal()
                // .range([5, 35]);
        }

        // console.log(self.attributeScales)

        self.colorScale = d3.scaleLinear()
            .interpolate(d3.interpolateHcl)
            // .domain([1,0])
            .range(["#d18161", "#70a4c2"]); // #ba89b9 middle color
        // .range(['#d73027','#fc8d59','#fee090','#ffffbf','#e0f3f8','#91bfdb','#4575b4']);

        self.ordinalColor = d3.scaleOrdinal()
            // .interpolate(d3.interpolateHcl)
            .range(["#d18161", "#70a4c2"])
            .domain(["Y", "N"]);

        drawLegend();
    }

    function drawLegend() {
        // Create the svg:defs element and the main gradient definition.
        let svgDefs = self.legendSvg.append('defs');

        let legendGradient = svgDefs.append('linearGradient')
            .attr('id', 'legendGradient');

        // Create the stops of the main gradient. Each stop will be assigned
        // a class to style the stop using CSS.
        legendGradient.append('stop')
            .attr('class', 'stop-bottom')
            .attr('offset', '0');

        legendGradient.append('stop')
            .attr('class', 'stop-middle')
            .attr('offset', '0.5');


        legendGradient.append('stop')
            .attr('class', 'stop-top')
            .attr('offset', '1');

        //Vertical gradient
        legendGradient
            .attr("x1", "0%")
            .attr("y1", "100%")
            .attr("x2", "0%")
            .attr("y2", "0%");

        // survival rate legend - Use the gradient to set the shape fill, via CSS.
        self.legendSvg.append("rect")
            .classed("filled", true)
            .attr("x", 15)
            .attr("y", 10)
            .attr("width", 10)
            .attr("height", self.legendHeight)
            .style("opacity", 0.75);

        let survivalRateText = ["0", "Toxicity", "1"];
        legendText(survivalRateText)

        /*
        self.legendElement.append("div")
            // .append("h5")
            .style("text-align", "center")
            .text("With Lymphnode")
            .style("padding-top", "15%")
            // .attr("class", "viewTitleDiv")

        let textName = ["Lymph Node Clusters"]
        let idName = ["dendrogramlinker"]
        
        let spatialInformation = self.legendElement.append("div")
                                     .attr("preserveAspectRatio", "xMidYMid")
                                     .style("padding-left", "18%")
        for(let i = 0 ; i < textName.length ; i ++ ){
            spatialInformation.append("a")
                .attr("href", "Lymphnode.html")
                .attr("target", "_blank")
                .attr("id", idName[i])
                .append("button")
                .attr("class", "btn btn-default btn-sm")
                .attr('id', idName[i] + '-class')
                .style("font-size", "10px")
                // .style("display", "block")
                .style("margin-bottom", "5px")
                .text(textName[i])      
        }
        */     
        
    }

    function legendText(survivalRateText){
        d3.selectAll('#dynamic-legend').remove();
        for (let i = 0; i < 3; i++) {
            self.legendSvg.append("text")
                .attr('id', 'dynamic-legend')
                .attr("x", 30)
                .attr("y", 20 + 40 * i)
                .style("font-size", "10px")
                .style("font-weight", "bold")
                .text(survivalRateText[i]);
        }
    }


    function update(patients) {
        // console.log(patients)
        // console.log("i am update")
        // console.log(patients.subject);
        // console.log(patients.neighbors);

        self.groupPatients = patients;
        
        if(App.controllers.kiviatAttrSelector.getKiviatTrigger()){
            console.log(App.kiviatAttributes)
            // console.log("kiviat axes control")
            // console.log(App.controllers.kiviatAttrSelector.getKiviatTrigger());
            App.controllers.kiviatAttrSelector.setKiviatTrigger(false);
            // console.log(App.controllers.kiviatAttrSelector.getKiviatTrigger());

            if(App.kiviatAttributes.includes("Therapeutic combination") && self.groupPatients.subject["Therapeutic combination"] == "N/A"){
                let index = App.kiviatAttributes.indexOf("Therapeutic combination");
                App.kiviatAttributes.splice(index, 1)
            }
            if(App.kiviatAttributes.includes("Race") && self.groupPatients.subject["Race"] == "N/A"){
                let index = App.kiviatAttributes.indexOf("Race");
                App.kiviatAttributes.splice(index, 1)
            }

            self.subjectElement.select("svg").remove();
            self.subjectElement.select("div").remove();
            self.neighborsElement.selectAll("svg").remove();
            self.neighborsElement.selectAll("div").remove();
            self.legendElement.select("svg").remove();
            self.legendElement.selectAll("div").remove();
            self.legendElement.select("p").remove();

            init();
            commonMethodForKnnAndKiviat(patients);
            // let p = $(".idSelect").val();
            // // update the patient's information
            // let index = App.models.patients.getPatientIDFromDummyID(p)
            // $('#index-text').html('Patient Index: ' + index);
        }else{
            // console.log("other calls")
            App.kiviatAttributes = ["AgeAtTx", "Gender", "Race","Smoking Status","HPV/P16",
            "T-category", "N-category","Tumor Subsite","Therapeutic combination"]
            if(self.groupPatients.subject != undefined){
                for(let attr of App.kiviatAttributes){
                    if(self.groupPatients.subject[self.axes[attr].name] == "N/A"){
                        // kiviat = true;
                        let index = App.kiviatAttributes.indexOf(attr);
                        if (index >= 0) {
                            App.kiviatAttributes.splice( index, 1 );
                        }
                    }
                }
            }
            // console.log(App.kiviatAttributes)

            self.subjectElement.select("svg").remove();
            self.subjectElement.select("div").remove();
            self.neighborsElement.selectAll("svg").remove();
            self.neighborsElement.selectAll("div").remove();
            self.legendElement.select("svg").remove();
            self.legendElement.selectAll("div").remove();
            self.legendElement.select("p").remove();

            init();
            commonMethodForKnnAndKiviat(patients);
            // let p = $(".idSelect").val();
            // // update the patient's information
            // let index = App.models.patients.getPatientIDFromDummyID(p)
            // $('#index-text').html('Patient Index: ' + index);
            // console.log(App.kiviatAttributes)
        }        
    }

    function commonMethodForKnnAndKiviat(patients){
        // console.log(patients.subject.score)
        if (patients.subject.score) {
            delete patients.subject.score;
        }

        let currentPatient = App.controllers.patientSelector.getCurrentPatient();
        // console.log(currentPatient)
        let currentPatientByIndex = App.models.patients.getPatientIDFromDummyID(currentPatient)
        // console.log(currentPatientByIndex)

        // sets the most similar patients buttons' links.
        App.views.stats.updateButtons(currentPatientByIndex);

        // console.log(patients.subject)

        // JOIN new patients with old elements.
        let neighborBind = self.neighborsSvgs.data(patients.neighbors);

        // EXIT old patients not present in new pateint list
        neighborBind.exit().remove();


        // update the kiviat diagram of the subject
        //need to create for axes control
        self.subjectSvg
            .datum(patients.subject)
            // .each(createKiviatDiagram)
            .each(updateKiviatPatient);



        // UPDATE kiviat diagrams of old patients present in new patient list
        d3.selectAll(".patientNeighborSVG")
            // .each(createKiviatDiagram)
            .each(updateKiviatPatient);

        // ENTER new patients in new pateint list, and create kiviat diagrams along with axes
        // console.log((self.neighborsElement.node().clientWidth / patients.neighbors.length) - 10)
        neighborBind.enter().append("div")
            .attr("class", "col-md-2")
            .style("margin-right", "10px")
            .append("svg")
            .attr("width", (self.neighborsElement.node().clientWidth / patients.neighbors.length) - 40 ) //minus margin-right
            .attr("height", ( window.innerHeight / 3 ) - (1.5 * document.getElementById("title").clientHeight) )
            .style("margin-top", "20px")
            // .style("margin-right", "10px")
            .attr("viewBox", "0 0 100 100")
            .attr("preserveAspectRatio", "xMidYMin")
            .attr("class", "patientNeighborSVG")
            .each(createKiviatDiagram)
            .each(updateKiviatPatient);

        self.neighborsSvgs = d3.selectAll(".patientNeighborSVG");
        // console.log("#################")
        
    }

    /* create the axes of kiviat diagram */
    function createKiviatDiagram(d, i) {
        // console.log(d)
        // console.log("=== operator for undefined" + (d == undefined))
        // console.log(self.axes)
        // console.log(App.kiviatAttributes)
        // console.log(App.kiviatAttributes[0])
        // console.log(self.axes[App.kiviatAttributes[0]].name)
        // console.log(patients.subject[self.axes[App.kiviatAttributes[0]].name])


        let SVG = d3.select(this);
        let similarityHead = d3.select(this.parentNode)

        creatToolTips(d);

        SVG.call(self.axisTip);
        SVG.call(self.centerTip);

        let translateGroup = SVG.append("g")
            .attr("transform", "translate(50, 50)")
            .attr("class", "translateGroup");

        let axesGroup = translateGroup.append("g")
            .attr("class", "axesGroup");

        translateGroup.append("path")
            .attr("class", "kiviatPath");

        // console.log(App.patientKnnAttributes);

        // tool tip circle in the center to show ID, Age, and Survial Prob
        axesGroup.append("circle")
            .attr("class", "centerTooltipCircle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", 8)
            .style("opacity", 0.25)
            .on('mouseover', self.centerTip.show)
            .on('mouseout', self.centerTip.hide);

        // draw axes
        // console.log(App.kiviatAttributes)
        for (let j = 0; j < App.kiviatAttributes.length; j++) {
            let axisEndpoint = rotatePointOntoAxis(40, j);

            axesGroup.append("line")
                .attr("class", "axisLine")
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", axisEndpoint.x)
                .attr("y2", axisEndpoint.y)
                .style("stroke", "darkgray")
                .style("stroke-width", "1px");

            // axis label
            axesGroup.append("text")
                .attr("x", axisEndpoint.x)
                .attr("y", axisEndpoint.y + 4)
                .style("font-size", "0.38em")
                .style("text-anchor", "middle")
                // .attr("transform", "rotate(0)")
                // .text("helo");
                .text(App.kiviatAttributes[j]);

            // console.log("App.kiviatAttributes[j]" + App.kiviatAttributes[j])
            // console.log(self.axes)
            // console.log("d")
            // console.log(d)
            // tool tip circle for each axis
            axesGroup.append("circle")
                .attr("class", "axisTooltipCircle")
                .attr("cx", axisEndpoint.x)
                .attr("cy", axisEndpoint.y)
                .attr("r", 7)
                .style("opacity", 0.25)
                .datum({
                    "attr": App.kiviatAttributes[j]
                    // "name" : d[self.axes[App.kiviatAttributes[j]].name]
                    // "val": d[App.patientKnnAttributes[j]]
                })
                .on('mouseover', self.axisTip.show)
                .on('mouseout', self.axisTip.hide);
        }

        similarityHead.append("div")/*.append("h5")*/
            .attr("class", "similarityScore")
            //.attr("x", 0)
            //.attr("y", 10)
            .style("font-size", "10px")
            .style("font-weight", "bold")
            .style("text-align", "center");

        similarityHead.append("div")
            .attr("class", "predictionOutcome")
            .style("font-size", "10px")
            .style("text-align", "center")
    }

    function creatToolTips() {
        // console.log("hello")
        // d3.selectAll('#center').remove()
        // console.log(predictionToShow)

        self.axisTip = d3.tip()
            .attr("class", "d3-tip")
            .direction("e")
            .html(function(d) {
                // console.log(d.attr)
                if(d.attr == "AgeAtTx"){
                    let age = Math.round(d.val)
                    return d.attr + ": " + age
                }else{
                    return d.attr + ": " + d.val;
                }
            });

        self.centerTip = d3.tip()
            .attr("class", "d3-tip")
            .attr("id", "center")
            .direction("e")
            .html(function(d) {
                let age = Math.round(d.AgeAtTx)
                // console.log(d.ID, d.AgeAtTx, d[predictionToShow], predictionToShow)
                let percentage = d["Probability of Survival"] * 100;
                return "ID: " + d.ID + "<br>Age: " + age + "<br>" + d.predictionToShow + ": " + percentage.toFixed(3) + " %";
            });
    }

    /* draw the kiviat diagram for each patient */
    function updateKiviatPatient(d) {
        // console.log("update kiviat patient is called")

        // console.log(App.controllers.kiviatAttrSelector.getKiviatTrigger());
        // console.log(i)
        // console.log(App.patientKnnAttributes)
        let SVG = d3.select(this);
        let similarityHead = d3.select(this.parentNode)       

        SVG.select(".kiviatPath")
            .attr("d", calculatePath)
            .style("fill", kiviatColor(d))
            // .style("fill", "black")
            .style("opacity", 0.75);

        if (d.score) {
            similarityHead.select(".similarityScore")
                .html(function(){
                    let text = "Similarity Score: " + d.score.toFixed(2) + " %"

                    return text;
                });
            similarityHead.select(".predictionOutcome")
                .html(function(){
                    let feed = +d["feeding_tube_prob"] * 100;
                    let asp = +d["aspiration_prob"] * 100;
                    let prog = +d["progression_free_5yr_prob"] * 100;
                    let os = +d["overall_survival_5yr_prob"] * 100;
                    let text = /*"Score: " + d.score + "<br>" +*/
                    "OS: " + os.toFixed(2) + " %<br>" +
                    "RMS: " + prog.toFixed(2) + " %<br>" +
                    "FDT: " + feed.toFixed(2) + " %<br>" +
                    "ASP: " + asp.toFixed(2) + " %"
                    return text;
                });
        }

        // update the attribute value for the axis tool tip
        SVG.selectAll(".axesGroup")
            .selectAll(".axisTooltipCircle")
            .datum(function(data) {
                // console.log(data)
                let newData = data;
                // "name" : d[self.axes[App.kiviatAttributes[j]].name]
                data.name = self.axes[data.attr].name;
                data.val = d[data.name]; //getting the values from name
                // console.log(newData)

                return newData;
            });

        // update info for the center tool tip
        SVG.selectAll(".axesGroup")
            .selectAll(".centerTooltipCircle")
            .datum(function(){
                // console.log(d);
                let newData = d;
                let nomogram_data = App.models.axesModel.getAxesData();
                d.predictionToShow = nomogram_data["Predictive Probability"].name;
                d["Probability of Survival"] = +(d[d.predictionToShow])
                return newData
            });
    }

    function updateColor(data){
        // update the kiviat diagram of the subject
        //need to create for axes control
        // calls when we change nomogram selections
        // d3.selectAll('.d3-tip').remove()
        // let nomogram_data = App.models.axesModel.getAxesData();
        // let predictionToShow = nomogram_data["Predictive Probability"].name
        // console.log(predictionToShow)
        self.subjectSvg
            .datum(data.subject)
            // .each(createKiviatDiagram)
            .each(updateKiviatPatient)
        
        d3.selectAll(".patientNeighborSVG")
        .data(data.neighbors)
        .each(updateKiviatPatient)

        // creatToolTips()

        // console.log($('#cente').html())

        // $('#center').innerHTML = "hello"



    }

    function kiviatColor(d){
        // console.log(self.groupPatients)
        let nomogram_data = App.models.axesModel.getAxesData();
        let predictionToShow = nomogram_data["Predictive Probability"].name
        // console.log(predictionToShow, d[predictionToShow])
        if(predictionToShow == 'feeding_tube_prob' || predictionToShow == 'aspiration_prob'){
            // legend toxicity
            let survivalRateText = ["0", "Toxicity", "1"];
            legendText(survivalRateText)
            //color the subject by its prediction value 
            // color the neighbours by yes no
            if(self.groupPatients.subject["Dummy ID"] == d["Dummy ID"]){
                //domain 1, 0
                self.colorScale.domain([1,0])    
                // console.log(self.colorScale(d[predictionToShow]))
                return self.colorScale(d[predictionToShow])
            }else{
                if(predictionToShow == 'feeding_tube_prob'){
                    // console.log(self.colorScale(d["Feeding tube 6m"]))
                    return self.ordinalColor(d["Feeding tube 6m"]);
                }else{
                    return self.ordinalColor(d["Aspiration rate(Y/N)"]);
                }
            }
            // return "black"
        }else if(predictionToShow == 'overall_survival_5yr_prob' || predictionToShow == 'progression_free_5yr_prob'){
            //legend surv.prob
            let survivalRateText = ["1", "Surv. Rate", "0"];
            legendText(survivalRateText)

            //color the subject by its prediction value 
            // color the neighbours by yes no
            if(self.groupPatients.subject["Dummy ID"] == d["Dummy ID"]){
                //domain 1, 0
                self.colorScale.domain([0,1])    
                return self.colorScale(d[predictionToShow])
            }else{
                self.colorScale.domain([0,1])
                if(predictionToShow == 'overall_survival_5yr_prob'){
                    return self.colorScale(d["Overall Survival (1=alive, 0=dead)"]);
                }else{
                    return self.colorScale(d[predictionToShow]);
                }
            }
        }
        // return self.colorScale(d[predictionToShow])
    }

    /* calculate the path */
    function calculatePath(d) {
        // let test = d3.scaleLinear()
        //             .domain(["Male","Female"])
        //             .range([5,35]);
        // // console.log(test(35))
        // // console.log(test(55))
        // console.log(test())
        // console.log(d)
        // console.log(App.kiviatAttributes)
        let pathCoord = [];
        for (let attributeInd in App.kiviatAttributes) {
            
            let attribute = App.kiviatAttributes[attributeInd];
            // console.log(d[attribute])
            // console.log(attribute)
            // console.log(isNaN (self.axes[attribute].domain[0]))
            // console.log(self.attributeScales[attribute])
            // console.log(attribute, d[self.axes[attribute]["name"]]);
            let xPoint;
            //using ordinal scale for categorical values and linear scale for numbers
            if(isNaN(self.axes[attribute].domain[0])){
                // console.log(self.axes[attribute].name, self.axes[attribute].range)
                self.attributeScales[attribute]
                    .domain(self.axes[attribute].domain)
                    .range(self.axes[attribute].range);

                // console.log(d[self.axes[attribute].name])
                // console.log(attribute)
                // console.log(d[attribute])
                // console.log(self.attributeScales[attribute](d[self.axes[attribute].name]))
                xPoint = self.attributeScales[attribute](d[self.axes[attribute].name]);                
            }else{
                let linearAttributeScale = d3.scaleLinear()
                            .domain(self.axes[attribute].domain)
                            .range([5,35]);
                xPoint = linearAttributeScale(d[attribute]);
                // console.log(attribute)
                // console.log(d[attribute])
               
            }


            // self.attributeScales[attribute]
            //         .domain(self.axes[attribute].domain);
            // // console.log(self.attributeScales[attribute](d[attribute]))
            // let xPoint = self.attributeScales[attribute](d[attribute]);
            // console.log(linearAttributeScale());


            let endpoint = rotatePointOntoAxis(xPoint, attributeInd);
            // console.log(attribute, endpoint)
            // console.log(attribute, xPoint)

            pathCoord.push(endpoint.x + " " + endpoint.y);
            // console.log(pathCoord)
        }

        return "M " + pathCoord.join(" L ") + " Z";
    }

    /* get the coordinates of the point on each axis */
    function rotatePointOntoAxis(pointX, axisIndex) {
        let angle = Math.PI * 2 * axisIndex / App.kiviatAttributes.length;
        // console.log(angle)
        return rotatePoint(pointX, angle);
    }

    function rotatePoint(pointX, angle) {
        return {
            x: Math.cos(angle) * (pointX),
            y: Math.sin(angle) * (pointX)
        };
    }

    /* get the updated attribute domians */
    function updateAttributeDomains(newDomains) {
        // { name: domain, ... }
        for (let attribute of App.kiviatAttributes) {
            let attributeDomainLength = newDomains[attribute].length;

            console.log(newDomains)
            self.attributeScales[attribute]
                .domain(newDomains[attribute])
                .range(
                    d3.range(0, attributeDomainLength)
                    .map((d) => ((d / (attributeDomainLength - 1)) * 27 + 8))
                );
        }
    }

    init();

    return {
        update,
        updateAttributeDomains,
        updateColor
    };

}
