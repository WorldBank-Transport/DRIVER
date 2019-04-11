FROM r-base:3.5.0

RUN R --slave --silent --vanilla \
    -e 'install.packages(c("optparse", "caret", "plyr", "gbm", "doParallel"), repos="http://cran.rstudio.com")'

RUN mkdir -p /opt/analysis_tasks
WORKDIR /opt/analysis_tasks

COPY . /opt/analysis_tasks

# Provide access to the R environment by default if run without parameters
CMD ["R", "--vanilla"]
