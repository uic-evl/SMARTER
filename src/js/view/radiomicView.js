"use strict"

var App = App || {};

let RadiomicView = function(){
    let self = {
        options : ["Cluster 1", "Cluster 2", "Cluster 3"],
        id : ["cluster1", "cluster2", "cluster3"],
        clusters:{},
        legendTip:null
    }

    function addLymphNode(){
        d3.select("#withLymphnode").append("div")
            // .append("h5")
            .style("text-align", "center")
            .text("With Lymph Nodes")
            .style("font-size", "1em")
            .style("font-weight", "bold")
            // .style("padding-left", "30%")
            // .attr("class", "viewTitleDiv")

        let textName = ["Lymph Nodes Clusters"]
        let idName = ["dendrogramlinker"]
        
        let spatialInformation = d3.select("#withLymphnode").append("div")
                                    //  .attr("preserveAspectRatio", "xMidYMid")
                                     .style("padding-left", "4%")
        for(let i = 0 ; i < textName.length ; i ++ ){
            spatialInformation.append("a")
                .attr("href", "Lymphnode.html")
                .attr("target", "_blank")
                .attr("id", idName[i])
                .append("button")
                .attr("class", "btn btn-default")
                .style("width", "90%")
                .style("white-space", "normal")
                .attr('id', idName[i] + '-class')
                .style("font-size", ".85em")
                .style("padding", 0)
                .style("margin", 0)
                .style("color", "#337ab7")
                // .style("display", "block")
                // .style("margin-bottom", "5px")
                .text(textName[i])      
        }
    }
    
    function drawRadiomic(){  
        // create svg element
        d3.select("#bigRadiomicSvg").remove();
        let marginRight = 25;

        let width = document.getElementById("radiomics").clientWidth - marginRight;
        let navigationBarHeight = document.getElementById("title").clientHeight ;
        let height = (window.innerHeight / 2) - (1.15 * navigationBarHeight);
        // console.log(height)
        let bigSvg = d3.select("#radiomics")
            .append("svg")
            .attr("id", "bigRadiomicSvg")
            .attr("width", width + marginRight)
            .attr("height", height)
            .style("position", "fixed")

        let name = ["OS","RMS", "FDT", "ASP" ]
        // let full_name = [ "overall","progression",  "feeding tube", "aspiration"]
        // let cluster1Color = d3.scaleLinear()
        //     .interpolate(d3.interpolateHcl)
        //     .domain([0,1])
        //     .range(["#e5f5f9", "#70a4c2"]); 

        // let cluster2Color = d3.scaleLinear()
        //     .interpolate(d3.interpolateHcl)
        //     .domain([0,1])
        //     .range(["#ece7f2", "#2b8cbe"]); 

        // let cluster3Color = d3.scaleLinear()
        //     .interpolate(d3.interpolateHcl)
        //     .domain([0,1])
        //     .range(["#fff7bc", "#d95f0e"]); 

         // Create the scale
         let x = d3.scaleLinear()
         .domain([0, 1])         // This is what is written on the Axis: from 0 to 100
         .range([35, width - marginRight]);       // This is where the axis is placed: from 100px to 800px

        let axisScale = d3.scaleLinear()
        .domain([0, 100])
        .range([35, width - marginRight])

        let yPosition = d3.scaleLinear()
            .domain([0,3])
            .range([60, height - 30])

        let xAxis = d3
            .axisBottom()
            .scale(axisScale)
            .tickValues([0, 25, 50, 75, 100])
            // .ticks(4, "%")
            .tickFormat(function(d) { return (d+"%"); });

        for(let i=0; i < name.length; i++){
            let svg = bigSvg.append("svg").attr("width", width)
            svg.append("g").append("text")
                .attr("x", 0)
                .attr("y", function(){
                    // console.log(yPosition(0), yPosition(1), yPosition(2), yPosition(3))
                    return yPosition(i) + 10
                })
                .style("font-size", ".85em")
                .text(name[i])           

            // Draw the axis
            svg
            .append("g")
            .attr("transform", "translate(0," + (yPosition(i)) +")")  
            .call(xAxis)
            .selectAll('text')
            .style("font-size", "1.05em");  

            for(let j = 0; j < self.clusters["OS"].length ; j++){
                let tip = d3.tip().attr('class', 'd3-tip')
                .html(function() { 
                    let value = self.clusters[name[i]][j] * 100
                    let text = "Cluster " + (j+1) + " : " + value.toFixed(3) + "%"; 
                    return text;
                })
                svg.call(tip)
                            
                // Add dots
                svg.append('g')
                .append("circle")
                .attr("class", "radiomic "+self.id[j])
                .attr("id", self.id[j])
                .attr("cx", function(){
                        return x(self.clusters[name[i]][j])
                    })
                .attr("cy", (function(){
                    return yPosition(i)
                }) )
                .attr("r", 5)
                .style("fill", function(){
                    if(j == 0){
                        // return cluster1Color(self.clusters[name[i]][j])
                        return "#66c2a5"
                    }else if(j == 1){
                        // return cluster2Color(self.clusters[name[i]][j])
                        return "#fc8d62";
                    }else if(j == 2){
                        // return cluster3Color(self.clusters[name[i]][j])
                        return "#8da0cb"
                    }
                })
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide)

                }
         }
    }

    function drawRadiomicLegend(){
        d3.select("#radiomicLegendSvg").remove();
        let width = document.getElementById("subjectPrediction").offsetWidth;
        let navigationBarHeight = document.getElementById("title").clientHeight ;
        let height = ((window.innerHeight / 2) - (2 * navigationBarHeight)) / 3.5;
        // console.log(width, height)
         let svg = d3.select("#radiomicLegend")
            .append("svg")
            .attr("id", "radiomicLegendSvg")
            .attr("width", width)
            .attr("height", height)
        for(let j = 0; j < self.clusters["OS"].length ; j++){
            self.legendTip = d3.tip().attr('class', 'd3-tip')
            .attr("id", "radiomicLegendTip")
            .html(function() { 
                let OS = self.clusters["OS"][j] * 100 ;
                let RMS = self.clusters["RMS"][j] * 100 ;
                let FDT = self.clusters["FDT"][j] * 100 ;
                let ASP = self.clusters["ASP"][j] * 100 ; 
                let text = "OS : " + OS.toFixed(3) + " % <br>" +
                "RMS : " + RMS.toFixed(3) + " % <br>" +
                "FDT : " + FDT.toFixed(3) + " % <br>" +
                "ASP : " + ASP.toFixed(3) + " %"
                return text;
            })
            svg.call(self.legendTip)
                        
            // Add dots
            svg.append('g')
            .append("circle")
            .attr("cx", 15)
            .attr("cy", (10 + 20 * j) )
            .attr("r", 5)
            .style("fill", function(){
                if(j == 0){
                    // return cluster1Color(self.clusters[name[i]][j])
                    return "#66c2a5"
                }else if(j == 1){
                    // return cluster2Color(self.clusters[name[i]][j])
                    return "#fc8d62";
                }else if(j == 2){
                    // return cluster3Color(self.clusters[name[i]][j])
                    return "#8da0cb"
                }
            })
            .on('mouseover', self.legendTip.show) /* function(){
                self.legendTip.show(this)
                highlight(self.id[j])
            })*/
            .on('mouseout',self.legendTip.hide)/* function(){
                self.legendTip.hide(this)
                noHighlight()
            })*/

            svg.append("g").append("text")
            .attr("x", 23)
            .attr("y", (14 + 20 * j))
            .style("font-size", "0.85em")
            .text(self.options[j]) 
            .on('mouseover',self.legendTip.show)/* function(d){
                self.legendTip.show(d, this);
                highlight(self.id[j]);
                // tip.show;
            })*/
            .on('mouseout', self.legendTip.hide) /*function(d){
                self.legendTip.hide(d, this)
                noHighlight();
                // tip.hide;
            })*/

        }

    }


    function highlight(d){
        // console.log(d)
        // self.legendTip.show;

        // // reduce opacity of all groups
        d3.select("#radiomics").select("svg").selectAll(".radiomic").style("opacity", .05)
        // // except the one that is hovered
        d3.select("#radiomics").select("svg").selectAll("."+d).style("opacity", 1)
    }

    // And when it is not hovered anymore
    function noHighlight(){        
        // self.legendTip.hide;
        d3.select("#radiomics").select("svg").selectAll(".radiomic").style("opacity", 1)
    }



    function populateClusterData(data){
        // console.log(data)
        // 0 - feed, 1- asp, 2 - ovr, 3 - prog
        //our chronology will be ovr, prog, feed, asp
        // console.log(data)
        self.clusters.OS = [data[2][0] , data[2][1], data[2][2]];
        self.clusters.RMS = [data[3][0] , data[3][1], data[3][2]];
        self.clusters.FDT = [data[0][0] , data[0][1], data[0][2]];
        self.clusters.ASP = [data[1][0] , data[1][1], data[1][2]];

        // console.log(self.clusters)

        drawRadiomic();
        
        //draw radiomicLegend
        drawRadiomicLegend();

    }

    return{
        addLymphNode,
        drawRadiomic,
        populateClusterData
        
    }

};