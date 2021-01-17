"use strict"

var App = App || {};

let PreditictionAttributeModal = function(){
    let self = {
        attributeList : ["Therapeutic combination", "Gender","Age at Diagnosis (Calculated)",
         "HPV/P16 status", "T-category", "N-category", 
         "Smoking status at Diagnosis (Never/Former/Current)", "Race", 
         "Smoking status (Packs/Year)", 
         "Tumor subsite (BOT/Tonsil/Soft Palate/Pharyngeal wall/GPS/NOS)", 
         "Total dose"],
         options: ["Overall Survival (5 year)", "Progression (5 Year)"],
         values: ["OS", "PRG"]
    }

      //default
    function attribute_List(){
        // $("#featureModelsBody").empty();
        d3.select("#featureModelSelect")
            .on("change", function(){
                console.log( $("#featureModelSelect").val())
                let value = $("#featureModelSelect").val()
                if(value == "OS"){
                    d3.select("#predictionImage")
                        .attr("src", "imgs/CoxForest_OS_default.png")
                }else if(value == "PRG"){
                    d3.select("#predictionImage")
                        .attr("src", "imgs/CoxForest_PFS_default.png")
                }
            }) 
            .selectAll("option")
            .data(self.options)
            .enter().append('option')
            .attr("value", function(d,i){
                return self.values[i];
            })
            .text(function(d){
                return d;
            });           
        
        d3.select("#featurePicture").append("img")
            .attr("src", "imgs/CoxForest_OS_default.png")
            .attr("id", "predictionImage")
            .style("width", "100%")
            .style("display", "block")
            .style("margin-left", "auto")

    }

    //when server is called
    function attribute_List_Server(){
        $("#featureModelSelect").empty();
        d3.select("#featureModelSelect")
            .on("change", function(){
                console.log( $("#featureModelSelect").val())
                let value = $("#featureModelSelect").val()
                if(value == "OS"){
                    axios({url: 'http://131.193.78.149:8080/picture',
                        method: 'post',
                        responseType: 'arraybuffer',
                        headers: {'cache-control': "public, max-age=0"},
                        data: {name: "OS"}
                            })
                            .then(function (response) {
                                // console.log(response)
                                let blob = new Blob(
                                    [response.data], 
                                    {type: response.headers['content-type']}
                                )
                                let imgUrl = URL.createObjectURL(blob)
                                // console.log(imgUrl)
                                d3.select("#predictionImage")
                                    .attr("src", imgUrl)

                            })
                            .catch(function (error) {
                                console.log(error);
                            });
                }else if(value == "PRG"){
                    axios({url: 'http://131.193.78.149:8080/picture',
                        method: 'post',
                        responseType: 'arraybuffer',
                        headers: {'cache-control': "public, max-age=0"},
                        data: {name: "PRG"}
                            })
                            .then(function (response) {
                                // console.log(response)
                                let blob = new Blob(
                                    [response.data], 
                                    {type: response.headers['content-type']}
                                )
                                let imgUrl = URL.createObjectURL(blob)
                                // console.log(imgUrl)
                                d3.select("#predictionImage")
                                    .attr("src", imgUrl)

                            })
                            .catch(function (error) {
                                console.log(error);
                            });
                }
            }) 
            .selectAll("option")
            .data(self.options)
            .enter().append('option')
            .attr("value", function(d,i){
                return self.values[i];
            })
            .text(function(d){
                return d;
            });   
            
            
        axios({url: 'http://131.193.78.149:8080/picture',
             method: 'post',
             responseType: 'arraybuffer',
             headers: {'cache-control': "public, max-age=0"},
             data: {name: "OS"}
                })
                .then(function (response) {
                    // console.log(response)
                    let blob = new Blob(
                        [response.data], 
                        {type: response.headers['content-type']}
                    )
                    let imgUrl = URL.createObjectURL(blob)
                    // console.log(imgUrl)
                    d3.select("#predictionImage")
                        .attr("src", imgUrl)

                })
                .catch(function (error) {
                    console.log(error);
                });

    }

    return{
        attribute_List,
        attribute_List_Server
    }

};