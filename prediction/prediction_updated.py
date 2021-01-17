from flask import Flask,jsonify, request
from flask_cors import CORS, cross_origin
import pandas as pd
from pandas import DataFrame
import rpy2
import rpy2.robjects as robjects
from rpy2.robjects.packages import SignatureTranslatedAnonymousPackage

app = Flask(__name__)
CORS(app)

@app.route("/output", methods=['GET', 'POST'])
@cross_origin()
def output():
    data = request.json
    new_data = data["patient"]
    therap = data["therap"]

    robjects.r('''
        with_therap <- function(value){
            # this is the prediction R code
            ## Toxicities: survival, feeding tube, aspiration
            # Outputs: predicted toxicity probability for each patient, 
            # predicted survival probability for each patient, 
            # weight of each variable in each risk prediction model 
            ## Adds therapy as a predictor

            ## load libraries
            # library(survival)
            # library(tidyverse)
            # library(purrr)


            if(!require("pacman")) install.packages("pacman")
            pacman::p_load(pacman, survival, tidyverse)

            
            ### set file directory
            ## Modify this to correct file location 
            #file.dir <- "D:\\dblab\\research\\opc_validation\\data\\"
            
            ### load data
            #OPC <- read.csv(paste0(file.dir, 
             #                   "Anonymized_644.Updated_cleaned_v1.3.1.csv"))
            

            OPC <- read.csv("../data/newdata.csv")
            #length(unique(OPC$Dummy.ID))

            ###############################
            ##### Clean clinical data #####
            ###############################
            ## remove duplicates
            #take the values to a dataframe
            OPC_final <- OPC[!is.na(OPC$Dummy.ID),]

            # taking the value as a data frame
            result <- as.data.frame(value)
            ##GC: added this mutate because the numeric values were coming in as characters
            result <- mutate(result, OS..Calculated. = as.numeric(OS..Calculated.),
                            Overall.Survival..1.alive..0.dead. = as.numeric(Overall.Survival..1.alive..0.dead.),
                            Regional.control..Time. = as.numeric(Regional.control..Time.),
                            Total.dose = as.numeric(Total.dose),
                            Locoregional.control..Time. = as.numeric(Locoregional.control..Time.),
                            FDM..months. = as.numeric(FDM..months.),
                            Locoregional.Control.1.Control.0.Failure. = as.numeric( Locoregional.Control.1.Control.0.Failure.),
                            Distant.Control..1.no.DM..0.DM. = as.numeric(Distant.Control..1.no.DM..0.DM.),
                            Feeding.tube.6m = as.character(ifelse(is.na(Feeding.tube.6m),"N",Feeding.tube.6m)) )
            ##GC: made the patient to predict censored for OS and PFS                 
            result[is.na(result$OS..Calculated.),"OS..Calculated."] <- 0
            result[is.na(result$Overall.Survival..1.alive..0.dead.),"Overall.Survival..1.alive..0.dead."] <- 1
            # if this is an existing patient, remove it from the existing list
            result[is.na(result$Regional.control..Time.),"Regional.control..Time."]<-0
            result[is.na(result$Locoregional.control..Time.),"Locoregional.control..Time."]<-0
            result[is.na(result$FDM..months.),"FDM..months."]<- 0
            result[is.na(result$Locoregional.Control.1.Control.0.Failure. ),"Locoregional.Control.1.Control.0.Failure."]<-1
            result[is.na(result$Distant.Control..1.no.DM..0.DM.),"Distant.Control..1.no.DM..0.DM."]<- 1
            
            existing_patient <- FALSE
            if (result["Dummy.ID"] %in% OPC_final$Dummy.ID) {
                existing_patient <- TRUE
                OPC_final <- OPC_final[-which(OPC_final$Dummy.ID == result$Dummy.ID), ]
            }

            #taking first to forty colums
            OPC_final_clinic <- OPC_final[, c(1:39)] ###Will change this for radiomics
            result <- result[, colnames(result) %in% colnames(OPC_final_clinic)] ##Only leave the matching columns
            OPC_final_clinic <- rbind(OPC_final_clinic,result)

            #OPC_final_clinic[nrow(OPC_final_clinic) + 1,1:25] = result[,1:25]
            #making some new values using mutate
            OPC_final_clinic <- mutate(OPC_final_clinic, 
                                    ajcc_stage = as.character(AJCC.8th.edition),
                                    ###GC: ADD Change Tis and Tx to T1 so we end up with 4 levels of T.category
                                    T.category = ifelse (T.category%in%c("Tis","Tx"),"T1",as.character(T.category)),
                                    ##### End of ADD
                                    #t3 and t4 will be 1 and everything will be 0
                                    T.category34 = ifelse(T.category == "T3" | T.category == "T4", 1, 0),
                                    # n2 and n3 will be 1 and everything will be 0
                                    N.category23 = ifelse(N.category == "N2" | N.category == "N3", 1, 0),
                                    # if white/caucasion will be white else all will be other
                                    white = ifelse(Race == "White/Caucasion", "White", "Other"),
                                    smoke = Smoking.status.at.Diagnosis..Never.Former.Current.,
                                    # take that as numeric if value N/A make it not a number or NA
                                    pack_year = ifelse(Smoking.status..Packs.Year. == "N/A", NA, as.numeric(Smoking.status..Packs.Year.)),
                                    # if smoke is never then make 0
                                    pack_year = ifelse(smoke == "Never", 0, pack_year),
                                    #for na took the mean of all 
                                    pack_year = ifelse(is.na(pack_year) == TRUE, mean(pack_year, na.rm = TRUE), pack_year),
                                    age = Age.at.Diagnosis..Calculated.,
                                    neck_boost = Neck.boost..Y.N.,
                                    neck_dissection = Neck.Disssection.after.IMRT..Y.N.,
                                    #changed the name of the value for ease i guess 
                                    #made it as a factor meaning we can count how many are BOTs, Tonsils etc
                                    tumor_subsite = as.factor(ifelse(!(Tumor.subsite..BOT.Tonsil.Soft.Palate.Pharyngeal.wall.GPS.NOS.%in%c("BOT","Tonsil")),"Other",
                                                                        as.character(Tumor.subsite..BOT.Tonsil.Soft.Palate.Pharyngeal.wall.GPS.NOS.)))
            )

            #write.csv(OPC_final_clinic, file="opc_final_clinic_after_mutation.csv")

             
            
            levels(OPC_final_clinic$smoke )[levels(OPC_final_clinic$smoke )=="Formar"] <- "Former"
            levels(OPC_final_clinic$T.category)[levels(OPC_final_clinic$T.category)=="Tis"] <- "T1"
            levels(OPC_final_clinic$T.category)[levels(OPC_final_clinic$T.category)=="Tx"] <- "T1"

            #write.csv(OPC_final_clinic, file="after_leveling.csv")

            ## 6 blanks for feeding tube - omit
            #removing feeding tube that does not have any value
            #GC: Commented this line so the patients are not removed from the master file but rather will filter 
            #when building the model
            OPC_final_clinic <- OPC_final_clinic[OPC_final_clinic$Feeding.tube.6m!="",]
            #write.csv(OPC_final_clinic, file="omitting.csv")
            #as we removed some values above, we fixed the counter for therapeutic combination
            #OPC_final_clinic$Therapeutic.combination <- droplevels(OPC_final_clinic$Therapeutic.combination)
            #write.csv(OPC_final_clinic, file="theraputicCombination.csv")
            OPC_final_clinic <- mutate(OPC_final_clinic,
                                    #if feedind tube is N then set 0 otherwise 1
                                    feeding_tube = ifelse(Feeding.tube.6m =="N",0,1),
                                    #aspiration is N then set 0 otherwise 1
                                    aspiration = ifelse(Aspiration.rate.Y.N.=="N",0,1),
                                    #neck_booxt, neck_dissection and hpv are made as factors for counting
                                    neck_boost = factor(OPC_final_clinic$neck_boost),
                                    neck_dissection = factor(OPC_final_clinic$neck_dissection),
                                    HPV.P16.status = factor(OPC_final_clinic$HPV.P16.status))

            #levels(OPC_final_clinic$Therapeutic.combination)
            ## select covariates to include
            ## GC: Decided to go with the parameter passed and not the last row as some of the mutate may have
            ## replaced the NA
            pp <- result #OPC_final_clinic[nrow(OPC_final_clinic),]
            all_vars <- c("Therapeutic.combination","Gender", "age", "HPV.P16.status", 
                        "T.category", "N.category",
                        "smoke", "white", "pack_year","tumor_subsite", "Total.dose")
            #GC: Remove neck_boost and neck_dissection as they are not available before treatment;
            # added Total.dose
            #,"neck_boost","neck_dissection")
            sel_var <- c(!is.na(pp$Therapeutic.combination), !is.na(pp$Gender),
                        !is.na(pp$Age.at.Diagnosis..Calculated.),!is.na(pp$HPV.P16.status),
                        !is.na(pp$T.category),!is.na(pp$N.category),
                        !is.na(pp$Smoking.status.at.Diagnosis..Never.Former.Current.),
                        !is.na(pp$Race),
                        !is.na(pp$Smoking.status.at.Diagnosis..Never.Former.Current.),
                        !is.na(pp$Tumor.subsite..BOT.Tonsil.Soft.Palate.Pharyngeal.wall.GPS.NOS.),
                        !is.na(pp$Total.dose))
                        
    #                    !is.na(pp$age), !is.na(pp$HPV.P16.status), !is.na(pp$T.category), !is.na(pp$N.category),
    #                    !is.na(pp$smoke), !is.na(pp$white), !is.na(pp$pack_year), !is.na)
            rel_vars <- all_vars[sel_var]

            
            ########################################
            ##### Feeding tube: binary outcome #####
            ########################################

            ## Relevel factor variables to yield positive coefficients
            #levels(OPC_final_clinic$Therapeutic.combination)
            #write.csv(OPC_final_clinic, file="feedingTubeBinaryOutcome.csv")
            #factoring gender
            OPC_final_clinic$Gender <- factor(OPC_final_clinic$Gender,levels=levels(factor(OPC_final_clinic$Gender))[2:1])
            #print(factor(OPC_final_clinic$Gender,levels=levels(factor(OPC_final_clinic$Gender))[2:1]))
            #levels(OPC_final_clinic$neck_boost)
            #factoring smoke and then make Former as first level
            OPC_final_clinic$smoke <- factor(OPC_final_clinic$smoke)
            OPC_final_clinic$smoke <- relevel(OPC_final_clinic$smoke,"Former")
            #factoring white
            OPC_final_clinic$white <- factor(OPC_final_clinic$white,levels=c("White","Other"))
            #making Tonsile and Y as first levels
            OPC_final_clinic$tumor_subsite <- relevel(OPC_final_clinic$tumor_subsite,"Tonsil")
            OPC_final_clinic$neck_boost <- relevel(OPC_final_clinic$neck_boost,"Y")

            if(!is.na(pp$Therapeutic.combination)){
                #renaming the values 
                ###GC: ADD Made therapeutic combination a factor to avoid droplevel/relevel errors
                OPC_final_clinic <- mutate(OPC_final_clinic, Therapeutic.combination = as.factor(Therapeutic.combination))
                ###GC: end of ADD
                #releveling - making the IC+R as the first level
                OPC_final_clinic$Therapeutic.combination <- relevel(OPC_final_clinic$Therapeutic.combination,"IC+Radiation alone")
            }

            ## Logistic regression for feeding tube outcome
            ## Logistic regression model with main effects
            #paste0 concats values without any space in between them
            #collapse means what will add in between each results
            #creating the formula
            fmla_ft <- as.formula(paste0("feeding_tube ~",paste0(rel_vars,collapse="+")))
            #print(fmla_ft)
            #applying generalized linear model
            #glm(formula, data, family) -- need to find the mathemetics for JS
            #GC: exclude the last patient when training the model...only used for prediction
            fit_ft <- glm(fmla_ft, data=OPC_final_clinic[-nrow(OPC_final_clinic),], family="binomial")
            preds_ft <- predict(fit_ft, newdata=OPC_final_clinic, type = "response")
            
            
            ######################################
            ##### Aspiration: binary outcome #####
            ######################################
            #releveling and factoring
            if(!is.na(pp$Therapeutic.combination)){
                OPC_final_clinic$Therapeutic.combination <- relevel(OPC_final_clinic$Therapeutic.combination,"Radiation alone")
            }
            OPC_final_clinic$white <- factor(OPC_final_clinic$white,levels=c("Other","White"))
            OPC_final_clinic$tumor_subsite <- relevel(OPC_final_clinic$tumor_subsite,"BOT")
            ## Logistic regression model with main effects
            fmla_asp <- as.formula(paste0("aspiration ~",paste0(rel_vars,collapse="+")))
            #GC: exclude the last patient when training the model...only used for prediction
            fit_asp <- glm(fmla_asp,data=OPC_final_clinic[-nrow(OPC_final_clinic),],family="binomial")
            preds_asp <- predict(fit_asp, newdata=OPC_final_clinic, type = "response")
            
            ## note high correlation between 2 binary outcomes 

            ######################################
            ##### Survival: censored outcome #####
            ######################################
            ### outcome
            # 1) overall - overall survival (OS)
            #	2) PFS - progression (local, regional, and distant control) free survival 

            ## Add survival time and indicator variables to dataset for OS 
            OPC_final_surv <- OPC_final_clinic
            OPC_final_surv <- mutate(OPC_final_surv, 
                                    survtime = as.numeric(OS..Calculated.),
                                    survind = 1 - Overall.Survival..1.alive..0.dead.)
            ## remove extraneous variables for analysis
            #GC: Commented out this line because now that rel_vars is computed I do not want to filter the rest
            #OPC_final_surv <- select(OPC_final_surv, Dummy.ID, rel_vars,survtime,survind)

            ## Relevel factor variables to yield positive coefficients
            if(!is.na(pp$Therapeutic.combination)){
                OPC_final_surv$Therapeutic.combination <- relevel(OPC_final_surv$Therapeutic.combination,"IC+Radiation alone")
            }
            OPC_final_surv$white <- factor(OPC_final_surv$white,levels=c("White","Other"))
            OPC_final_surv$Gender <- relevel(OPC_final_surv$Gender,"Female")
            OPC_final_surv$HPV.P16.status <- relevel(OPC_final_surv$HPV.P16.status,"Unknown")
            OPC_final_surv$smoke <- relevel(OPC_final_surv$smoke,"Never")
            OPC_final_surv$tumor_subsite <- relevel(OPC_final_surv$tumor_subsite,"BOT")
            OPC_final_surv$neck_dissection <- relevel(OPC_final_surv$neck_dissection,"N")
            OPC_final_surv$T.category <- factor(OPC_final_surv$T.category)
            levels(OPC_final_surv$T.category) <- levels(OPC_final_surv$T.category)[c(4:1)]
            OPC_final_surv$N.category <- factor(OPC_final_surv$N.category)
            OPC_final_surv$N.category <- relevel(OPC_final_surv$N.category,"N1")

            # Cox proportional hazards models - standard covariates
            #need to learn about coxph and basehaz and exp
            fmla_surv <- as.formula(paste0("Surv(survtime, survind) ~",paste0(rel_vars,collapse="+")))
            fit_os <- coxph(fmla_surv, data=OPC_final_surv)

            ## baseline hazard 
            #1. took the baseline hazards that have time less than 60
            #2. then took the hazards from them 
            #3. finally took the max
            h0_5yr <- max(basehaz(fit_os, centered=FALSE)[basehaz(fit_os)$time<=60,]$haz)
            #print(basehaz(fit_os, centered=FALSE)[basehaz(fit_os)$time<=60,]$haz)
            baseline_haz <- exp(-h0_5yr)

            ### design matrix
            #model matrix make the factor values as values in a matrix
            # design.OPC <- data.frame(model.matrix(~Therapeutic.combination,data=OPC_final_surv)[,2:4],
            #                          t(t(model.matrix(~Gender, data=OPC_final_surv)[,2])),
            #                          OPC_final_surv$age, 
            #                          model.matrix(~HPV.P16.status+T.category+N.category+smoke+white, data=OPC_final_surv)[,2:12],
            #                          OPC_final_surv$pack_year,
            #                          model.matrix(~tumor_subsite+neck_boost+neck_dissection, data=OPC_final_surv)[,2:5])
            #head(model.matrix(~Gender, data=OPC_final_surv)[,2])
            #head(t(t(model.matrix(~Gender, data=OPC_final_surv)[,2])))
            
            #GC: Had to redo the design.OPC to selectively pick the variables
            design.OPC <- data.frame(OPC_final_surv$age)
            if (sel_var[1]) {
                design.OPC <- cbind( 
                                    model.matrix(~Therapeutic.combination,data=OPC_final_surv)[,2:4],
                                    design.OPC)
            }
            if (sel_var[2]) {
            design.OPC <- cbind(t(t(model.matrix(~Gender, data=OPC_final_surv)[,2])), 
                                design.OPC)
            }
            if (sel_var[4] ) {
            design.OPC <- cbind(design.OPC, 
                                model.matrix(~HPV.P16.status, data=OPC_final_surv)[,2:3])
            }
            if (sel_var[5] ) {
            design.OPC <- cbind(design.OPC, 
                                model.matrix(~T.category, data=OPC_final_surv)[,2:4])
            }
            if (sel_var[6] ) {
            design.OPC <- cbind(design.OPC, 
                                model.matrix(~N.category, data=OPC_final_surv)[,2:4])
            }
            if (sel_var[7]) {
            design.OPC <- cbind(design.OPC, t(t(model.matrix(~smoke, data=OPC_final_surv)[,2:3])))
            }
            if (sel_var[8]) {
            design.OPC <- cbind(design.OPC, t(t(model.matrix(~white, data=OPC_final_surv)[,2])))
            }
            if (sel_var[9]) {
            design.OPC <- cbind(design.OPC, OPC_final_surv$pack_year)
            }
            if (sel_var[10]) {
            design.OPC <- cbind(design.OPC, model.matrix(~tumor_subsite, data=OPC_final_surv)[,2:3])
            }
            if (sel_var[11]) {
            design.OPC <- cbind(design.OPC, OPC_final_surv$Total.dose)
            }
            # predictions for each participant 
            # %*% is matrix multiplication
            # exp is exponential function
            preds_os <- exp(-h0_5yr)^exp((as.matrix(design.OPC))%*%(matrix(fit_os$coefficients)))

            #same process
            ## Repeat for progression-free survival outcome
            OPC_final_pfs <- OPC_final_clinic
            OPC_final_pfs <- mutate(OPC_final_pfs, 
                                    #pmin sends the minimum value between the two
                                    survtime = pmin(Locoregional.control..Time., FDM..months.),
                                    survind = ifelse((Locoregional.control..Time. == survtime)*
                                                    (1 - Locoregional.Control.1.Control.0.Failure.) +
                                                    (FDM..months. == survtime)*(1 - Distant.Control..1.no.DM..0.DM.) > 0 , 1, 0))
            #OPC_final_pfs <- select(OPC_final_pfs, Dummy.ID, rel_vars,survtime,survind)

            ## Relevel factor variables to yield positive coefficients
            if(!is.na(pp$Therapeutic.combination)){
                OPC_final_pfs$Therapeutic.combination <- relevel(OPC_final_pfs$Therapeutic.combination,"IC+Radiation alone")
            }
            OPC_final_pfs$Gender <- relevel(OPC_final_pfs$Gender,"Female")
            OPC_final_pfs$white <- relevel(OPC_final_pfs$white,"White")
            OPC_final_pfs$HPV.P16.status <- relevel(OPC_final_pfs$HPV.P16.status,"Unknown")
            OPC_final_pfs$smoke <- relevel(OPC_final_pfs$smoke,"Never")
            OPC_final_pfs$tumor_subsite <- relevel(OPC_final_pfs$tumor_subsite,"Other")
            OPC_final_pfs$neck_dissection <- relevel(OPC_final_pfs$neck_dissection,"N")
            OPC_final_pfs$T.category <- factor(OPC_final_pfs$T.category)
            levels(OPC_final_pfs$T.category) <- levels(OPC_final_pfs$T.category)[c(4:1)]
            OPC_final_pfs$N.category <- factor(OPC_final_pfs$N.category)

            ## fit Cox proportional hazards model
            fit_pfs <- coxph(fmla_surv, data=OPC_final_pfs)

            ## baseline hazard 
            h0_5yr_pfs <- max(basehaz(fit_pfs, centered=FALSE)[basehaz(fit_pfs)$time<=60,]$haz)
            baseline_haz_pfs <- exp(-h0_5yr_pfs)

            ### design matrix
            # design.OPC_pfs <- data.frame(model.matrix(~Therapeutic.combination,data=OPC_final_pfs)[,2:4],
            #                              t(t(model.matrix(~Gender, data=OPC_final_pfs)[,2])),
            #                              OPC_final_pfs$age, 
            #                              model.matrix(~HPV.P16.status+T.category+N.category+smoke+white, data=OPC_final_pfs)[,2:12],
            #                              OPC_final_pfs$pack_year,
            #                              model.matrix(~tumor_subsite+neck_boost+neck_dissection, data=OPC_final_pfs)[,2:5])
            #GC: Had to redo the design.OPC to selectively pick the variables
            design.OPC_pfs <- data.frame(OPC_final_pfs$age)
            if (sel_var[1]) {
            design.OPC_pfs <- cbind( 
                model.matrix(~Therapeutic.combination,data=OPC_final_pfs)[,2:4],
                design.OPC_pfs)
            }
            if (sel_var[2]) {
            design.OPC_pfs <- cbind(t(t(model.matrix(~Gender, data=OPC_final_pfs)[,2])), 
                                design.OPC_pfs)
            }
            if (sel_var[4] ) {
            design.OPC_pfs <- cbind(design.OPC_pfs, 
                                model.matrix(~HPV.P16.status, data=OPC_final_pfs)[,2:3])
            }
            if (sel_var[5] ) {
            design.OPC_pfs <- cbind(design.OPC_pfs, 
                                model.matrix(~T.category, data=OPC_final_pfs)[,2:4])
            }
            if (sel_var[6] ) {
            design.OPC_pfs <- cbind(design.OPC_pfs, 
                                model.matrix(~N.category, data=OPC_final_pfs)[,2:4])
            }
            if (sel_var[7]) {
            design.OPC_pfs <- cbind(design.OPC_pfs, t(t(model.matrix(~smoke, data=OPC_final_pfs)[,2:3])))
            }
            if (sel_var[8]) {
            design.OPC_pfs <- cbind(design.OPC_pfs, t(t(model.matrix(~white, data=OPC_final_pfs)[,2])))
            }
            if (sel_var[9]) {
            design.OPC_pfs <- cbind(design.OPC_pfs, OPC_final_pfs$pack_year)
            }
            if (sel_var[10]) {
            design.OPC_pfs <- cbind(design.OPC_pfs, model.matrix(~tumor_subsite, data=OPC_final_pfs)[,2:3])
            }
            if (sel_var[11]) {
            design.OPC_pfs <- cbind(design.OPC_pfs, OPC_final_pfs$Total.dose)
            }
            
            ## predictions for each participant
            preds_pfs <- exp(-h0_5yr_pfs)^exp((as.matrix(design.OPC_pfs))%*%(matrix(fit_pfs$coefficients)))

            ##########################
            ##### Compile Output #####
            ##########################

            # id_list_data <- OPC[OPC$Feeding.tube.6m!="",]
            # id_list <- id_list_data$Dummy.ID

            final_preds <- data.frame(ID=OPC_final_clinic$Dummy.ID, 
                                    feeding_tube_prob = preds_ft,
                                    aspiration_prob = preds_asp,
                                    overall_survival_5yr_prob = preds_os,
                                    progression_free_5yr_prob = preds_pfs)
            #write.csv(final_preds, file="Risk_preds.csv")

            final_preds

            #write.csv(final_weights, file="Risk_pred_model_coefficients.csv")

    }

    ''')
    
    # without therapeutic
    robjects.r('''
        without_therapeutic <- function(value){
            # this is the prediction R code without therapeutic combination
            # just removed therapeutic combination from here..
            # was getting error for therapeutic factor 
            # note: this was error was overlooked by rStudio

            if(!require("pacman")) install.packages("pacman")
            pacman::p_load(pacman, survival, tidyverse)           

            OPC <- read.csv("../data/newdata.csv")

            ###############################
            ##### Clean clinical data #####
            ###############################

            OPC_final <- OPC[!is.na(OPC$Dummy.ID),]

            result <- as.data.frame(value)
            ##GC: added this mutate because the numeric values were coming in as characters
            result <- mutate(result, OS..Calculated. = as.numeric(OS..Calculated.),
                            Overall.Survival..1.alive..0.dead. = as.numeric(Overall.Survival..1.alive..0.dead.),
                            Regional.control..Time. = as.numeric(Regional.control..Time.),
                            Total.dose = as.numeric(Total.dose),
                            Locoregional.control..Time. = as.numeric(Locoregional.control..Time.),
                            FDM..months. = as.numeric(FDM..months.),
                            Locoregional.Control.1.Control.0.Failure. = as.numeric( Locoregional.Control.1.Control.0.Failure.),
                            Distant.Control..1.no.DM..0.DM. = as.numeric(Distant.Control..1.no.DM..0.DM.),
                            Feeding.tube.6m = as.character(ifelse(is.na(Feeding.tube.6m),"N",Feeding.tube.6m)) )
            ##GC: made the patient to predict censored for OS and PFS                 
            result[is.na(result$OS..Calculated.),"OS..Calculated."] <- 0
            result[is.na(result$Overall.Survival..1.alive..0.dead.),"Overall.Survival..1.alive..0.dead."] <- 1
            # if this is an existing patient, remove it from the existing list
            result[is.na(result$Regional.control..Time.),"Regional.control..Time."]<-0
            result[is.na(result$Locoregional.control..Time.),"Locoregional.control..Time."]<-0
            result[is.na(result$FDM..months.),"FDM..months."]<- 0
            result[is.na(result$Locoregional.Control.1.Control.0.Failure. ),"Locoregional.Control.1.Control.0.Failure."]<-1
            result[is.na(result$Distant.Control..1.no.DM..0.DM.),"Distant.Control..1.no.DM..0.DM."]<- 1
            
            existing_patient <- FALSE
            if (result["Dummy.ID"] %in% OPC_final$Dummy.ID) {
                existing_patient <- TRUE
                OPC_final <- OPC_final[-which(OPC_final$Dummy.ID == result$Dummy.ID), ]
            }

            #taking first to forty colums
            OPC_final_clinic <- OPC_final[, c(1:39)] ###Will change this for radiomics
            result <- result[, colnames(result) %in% colnames(OPC_final_clinic)] ##Only leave the matching columns
            OPC_final_clinic <- rbind(OPC_final_clinic,result)

            #OPC_final_clinic[nrow(OPC_final_clinic) + 1,1:25] = result[,1:25]
            #making some new values using mutate
            OPC_final_clinic <- mutate(OPC_final_clinic, 
                                    ajcc_stage = as.character(AJCC.8th.edition),
                                    ###GC: ADD Change Tis and Tx to T1 so we end up with 4 levels of T.category
                                    T.category = ifelse (T.category%in%c("Tis","Tx"),"T1",as.character(T.category)),
                                    ##### End of ADD
                                    #t3 and t4 will be 1 and everything will be 0
                                    T.category34 = ifelse(T.category == "T3" | T.category == "T4", 1, 0),
                                    # n2 and n3 will be 1 and everything will be 0
                                    N.category23 = ifelse(N.category == "N2" | N.category == "N3", 1, 0),
                                    # if white/caucasion will be white else all will be other
                                    white = ifelse(Race == "White/Caucasion", "White", "Other"),
                                    smoke = Smoking.status.at.Diagnosis..Never.Former.Current.,
                                    # take that as numeric if value N/A make it not a number or NA
                                    pack_year = ifelse(Smoking.status..Packs.Year. == "N/A", NA, as.numeric(Smoking.status..Packs.Year.)),
                                    # if smoke is never then make 0
                                    pack_year = ifelse(smoke == "Never", 0, pack_year),
                                    #for na took the mean of all 
                                    pack_year = ifelse(is.na(pack_year) == TRUE, mean(pack_year, na.rm = TRUE), pack_year),
                                    age = Age.at.Diagnosis..Calculated.,
                                    neck_boost = Neck.boost..Y.N.,
                                    neck_dissection = Neck.Disssection.after.IMRT..Y.N.,
                                    #changed the name of the value for ease i guess 
                                    #made it as a factor meaning we can count how many are BOTs, Tonsils etc
                                    tumor_subsite = as.factor(ifelse(!(Tumor.subsite..BOT.Tonsil.Soft.Palate.Pharyngeal.wall.GPS.NOS.%in%c("BOT","Tonsil")),"Other",
                                                                        as.character(Tumor.subsite..BOT.Tonsil.Soft.Palate.Pharyngeal.wall.GPS.NOS.)))
            )
             
            
            levels(OPC_final_clinic$smoke )[levels(OPC_final_clinic$smoke )=="Formar"] <- "Former"
            levels(OPC_final_clinic$T.category)[levels(OPC_final_clinic$T.category)=="Tis"] <- "T1"
            levels(OPC_final_clinic$T.category)[levels(OPC_final_clinic$T.category)=="Tx"] <- "T1"

            OPC_final_clinic <- OPC_final_clinic[OPC_final_clinic$Feeding.tube.6m!="",]

            OPC_final_clinic <- mutate(OPC_final_clinic,
                                    #if feedind tube is N then set 0 otherwise 1
                                    feeding_tube = ifelse(Feeding.tube.6m =="N",0,1),
                                    #aspiration is N then set 0 otherwise 1
                                    aspiration = ifelse(Aspiration.rate.Y.N.=="N",0,1),
                                    #neck_booxt, neck_dissection and hpv are made as factors for counting
                                    neck_boost = factor(OPC_final_clinic$neck_boost),
                                    neck_dissection = factor(OPC_final_clinic$neck_dissection),
                                    HPV.P16.status = factor(OPC_final_clinic$HPV.P16.status))

            #levels(OPC_final_clinic$Therapeutic.combination)
            ## select covariates to include
            ## GC: Decided to go with the parameter passed and not the last row as some of the mutate may have
            ## replaced the NA
            pp <- result #OPC_final_clinic[nrow(OPC_final_clinic),]
            all_vars <- c("Gender", "age", "HPV.P16.status", 
                        "T.category", "N.category",
                        "smoke", "white", "pack_year","tumor_subsite", "Total.dose")
            #GC: Remove neck_boost and neck_dissection as they are not available before treatment;
            # added Total.dose
            #,"neck_boost","neck_dissection")
            sel_var <- c(!is.na(pp$Gender),
                        !is.na(pp$Age.at.Diagnosis..Calculated.),!is.na(pp$HPV.P16.status),
                        !is.na(pp$T.category),!is.na(pp$N.category),
                        !is.na(pp$Smoking.status.at.Diagnosis..Never.Former.Current.),
                        !is.na(pp$Race),
                        !is.na(pp$Smoking.status.at.Diagnosis..Never.Former.Current.),
                        !is.na(pp$Tumor.subsite..BOT.Tonsil.Soft.Palate.Pharyngeal.wall.GPS.NOS.),
                        !is.na(pp$Total.dose))
                        
    #                    !is.na(pp$age), !is.na(pp$HPV.P16.status), !is.na(pp$T.category), !is.na(pp$N.category),
    #                    !is.na(pp$smoke), !is.na(pp$white), !is.na(pp$pack_year), !is.na)
            rel_vars <- all_vars[sel_var]

            
            ########################################
            ##### Feeding tube: binary outcome #####
            ########################################

            #factoring gender
            OPC_final_clinic$Gender <- factor(OPC_final_clinic$Gender,levels=levels(factor(OPC_final_clinic$Gender))[2:1])
           
            OPC_final_clinic$smoke <- factor(OPC_final_clinic$smoke)
            OPC_final_clinic$smoke <- relevel(OPC_final_clinic$smoke,"Former")
            #factoring white
            OPC_final_clinic$white <- factor(OPC_final_clinic$white,levels=c("White","Other"))
            #making Tonsile and Y as first levels
            OPC_final_clinic$tumor_subsite <- relevel(OPC_final_clinic$tumor_subsite,"Tonsil")
            OPC_final_clinic$neck_boost <- relevel(OPC_final_clinic$neck_boost,"Y")

            #creating the formula
            fmla_ft <- as.formula(paste0("feeding_tube ~",paste0(rel_vars,collapse="+")))

            #GC: exclude the last patient when training the model...only used for prediction
            fit_ft <- glm(fmla_ft, data=OPC_final_clinic[-nrow(OPC_final_clinic),], family="binomial")
            preds_ft <- predict(fit_ft, newdata=OPC_final_clinic, type = "response")
            
            
            ######################################
            ##### Aspiration: binary outcome #####
            ######################################
            #releveling and factoring
            OPC_final_clinic$white <- factor(OPC_final_clinic$white,levels=c("Other","White"))
            OPC_final_clinic$tumor_subsite <- relevel(OPC_final_clinic$tumor_subsite,"BOT")
            ## Logistic regression model with main effects
            fmla_asp <- as.formula(paste0("aspiration ~",paste0(rel_vars,collapse="+")))
            #GC: exclude the last patient when training the model...only used for prediction
            fit_asp <- glm(fmla_asp,data=OPC_final_clinic[-nrow(OPC_final_clinic),],family="binomial")
            preds_asp <- predict(fit_asp, newdata=OPC_final_clinic, type = "response")
            
            ## note high correlation between 2 binary outcomes 

            ######################################
            ##### Survival: censored outcome #####
            ######################################
            ### outcome
            # 1) overall - overall survival (OS)
            #	2) PFS - progression (local, regional, and distant control) free survival 

            ## Add survival time and indicator variables to dataset for OS 
            OPC_final_surv <- OPC_final_clinic
            OPC_final_surv <- mutate(OPC_final_surv, 
                                    survtime = as.numeric(OS..Calculated.),
                                    survind = 1 - Overall.Survival..1.alive..0.dead.)
            ## remove extraneous variables for analysis
            #GC: Commented out this line because now that rel_vars is computed I do not want to filter the rest
            #OPC_final_surv <- select(OPC_final_surv, Dummy.ID, rel_vars,survtime,survind)

            ## Relevel factor variables to yield positive coefficients
            OPC_final_surv$white <- factor(OPC_final_surv$white,levels=c("White","Other"))
            OPC_final_surv$Gender <- relevel(OPC_final_surv$Gender,"Female")
            OPC_final_surv$HPV.P16.status <- relevel(OPC_final_surv$HPV.P16.status,"Unknown")
            OPC_final_surv$smoke <- relevel(OPC_final_surv$smoke,"Never")
            OPC_final_surv$tumor_subsite <- relevel(OPC_final_surv$tumor_subsite,"BOT")
            OPC_final_surv$neck_dissection <- relevel(OPC_final_surv$neck_dissection,"N")
            OPC_final_surv$T.category <- factor(OPC_final_surv$T.category)
            levels(OPC_final_surv$T.category) <- levels(OPC_final_surv$T.category)[c(4:1)]
            OPC_final_surv$N.category <- factor(OPC_final_surv$N.category)
            OPC_final_surv$N.category <- relevel(OPC_final_surv$N.category,"N1")

            # Cox proportional hazards models - standard covariates
            #need to learn about coxph and basehaz and exp
            fmla_surv <- as.formula(paste0("Surv(survtime, survind) ~",paste0(rel_vars,collapse="+")))
            fit_os <- coxph(fmla_surv, data=OPC_final_surv)

            ## baseline hazard 
            #1. took the baseline hazards that have time less than 60
            #2. then took the hazards from them 
            #3. finally took the max
            h0_5yr <- max(basehaz(fit_os, centered=FALSE)[basehaz(fit_os)$time<=60,]$haz)
            #print(basehaz(fit_os, centered=FALSE)[basehaz(fit_os)$time<=60,]$haz)
            baseline_haz <- exp(-h0_5yr)

            
            #GC: Had to redo the design.OPC to selectively pick the variables
            design.OPC <- data.frame(OPC_final_surv$age)
            if (sel_var[1]) {
            design.OPC <- cbind(t(t(model.matrix(~Gender, data=OPC_final_surv)[,2])), 
                                design.OPC)
            }
            if (sel_var[3] ) {
            design.OPC <- cbind(design.OPC, 
                                model.matrix(~HPV.P16.status, data=OPC_final_surv)[,2:3])
            }
            if (sel_var[4] ) {
            design.OPC <- cbind(design.OPC, 
                                model.matrix(~T.category, data=OPC_final_surv)[,2:4])
            }
            if (sel_var[5] ) {
            design.OPC <- cbind(design.OPC, 
                                model.matrix(~N.category, data=OPC_final_surv)[,2:4])
            }
            if (sel_var[6]) {
            design.OPC <- cbind(design.OPC, t(t(model.matrix(~smoke, data=OPC_final_surv)[,2:3])))
            }
            if (sel_var[7]) {
            design.OPC <- cbind(design.OPC, t(t(model.matrix(~white, data=OPC_final_surv)[,2])))
            }
            if (sel_var[8]) {
            design.OPC <- cbind(design.OPC, OPC_final_surv$pack_year)
            }
            if (sel_var[9]) {
            design.OPC <- cbind(design.OPC, model.matrix(~tumor_subsite, data=OPC_final_surv)[,2:3])
            }
            if (sel_var[10]) {
            design.OPC <- cbind(design.OPC, OPC_final_surv$Total.dose)
            }
            # predictions for each participant 
            # %*% is matrix multiplication
            # exp is exponential function
            preds_os <- exp(-h0_5yr)^exp((as.matrix(design.OPC))%*%(matrix(fit_os$coefficients)))

            #same process
            ## Repeat for progression-free survival outcome
            OPC_final_pfs <- OPC_final_clinic
            OPC_final_pfs <- mutate(OPC_final_pfs, 
                                    #pmin sends the minimum value between the two
                                    survtime = pmin(Locoregional.control..Time., FDM..months.),
                                    survind = ifelse((Locoregional.control..Time. == survtime)*
                                                    (1 - Locoregional.Control.1.Control.0.Failure.) +
                                                    (FDM..months. == survtime)*(1 - Distant.Control..1.no.DM..0.DM.) > 0 , 1, 0))
            #OPC_final_pfs <- select(OPC_final_pfs, Dummy.ID, rel_vars,survtime,survind)

            ## Relevel factor variables to yield positive coefficients
            OPC_final_pfs$Gender <- relevel(OPC_final_pfs$Gender,"Female")
            OPC_final_pfs$white <- relevel(OPC_final_pfs$white,"White")
            OPC_final_pfs$HPV.P16.status <- relevel(OPC_final_pfs$HPV.P16.status,"Unknown")
            OPC_final_pfs$smoke <- relevel(OPC_final_pfs$smoke,"Never")
            OPC_final_pfs$tumor_subsite <- relevel(OPC_final_pfs$tumor_subsite,"Other")
            OPC_final_pfs$neck_dissection <- relevel(OPC_final_pfs$neck_dissection,"N")
            OPC_final_pfs$T.category <- factor(OPC_final_pfs$T.category)
            levels(OPC_final_pfs$T.category) <- levels(OPC_final_pfs$T.category)[c(4:1)]
            OPC_final_pfs$N.category <- factor(OPC_final_pfs$N.category)

            ## fit Cox proportional hazards model
            fit_pfs <- coxph(fmla_surv, data=OPC_final_pfs)

            ## baseline hazard 
            h0_5yr_pfs <- max(basehaz(fit_pfs, centered=FALSE)[basehaz(fit_pfs)$time<=60,]$haz)
            baseline_haz_pfs <- exp(-h0_5yr_pfs)

            #GC: Had to redo the design.OPC to selectively pick the variables
            design.OPC_pfs <- data.frame(OPC_final_pfs$age)
            if (sel_var[1]) {
            design.OPC_pfs <- cbind(t(t(model.matrix(~Gender, data=OPC_final_pfs)[,2])), 
                                design.OPC_pfs)
            }
            if (sel_var[3] ) {
            design.OPC_pfs <- cbind(design.OPC_pfs, 
                                model.matrix(~HPV.P16.status, data=OPC_final_pfs)[,2:3])
            }
            if (sel_var[4] ) {
            design.OPC_pfs <- cbind(design.OPC_pfs, 
                                model.matrix(~T.category, data=OPC_final_pfs)[,2:4])
            }
            if (sel_var[5] ) {
            design.OPC_pfs <- cbind(design.OPC_pfs, 
                                model.matrix(~N.category, data=OPC_final_pfs)[,2:4])
            }
            if (sel_var[6]) {
            design.OPC_pfs <- cbind(design.OPC_pfs, t(t(model.matrix(~smoke, data=OPC_final_pfs)[,2:3])))
            }
            if (sel_var[7]) {
            design.OPC_pfs <- cbind(design.OPC_pfs, t(t(model.matrix(~white, data=OPC_final_pfs)[,2])))
            }
            if (sel_var[8]) {
            design.OPC_pfs <- cbind(design.OPC_pfs, OPC_final_pfs$pack_year)
            }
            if (sel_var[9]) {
            design.OPC_pfs <- cbind(design.OPC_pfs, model.matrix(~tumor_subsite, data=OPC_final_pfs)[,2:3])
            }
            if (sel_var[10]) {
            design.OPC_pfs <- cbind(design.OPC_pfs, OPC_final_pfs$Total.dose)
            }
            
            ## predictions for each participant
            preds_pfs <- exp(-h0_5yr_pfs)^exp((as.matrix(design.OPC_pfs))%*%(matrix(fit_pfs$coefficients)))

            ##########################
            ##### Compile Output #####
            ##########################

            # id_list_data <- OPC[OPC$Feeding.tube.6m!="",]
            # id_list <- id_list_data$Dummy.ID

            final_preds <- data.frame(ID=OPC_final_clinic$Dummy.ID, 
                                    feeding_tube_prob = preds_ft,
                                    aspiration_prob = preds_asp,
                                    overall_survival_5yr_prob = preds_os,
                                    progression_free_5yr_prob = preds_pfs)
            #write.csv(final_preds, file="Risk_preds.csv")

            final_preds

            #write.csv(final_weights, file="Risk_pred_model_coefficients.csv")

    }

    ''')

    # converting to R dataframe
    val = robjects.DataFrame(new_data)
    prediction_function_with_therapeutic = robjects.r['with_therap']
    prediction_function_without = robjects.r['without_therapeutic']

    if data["therap"] == True:
        result = prediction_function_with_therapeutic(val)
    else:
        result = prediction_function_without(val)
    # ty = str(type(result))    
    # converting the dataframe to a multi-dimentional array
    # initialize multi-array  
    prediction = [ [ 0 for y in range(len(result[0])) ] for x in range( len(result)) ]     
    # print(len(result[0]))
    for i in range(len(result)):
        for j in range(len(result[0])):
            prediction[i][j] = result[i][j]
    
    return jsonify(prediction)

if __name__ == "__main__":
    app.run()