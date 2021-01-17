"use strict"

var App = App || {};

let StatisticsModalView = function(){

    init();
    
    function init(){

        $("#statButton").on("click", function(){
            $("#statisticsModalBody").empty();
            // console.log("statistics modal view is executed");
            let attributeData = App.models.attributeModel.getAttributeData();
            let meanAttributeData = App.models.attributeModel.getMeanAttributeData();
            // console.log(attributeData);
            // console.log(meanAttributeData)
            // let test = attributeData["Gender"]["Male"];
            // $("table.statsTable").append(test);

            let table = `<table class = "table table-bordered">
            <thead>
            <tr>
              <th scope="col">Attribute Name</th>
              <th scope="col">Count/Mean</th>
            </tr>
          </thead>
          <tbody>
            `;

            for (let attr in attributeData) {
                table += `<tr>
                    <th colspan = "2">` + attr + `</th>
                </tr>`;

                let keys = Object.keys(attributeData[attr]);

                for(let key of keys){
                    table += `<tr> <td> ` + key +`</td> <td>` + attributeData[attr][key] + `</td></tr>`
                }   
                
            }

            for(let mean in meanAttributeData){
                table +=`<tr><th>` + mean + `</th> <th> ` + meanAttributeData[mean] + ` (mean) </th> </tr>`
            }
            table += `</tbody></table>`
            $("#statisticsModalBody").append(table);
        });
        
        
    }

};
{/* <table class="table table-bordered">
                <thead>
                  <tr>
                    <th scope="col">Attribute Name</th>
                    <th scope="col">Count/Mean</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Mark</td>
                    <td>Otto</td>
                  </tr>
                  <tr>
                    <td>Jacob</td>
                    <td>Thornton</td>
                  </tr>
                  <tr>
                    <td colspan="2">Larry the Bird</td>
                  </tr>
                </tbody>
              </table> */}


