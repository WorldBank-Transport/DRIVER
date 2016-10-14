# IDENTIFY FUTURE HOTSPOTS VIA PREDICTIVE MODEL

# capture script start time
time.script.start = proc.time()


####
# SETUP PACKAGES
####

# set CRAN mirror
options(repos=structure(c(CRAN="http://cran.rstudio.com")))

# required packages
required.packages = c("optparse","caret", "plyr", "gbm", "doParallel")

# load the packages
for (p in required.packages) {
  if (!suppressPackageStartupMessages(require(p, quietly=T, character.only=T))) {
    install.packages(p)
    require(p)
  }
}

####
# READ COMMAND LINE PARAMS
####

option_list = list(
  make_option(c("--verbose"), type="integer", default=2,
              help="Adjust level of status messages [default %default]",
              metavar="number"),
  make_option(c("--ntreesmax"), type="integer", default=5000,
              help="Max number of trees to use in the model build [default %default]",
              metavar="number"),
  make_option(c("--nmodelconfigs"), type="integer", default=8,
              help="The number of hyperparameter configurations to test [default %default]",
              metavar="number"),
  make_option(c("--cores"), type="integer", default=4,
              help="Number of cores to use for parallel operations. [default %default]",
              metavar="number"),
  make_option(c("--outputfile"), type="character", default="forecasts.csv",
              help="Path to file to which to write output")
)

# parse the options
parser = OptionParser(usage = "%prog [options] trainfile", option_list=option_list)
arguments = parse_args(parser, positional_arguments=TRUE)

# extract the input file name or quit
if(length(arguments$args) == 1) {
  kTrainFile = arguments$args[1]
} else {
  stop("Incorrect parameters.  Run --help for help.")
}
# extract the remaining options
opt = arguments$options


####
# SETUP PARAMETERS
####

kVerbose = opt$verbose

kParallelCores = opt$cores

kNTrees = as.numeric(opt$ntrees)

kNumberModelConfigsToSearch = as.numeric(opt$nmodelconfigs)

####
# SETUP/CLEANUP ENVIRONMENT
####

# enable multithreaded environment
if(kParallelCores > 1) {
  registerDoParallel(kParallelCores)
}

pdf(file=file.path(dirname(kTrainFile),"diagnostics.pdf"),
    paper="USr", width=0, height=0, pointsize=8)

# change console line width
options(width=150)

####
# FUNCTIONS
####

PrintStatus = function (visible.at, ...) {
  # Outputs status messages for logging purposes
  #
  # Args:
  #   visible.at: works with kVerbose constant to determine what to print
  #   ...: any number of other variables
  if(visible.at <= kVerbose) print(paste0("Status --  ", ...))
}

PrepData = function(data.raw, outcome.year=0, outcome.type="records") {
  # Preps data for modeling / prediction
  # outcome.year can be either 0 (for training model) or -1 (for prediction)
  # outcome.type can be either "records" or "severe"
  

  
  # assemble inputs
  d.raw.inputvarnames = c("inter", "length", "lines", "pointx", "pointy")
  d.var.dir.constraints = c(0, +1, 0, 0, 0)
  d.prepped.inputvarnames = d.raw.inputvarnames
  
  t.offset.start = outcome.year + 1
  t.offset.end = outcome.year + 3
  for(t in t.offset.start:t.offset.end) {
    # assemble past record count raw column names
    d.raw.inputvarnames = c(d.raw.inputvarnames, paste0("t", t, "notsev"),
                                                 paste0("t", t, "severe"))
    d.var.dir.constraints = c(d.var.dir.constraints, +1, +1)
    # assemble renamed past record count column names
    d.prepped.inputvarnames = c(d.prepped.inputvarnames, paste0("t", t-t.offset.start, "notsev"),
                                                         paste0("t", t-t.offset.start, "severe"))
  }
  d.prepped = data.raw[,d.raw.inputvarnames]
  colnames(d.prepped) = d.prepped.inputvarnames
  
  # assemble outcome
  if(outcome.year >= 0) {
    d.raw.outcomevarname = paste0("t", outcome.year, outcome.type)
    d.outcome = data.raw[,d.raw.outcomevarname]
    d.prepped = cbind(outcome=d.outcome, d.prepped)
  }
  
  return(list(data=d.prepped, var.dir.constraints=d.var.dir.constraints))
}


CustomGBMParamGridGenerator = function (x, y, len = NULL, search = "grid") 
{
  if (search == "grid") {
    out <- expand.grid(interaction.depth = seq(1, len), n.trees = floor((1:len) * 
                                                                          50), shrinkage = 0.1, n.minobsinnode = 10)
  }
  else {
    # sampling n.trees separately because we get it for free with gbm
    #n.trees = round(runif(len, min = 1, max = kNTrees)), 

    out <- data.frame(interaction.depth = sample(2:20, replace = TRUE, size = len), 
                      shrinkage = runif(len, min = 0.001, max = 0.1),
                      n.minobsinnode = round(runif(len, min = 1, max = 100)))
    out <- out[!duplicated(out), ]
    
    out2 = data.frame()
    for(n in 1:kNTrees) {
      n.df = cbind(n.trees=n, out)
      out2 = rbind(out2, n.df)
    }
 
  }
  out2
}

