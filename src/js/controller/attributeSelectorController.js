"use strict"

var App = App || {};

let AttributeSelectorControllerUpdated = function() {

    let self = {
        attributeDropDown: null,
        currentAttribute: App.mosaicAttributeOrder[0],
        axesData : App.models.axesModel.getAxesData(), //from nomogram data
        parent : null // keeping the value of the parents
    };
 /*
    <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        Dropdown
        <span class="caret"></span>
    </button>
    <ul class="dropdown-menu multi-level" role="menu" aria-labelledby="dropdownMenu">
        <li class="dropdown-submenu">
            <a  class="dropdown-item" tabindex="-1" href="#">Hover me for more options</a>
            <ul class="dropdown-menu">
                <li class="dropdown-item"><a tabindex="-1" href="#">Second level</a></li>
                <li class="dropdown-item"><a href="#">Second level</a></li>
                <li class="dropdown-item"><a href="#">Second level</a></li>
            </ul>
        </li>
    </ul>
 */

    /* display the attribute kaplan meier drop down list */
    function populateAttributeDropDown() {
        // console.log(self.axesData)
        self.attributeDropDown.append("button")
            .attr("class", "btn btn-default dropdown-toggle")
            .attr("type", "button")
            .attr("id", "dropdownMenu1")
            .attr("data-toggle", "dropdown")
            .attr("aria-haspopup", "true")
            .attr("aria-expanded" ,"false")
            .style("width", "100%")
            .text(self.currentAttribute)
            .append("span")
            .attr("class", "caret")
        // for(let i = 0; i < App.mosaicAttributeOrder.length; i++){
        self.attributeDropDown.append("ul")
                .attr("class", "dropdown-menu multi-level")
                .attr("role", "menu")
                .attr("aria-labelledby", "dropdownMenu")
                .selectAll("li")
                .data(App.mosaicAttributeOrder)
                .enter()
                .append("li")
                .attr("class", "dropdown-submenu")
                .append("a")
                .attr("class", "dropdown-item")
                .attr("tabindex", "-1")
                .attr("href", "#")
                .text(function(d){
                    // console.log(d)
                    return d
                })
                .each(addSubmenues)

        // }
        updateSelectedAttribute(self.currentAttribute);
    }
    
    function addSubmenues(d, i){        
        // console.log(d3.select(this).node())
        // console.log(d, i)
        // console.log(self.axesData[d].domain)
        let element = d3.select(this.parentNode).append("ui")
                                                .attr("class", "dropdown-menu")

        
        //adding select all to the list
        let temp = ["Select All"]
        let data = temp.concat(self.axesData[d].domain)
        let parentName = self.axesData[d].name;
        // console.log(parentName)
        // console.log(data)
        element.selectAll("li")
               .data(data)
               .enter()
               .append("li")
               .attr("class", "dropdown-item")
               .append("a")
               .attr("href", "#")
               .text(function(d){
                   if(d != "N/A"){
                       return d;
                   }
                //    return d;
                //    console.log(self.axesData[d].domain)
               })
               .on("click", function(d){
                //    console.log(d)
                // select all means show all the values i.e. female male
                if(d == "Select All"){
                    // console.log(d3.select(this.parentNode).node())
                    if(self.parent == parentName){ 
                        //meaning we selected one attribute from this cohort
                        //therefore we do not need to recreate the kaplan meier
                        //only removing the highlight will do so
                        // console.log("select all", "self == parent", self.parent, parentName)
                        App.views.kaplanMeier.noHighlight();
                        htmlTextChange(parentName);
                    }else{
                        //meaning we selected one attribute from another cohort
                        //therefore we need to create the kaplan meier 
                        //and then make it the parent in self.parent
                        self.parent = parentName;
                        updateSelectedAttribute(parentName);
                        htmlTextChange(parentName);       
                        // console.log("select all", "self != parent", self.parent, parentName)
                    }
                }else{  
                    //else show kaplan of the selected attributes only
                    // console.log(self.parent, parentName)
                    if(self.parent == parentName){
                        //meaning we already selected this parent cohort
                        //therefore we only need to highlight the selected attribute
                        // console.log("attribute", "self == parent", self.parent, parentName)                        
                        App.views.kaplanMeier.highlight(d);
                        htmlTextChange(d);

                    }else{
                        //meaning we selected another parent cohort
                        //therefore we need to create this kaplan 
                        // and then highlight the selected attribute
                        // console.log("attribute" , "self != parent", self.parent, parentName)
                        self.parent = parentName;
                        updateSelectedAttribute(parentName);
                        htmlTextChange(d);
                        App.views.kaplanMeier.highlight(d);
                    }
                }
               });

    }

    function htmlTextChange(text){
        d3.select("#dropdownMenu1").text(text)
                                .append("span")
                                .attr("class", "caret");

    }

    /* attach the event listener to the kaplan meier patient drop down list */
    function attachToSelect(element) {
        self.attributeDropDown = d3.select(element).append("div")
                                                   .attr("class", "dropdown")
                                                   .attr("width", "max-content")
            .on("change", function() {
                let selectedAttribute = d3.select(this).node().value;
                // console.log(selectedAttribute)
                self.currentAttribute = selectedAttribute;
                updateSelectedAttribute(selectedAttribute);
            });

        populateAttributeDropDown();
    }

    /* if the selected attribute exists in the attribute list, stays with it,
       if not, rest to the first attribute in the list */
    function updateAttributeDropDown() {
		
        let stateSelectedAttribute = App.models.applicationState.getSelectedAttribute();
        // console.log(stateSelectedAttribute)

        if (stateSelectedAttribute) {
            self.attributeDropDown.node().value = stateSelectedAttribute;
            if (self.currentAttribute !== stateSelectedAttribute) {
                self.currentAttribute = stateSelectedAttribute;
            }
        } else {
            self.attributeDropDown.node().selectedIndex = "0";
            self.currentAttribute = App.patientKnnAttributes[0];
        }

        updateSelectedAttribute(self.currentAttribute);
    }

    /* get the selected attribute and update views */
    function updateSelectedAttribute(selectedAttribute) {
        // console.log(selectedAttribute)
        // update the application state
        App.models.applicationState.setSelectedAttribute(selectedAttribute);

        // update the kaplan-meier patient model to recalculate the output
        App.models.kaplanMeierPatient.updateSelectedAttribute(selectedAttribute);

        // update views
        App.views.nomogram.updateAttributeColor(selectedAttribute);

        // get the updated kaplan-meier patients
        let maxOS = App.models.kaplanMeierPatient.getMaxOS();
        App.views.kaplanMeier.setMaxOS(maxOS);
        let updatedKaplanMeierData = App.models.kaplanMeierPatient.getKaplanMeierPatients();      
        App.views.kaplanMeier.update(updatedKaplanMeierData);
    }

    /* disable the attributes that are currently applied in the application */
    function disableFilteredAttributes() {/*
        let filters = App.models.applicationState.getAttributeFilters();

        self.attributeDropDown
            .selectAll("option")
            .attr("disabled", (d) => filters[d]);

        // check if the selected attibute is disabled
        let attributeIntersection = _.indexOf(Object.keys(filters), self.currentAttribute);

        // if it is, then find the first enabled attribute and set it to the new current attribute
        if (attributeIntersection != -1) {

            let attributeEnabled = _.difference(App.patientKnnAttributes, Object.keys(filters));

            // get the first enable attribute
            self.currentAttribute = attributeEnabled[0];
            self.attributeDropDown.node().value = self.currentAttribute;
            updateSelectedAttribute(self.currentAttribute);
        }

        // console.log("disable")
    */ }


    /* return the pubilicly accessible functions */
    return {
        attachToSelect,
        updateAttributeDropDown,
        disableFilteredAttributes
    };
}
