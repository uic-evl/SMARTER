"use strict"

var App = App || {};

let KaplanMeierView = function(targetID) {

    let self = {
        targetElement: null,
        targetSvg: null,
        maxOS: null,
        features: App.mosaicAttributeOrder,
        tipBox: null,
        tipLine: null,
        xScale: null,
    };

    init();

    function init() {
        self.targetElement = d3.select(targetID);
        // console.log(self.targetElement.node())
        // console.log(window.innerHeight)
        // console.log(document.getElementById("buttonBottom").clientHeight)
        // console.log(document.getElementById("title").clientHeight)

        // let bottomPartHeight = document.getElementById("buttonBottom").clientHeight ; 
        let navigationBarHeight = document.getElementById("title").clientHeight ;
        let kaplanHeight = (window.innerHeight / 2) - (2 * navigationBarHeight);
        let kaplanWidth = self.targetElement.node().clientWidth;

        self.targetSvg = self.targetElement.append("svg")
            .attr("width", kaplanWidth)
            .attr("height", kaplanHeight)
            .attr("viewBox", "0 0 140 100") // + kaplanHeight / 4 + " " + kaplanHeight / 4)
            .style("margin-left", "30px")
            .attr("preserveAspectRatio", "xMidYMin");

        self.tipBox = self.targetElement.append('div')
                        .attr('id', 'tooltip_kaplan')
                        .style('opacity', 0);

        drawXAxis();
        drawYAxis();
        drawXAxisLabels();
        
    }

    function drawXAxis() {
        self.targetSvg.append("line")
            .attr("x1", 10)
            .attr("y1", 90)
            .attr("x2", 110)
            .attr("y2", 90)
            .style("opacity", 0.5)
            .style("stroke", "black")
            .style("stroke-width", "0.6px");
    }

    function drawYAxis() {
        self.targetSvg.append("line")
            .attr("x1", 10)
            .attr("y1", 10)
            .attr("x2", 10)
            .attr("y2", 90)
            .style("opacity", 0.5)
            .style("stroke", "black")
            .style("stroke-width", "0.6px");

        self.targetSvg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -35)
            .attr("y", 15)
            // .style("stroke-width", "0.6px")
            .style("font-size", "6px")
            .attr("text-anchor", "end")
            .text("Survival Probability")
            .style("opacity", 0.7);;
    }

    function drawXAxisLabels() {
        for (let i = 0; i <= 10; i++) {
            self.targetSvg.append("text")
                .attr("x", 2)
                .attr("y", 91 - 8 * i)
                .style("font-size", "4px")
                .text((0.1 * i).toFixed(1))
                .style("opacity", 0.7);
        }
        self.targetSvg.append("text")
            .attr("class", "x axis-label")
            .attr("x", 50)
            .attr("y", 100)
            .style("font-size", "6px")
            // .attr("font-weight", "bold")
            .attr("text-anchor", "middle")
            .text("Duration (in months) ")
            .style("opacity", 0.7);
    }

    function drawLegend(attrVal, attrValNum, color) {
        let value = attrVal.replace(/[^a-zA-Z0-9]/g, '');
        if(value != "NA"){

            self.targetSvg.append("rect")
                .attr("class", "legend")
                .attr("x", 80)
                .attr("y", attrValNum * 5)
                .attr("width", 5)
                .attr("height", 5)
                .style("fill", color)
                .style("opacity", opaque(value))
                // .style("cursor", "context-menu")
                /*
                .on("click", function(d){
                    // console.log(color);
                    // console.log("I am clicked");
                    highlight(attrVal)
                });
                */
                .on("mouseover", function(d){
                    // console.log("mouse overed")
                    // console.log(attrVal)
                    highlight(attrVal);
                })
                .on("mouseleave", function(d,i){
                    // console.log("mouse leave")
                    noHighlight();
                });
            

            self.targetSvg.append("text")
                .attr("class", "legend")
                .attr("x", 85)
                .attr("y", 4 + attrValNum * 5)
                .style("font-size", "0.3em")
                .style("cursor", "default")
                // .style("cursor", "context-menu")
                .text(attrVal)
                /*
                .on("click", function(d){
                    highlight(attrVal)
                });
                */
                .on("mouseover", function(d){
                    highlight(attrVal);
                })
                .on("mouseleave", function(d,i){
                    noHighlight();
                });

            }      
        // d3.select("#reset_kaplan").on("click", function(d){
        //     noHighlight();
        // });
    }

    // What to do when one group is hovered
    function highlight(d){
        // console.log("highlight", d)
        //both rect and path are named as kmVar Class
        //remove the special characters if have any 
        let value = d.replace(/[^a-zA-Z0-9]/g, '');

        // reduce opacity of all groups
        d3.select("#kaplanMeier").select("svg").selectAll(".kmVar").style("opacity", .05)
        // except the one that is hovered
        d3.select("#kaplanMeier").select("svg").selectAll("."+value).style("opacity", opaque(value))
    }

    // And when it is not hovered anymore
    function noHighlight(){
        //there is two cases 
        // one one particular cohort is selected
         // one all of them are selected

         //for all of them
        let dropdown = $('#dropdownMenu1').text()
        if(self.features.includes(dropdown)){ 
            d3.select("#kaplanMeier").select("svg").selectAll(".kmVar").style("opacity", function(){
                let value = $(this).attr('id');
                return opaque(value);
            });
        }else{
            let value = dropdown.replace(/[^a-zA-Z0-9]/g, '');
            // reduce opacity of all groups
            d3.select("#kaplanMeier").select("svg").selectAll(".kmVar").style("opacity", .05)
            // except the one that is hovered
            d3.select("#kaplanMeier").select("svg").selectAll("."+value).style("opacity", opaque(value))
        }
        // console.log(d3.select("#kaplanMeier").select("svg").selectAll(".kmVar").id)
        // console.log($('#dropdownMenu1').text())
        
        // d3.select("#kaplanMeier").select("svg").select(".kmPlots").style("opacity", 0.5)
    }


    /* update the kaplan-meier plot based on the selected attribute*/
    function update(KMData) {
        // console.log("KMDATA" , KMData)
        d3.selectAll(".kmVar").remove();
        // d3.selectAll(".kmPlots").remove();
        d3.selectAll(".legend").remove();
        d3.selectAll(".yAxisLabels").remove();
        d3.selectAll("#tip-line").remove();

        let x = d3.scaleLinear()
            .domain([0, self.maxOS])
            .range([10, 110]);

        self.xScale = x;

        let y = d3.scaleLinear()
            .domain([0, 1])
            .range([90, 10]);

        // draw kaplan-meier plots
        let attrValNum = 0;
        for (let attrKey of Object.keys(KMData)) {
            // console.log(attrKey)
            // console.log(KMData[attrKey])
            if (KMData[attrKey].length > 0) {  // have patients in the group
                drawKMPlot(KMData[attrKey], x, y, App.attributeColors(attrKey), attrKey);
                drawLegend(attrKey, attrValNum, App.attributeColors(attrKey));
                attrValNum++;
            }
        }

        // draw y-axis labels
        let interval = Math.round(self.maxOS / 100) * 10;

        for (let i = 0; i < self.maxOS; i += interval) {
            self.targetSvg.append("text")
                .attr("class", "yAxisLabels")
                .attr("x", x(i))
                .attr("y", 95)
                .style("font-size", "4px")
                .style("text-anchor", "middle")
                .style("opacity", 0.7)
                .text(i);
        }
        
        //creating the tooltip
        //thi will create the tipline 
        self.tipLine = self.targetSvg.append('line')
                            .attr('id', 'tip-line')

        //hovering will create tipline and tooltip
        self.targetSvg.on('mousemove', function(){
            drawTooltip(KMData)
        })
                    .on('mouseout', removeTooltip)

    }

    function drawTooltip(KMData){
        // console.log("draw tool tip")
        // console.log(self.xScale)
        // console.log(xScale)
        // console.log(d3.mouse(self.targetSvg.node()))
        // console.log(d3.mouse(self.tipBox.node()))
        // console.log(Math.floor((self.xScale.invert(d3.mouse(self.tipBox.node())[0]) + 5) / 10) * 10)
        // console.log(Math.floor((self.xScale.invert(d3.mouse(self.targetSvg.node())[0]) + 5) / 10) * 10)
        // let value = Math.floor((self.xScale.invert(d3.mouse(self.tipBox.node())[0]) + 5) / 10) * 10;
        let value = Math.floor((self.xScale.invert(d3.mouse(self.targetSvg.node())[0]) + 5) / 10) * 10
        // console.log(KMData)
        // console.log(result)

        if(value >= 0 && value <= 150){
            let result = App.models.kaplanMeierPatient.getProbValue(value, KMData);
            let result_key = Object.keys(result);
            self.tipLine.attr('stroke','black')
                    .attr('x1', self.xScale(value))
                    .attr('x2', self.xScale(value))
                    .attr('y1', 5)
                    .attr('y2', 90)
            // console.log(event.clientX)
            // (d3.select(this).attr("cx") + 20) + 'px')
            // console.log(d3.select(this).clientHeight)
            self.tipBox.transition()
                        .duration(200)
                        .style('opacity', 0.9);
            self.tipBox.html(function(){
                let text = 'OS: ' + value + ' - ' + (value + 9) + '<br>' 
                for(let key of result_key){
                    let number;
                    // console.log(result[key])
                    if(result[key] != 'N/A'){
                        number = Math.round(result[key] * 100) / 100;
                        text += key + ' : ' + number + '<br>'
                    }
                    
                }
                return text

            })
                .style('left', (d3.event.pageX) + "px")
                .style('top', (d3.event.pageY - 28) + "px")
        }else{
            self.tipLine.attr('stroke', 'none')
            self.tipBox.transition()
                        .duration(500)
                        .style('opacity', 0);
        }

    }

    function removeTooltip(){
        // console.log("remove tool tip")
        if(self.tipLine){
            self.tipLine.attr('stroke', 'none')
        }
        if(self.tipBox){
            self.tipBox.transition()
                        .duration(500)
                        .style('opacity', 0);
        }
    }


    /* draw the kaplan-meier plot */
    function drawKMPlot(data, xScale, yScale, color, attrVal) {
        // console.log("drawKMplot")

        // remove the special symbols
        let value = attrVal.replace(/[^a-zA-Z0-9]/g, '');
        // console.log(attrVal.replace(/[^a-zA-Z ]/g, ""));
        // console.log(value)
        // console.log(attrVal)
        if(value != "NA"){
            // 1.96 is the approximation for the 97.5 percentile for a normal distribution
            //  => 95% of the area lies between -1.96 and 1.96
            let areaPercent95 = 1.96;

            // draw rect for showing variances
            for (let j = 0; j < data.length - 1; j++) {
                let x1 = xScale(data[j].OS);
                let x2 = xScale(data[j + 1].OS);
                let y1 = yScale(Math.max(0, data[j].prob - areaPercent95 * Math.sqrt(data[j].var)));
                let y2 = yScale(Math.min(1, data[j].prob + areaPercent95 * Math.sqrt(data[j].var)));

                
                self.targetSvg.append("rect")
                    .attr("class", "kmVar " + value)
                    .attr("id", value)
                    .attr("x", x1)
                    .attr("y", y2)
                    .attr("width", x2 - x1)
                    .attr("height", y1 - y2)
                    .style("stroke", "none")
                    .style("fill", color)
                    .style("opacity", opaque(value))
                    .on("mouseover", function(d){
                        highlight(value);
                    })
                    .on("mouseleave", function(d,i){
                        noHighlight(value);
                    });
                    
            }

            // draw line
            let lineData = [{
                x: xScale(data[0].OS),
                y: yScale(1)
            }, {
                x: xScale(data[0].OS),
                y: yScale(data[0].prob)
            }];

            for (let i = 1; i < data.length; i++) {
                lineData.push({
                    x: xScale(data[i].OS),
                    y: yScale(data[i - 1].prob)
                });
                lineData.push({
                    x: xScale(data[i].OS),
                    y: yScale(data[i].prob)
                });
            }

            let lineFunc = d3.line()
                .x(function(d) {
                    return d.x;
                })
                .y(function(d) {
                    return d.y;
                });

            self.targetSvg.append("path")
                    .attr("class", "kmVar " + value)
                    .attr("id", value)
                    .attr("d", lineFunc(lineData))
                    .style("stroke", color)
                    .style("stroke-width", "0.8px")
                    .style("opacity", opaque(value))
                    .style("fill", "none")
                    .on("mouseover", function(d){
                        highlight(value);
                        // console.log("over")
                    })
                    .on("mouseleave", function(d,i){
                        noHighlight(value);
                        // console.log("out")
                    });
            
            // self.targetSvg.appedn("line")
        }
    }

    //  opacity 
    function opaque(value){
        // console.log(value)
        //we want to make the selected patient cohort's color more opaque
        //let's get the selected patient ID and information
        //get the Dummy ID from the drop down
        let patientID = App.controllers.patientSelector.getCurrentPatient();
        // console.log(patientID)
        // get the index of the dummy ID
        let indexID = 0;
        if(patientID == null || patientID == 0){ //as we don't have null and 0 indexed patient
            indexID = 2;            
        }else{
            indexID = App.models.patients.getPatientIDFromDummyID(patientID);
        }
        // console.log(indexID)
        //get that patient's information
        let patientInfo = App.models.patients.getPatientByID(indexID);
        // console.log(patientInfo)
        // get the selected attribute from kaplan dropdown
        let selectedAttribute = App.models.kaplanMeierPatient.getSelectedAttribute();
        // console.log(selectedAttribute)
        // console.log(patientInfo[selectedAttribute])
        // get the cohort of the selected patients
        let patient_attribute = patientInfo[selectedAttribute];

        //if we have null values
        if(patient_attribute == null){
            return 0.4
        }else{
            let opaqued_attribute = patient_attribute.replace(/[^a-zA-Z0-9]/g, '');
            // console.log(opaqued_attribute)
    
            // selected patient's cohort will be 0.8
            // other will be 0.4
            if(value == opaqued_attribute){
                // console.log("equal")
                return 0.8
            }else{
                // console.log("not equal")
                return 0.4
            }

        }

    }

    /* set the maximum value on X-axis */
    function setMaxOS(os) {
        self.maxOS = os;
    }


    return {
        update,
        setMaxOS,
        highlight,
        noHighlight
    };
}