CustomSummary = function(data, lev=NULL, model=NULL) {
  # custom summary function to power poisson loss metric
  if (is.character(data$obs)) 
    data$obs <- factor(data$obs, levels = lev)
  simpleout =  postResample(data[, "pred"], data[, "obs"])
  poissonloss = mean(data[, "pred"] - data[, "obs"] * log(data[,"pred"] + 1e-250))
  out = c(simpleout, poissonloss)
  names(out) = c(names(simpleout), "PoissonLoss")
  out
}

####
# MAIN
####

PrintStatus(1, "Reading input file ", kTrainFile, "...")
data.raw = read.csv(kTrainFile)
if(kVerbose > 3) {
  str(data.raw)
}

# setup some modeling variables
modeling.tc = trainControl(method="cv", number=4, search="random", summaryFunction=CustomSummary)
modeling.grid = CustomGBMParamGridGenerator(len=kNumberModelConfigsToSearch, search="random")

#event.types = c("notsev", "severe")
event.types = c("notsev")

forecasts = data.raw

for(et in event.types) {
  PrintStatus(1, "Prepping training data for model - ", et, "...")
  data.prepped = PrepData(data.raw, outcome.year=0, outcome.type=et)
  if(kVerbose > 4) {
    str(data.prepped)
  }
  
  PrintStatus(1, "Building model...")
  et.trainresult = train(outcome ~ ., var.monotone=data.prepped$var.dir.constraints,
                         data=data.prepped$data,
                         method="gbm", distribution="poisson", metric="PoissonLoss", maximize=FALSE,
                         trControl=modeling.tc, tuneGrid=modeling.grid)
  PrintStatus(1, "Model built.")
  if(kVerbose > 5) {
    
    PrintStatus(1, "Model Training Summary:")
    print(et.trainresult)
    
    PrintStatus(1, "Final Model Summary:")
    model.var.strengths = summary(et.trainresult$finalModel)
    print(model.var.strengths)
    
    PrintStatus(1, "Generating partial plots of all variables...")
    for(v in 1:length(et.trainresult$finalModel$var.names)) {
      plot(et.trainresult$finalModel, i.var=v)
    }
    
    PrintStatus(1, "Generating partial plots of all pairs of variables...")
    # create a matrix to store variable interaction effects as we loop through them
    model.interaction.strengths = matrix(nrow=length(et.trainresult$finalModel$var.names),
                                         ncol=length(et.trainresult$finalModel$var.names),
                                         dimnames=list(et.trainresult$finalModel$var.names, 
                                                       et.trainresult$finalModel$var.names))
    
    for(v in 1:length(et.trainresult$finalModel$var.names)) {
      for(v2 in 1:length(et.trainresult$finalModel$var.names)) {
        if(v < v2 & model.var.strengths$rel.inf[v] > 0 & model.var.strengths$rel.inf[v2] > 0) {
          print(plot(et.trainresult$finalModel, i.var=c(v,v2)))
          model.interaction.strengths[v, v2] = interact.gbm(et.trainresult$finalModel, i.var=c(v,v2), data=data.prepped$data)
        }
      }
    }
    
    # visualize the interactions
    print(model.interaction.strengths)
    
  } else {
    PrintStatus(1, "Selected hyperparameters: ")
    print(et.trainresult$bestTune)
  }
  
  et.modelfilename = paste0("model-", et, ".RData")
  save(et.trainresult, file=et.modelfilename)
  PrintStatus(1, "Model saved to ", et.modelfilename)
  
  PrintStatus(1, "Create forecasts...")
  data.prepped = PrepData(data.raw, outcome.year=-1, outcome.type=et)
  et.predictions = predict(et.trainresult, newdata=data.prepped$data)
  if(kVerbose>4) {
    plot(data.prepped$data[,paste0("t0",et)], et.predictions, asp=1)
  }
  
  # assemble the forecasts with covariate data for writing out later
  forecasts = cbind(forecasts, et.predictions)
  colnames(forecasts)[ncol(forecasts)] = paste0("forecast-", et)
}

PrintStatus(1, "Writing CSV with forecasts...")
write.csv(forecasts, file=opt$outputfile, row.names=FALSE)


####
# EXIT
####

time.script.stop = proc.time()
time.script.processing = as.numeric(time.script.stop[3] - time.script.start[3]) / 60

PrintStatus(1, "Script processing total duration (minutes): ", round(time.script.processing,3))
PrintStatus(1, "Complete")

# save state for dev
q(save="no")
