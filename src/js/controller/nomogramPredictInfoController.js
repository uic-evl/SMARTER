"use strict";

let nomogramPredictionInfoController = function(listID) {
    let self = {
    };

    function subjectPredictions(id) {
        // console.log(id)
        // d3.select("#subjectPrediction").remove();
        d3.select("#subjectPrediction").html("");
        d3.select("#subjectPrediction")/*.append("div")
            .attr("class", "col-md-4")
            .attr("id", "subjectPrediction")*/
            .style("top", "2px")
            .style("font-size","10px")
            // .style("right", "17px")
            .html(function(){
                let feed = +id["feeding_tube_prob"] * 100;
                let asp = +id["aspiration_prob"] * 100;
                let prog = +id["progression_free_5yr_prob"] * 100;
                let os = +id["overall_survival_5yr_prob"] * 100;
                let text = /*"<strong>ID: " + id["Dummy ID"] + "</strong><br>" +*/
                "&nbsp; <b>OS:</b> " + os.toFixed(2)  + " %" + "&nbsp;&nbsp;&nbsp;&nbsp; <b>FDT:</b> " + feed.toFixed(2) + " %<br>" +
                "<b>RMS:</b> " + prog.toFixed(2) + " %" + "&nbsp;&nbsp;&nbsp;&nbsp; <b>ASP:</b> " + asp.toFixed(2) + " %"
                return text;
            })

    
    }

    return{
        subjectPredictions
    }

};
