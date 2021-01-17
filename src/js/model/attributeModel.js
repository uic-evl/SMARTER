"use strict"

var App = App || {};

let AttributeModel = function() {

    let self  = {
        attributeData: {},
        meanAttributeData:{},
        count : 0 
    };

    let _constants = {
        attributeFile: "data/attributes.json",
    };

    

    function loadAttributeData () {
        return new Promise( (resolve, reject) => {
            let dataLoadQueue = d3.queue();

            dataLoadQueue
                .defer(d3.json, _constants.attributeFile)
                .await(loadFiles);

            function loadFiles(error, attributeFile) {
                if (error) {
                    reject(error);
                }
                
                // console.log(Object.keys(attributeFile["OS"]).length)
                for(let file in attributeFile){
                    // console.log(Object.keys(attributeFile[file]))
                    if(!(Object.keys(attributeFile[file]).length)){
                        self.meanAttributeData[file] = attributeFile[file];
                    }else{
                        self.attributeData[file] = attributeFile[file];
                    }
                }

                // self.attributeData = attributeFile;
                // console.log(self.attributeData)
                // console.log(self.meanAttributeData)

                resolve();
            }
        })
    }

    let statisticsOfAllPatients = function(){

        if(self.count == 0){ //count is used to keep this method run only once
            let patients = App.models.patients.getPatients();
        // console.log(patients)

        let total = App.models.patients.getTotalPatients();
        // console.log(total)

        // let smokeSum = 0;
        for(let patient in patients){
            // console.log(patients[patient]["SmokeStatusPacksYear"])
            for(let attribute in self.attributeData){
                // console.log(attribute)
                // console.log(Object.keys(self.attributeData[attribute]))
                let keys = Object.keys(self.attributeData[attribute]);
                // console.log(keys)
                for(let count of keys){
                    // console.log(count)
                    if(patients[patient][attribute] == count){
                        self.attributeData[attribute][count] += 1;
                    }
                }
                
            }
            for (let meanAttribute in self.meanAttributeData){
                //condition used to save us from N/A values 
                if(typeof patients[patient][meanAttribute] == "number" && !isNaN(patients[patient][meanAttribute]) ){
                    // smokeSum = smokeSum + patients[patient]["SmokeStatusPacksYear"];
                    // console.log(!isNaN(patients[patient]["SmokeStatusPacksYear"]))
                    self.meanAttributeData[meanAttribute] += patients[patient][meanAttribute]
                }

            }
        }

        for(let meanAttribute in self.meanAttributeData){
            self.meanAttributeData[meanAttribute] = (self.meanAttributeData[meanAttribute] / total).toFixed(5);
        }

        self.count = 1;
            
        }

        // console.log(self.attributeData)
        // console.log(self.meanAttributeData)

    }

    let getAttributeData = function() {
        return self.attributeData;
    };

    let getMeanAttributeData = function(){
        return self.meanAttributeData;
    }

    return {
        loadAttributeData,
        getAttributeData,
        statisticsOfAllPatients,
        getMeanAttributeData
    }
}
