# System administration: Batch data loading

The DRIVER system has provisions to programatically load data. There are two easy ways to do this. Sample python scripts are provided for both methods, but you will likely need to edit these scripts to match your data's format.

## Table of Contents
- [**Loading data using the API**](#loading-data-using-the-api)
- [**Loading data using Django shell**](#loading-data-using-django-shell)

## Loading data using the API

A sample script that loads data using the API can be found at `scripts/load_incidents_v3.py`. It accepts the path to a directory with csv data to be loaded (`incidents_csv_dir`). It also has optional arguments that it accepts with flags:

```
--schema-path SCHEMA_PATH   Path to JSON file defining schema
--api-url API_URL           API host / path to target for loading data
--authz AUTHZ               Authorization header
```

It does 3 basic things:

1. Creates a new schema. It does this using the default `scripts/incident_schema_v3.json` or a custom schema specified using the `--schema-path` flag. If you wish to add records to an existing schema, all you need to do is comment out the `create_schema` function call in `main` and assign the schema uuid you want to `schema_id`.

2. Transforms the data. It transforms a row of the csv file into a json object that is compliant with the schema. It does this using the `transform` method. When you have to load batch data using this script, this is the function that should have the most changes depending on your csv.

3. Loads the data. It loads the object that it transforms a row of the csv file into using an API call. The `load` function also includes a brief sleep so as to not overload the server with API calls. Remove this at your discretion.

The script will also inform you of the progress with a log message on loading every 100 data points and on successfully loading a csv file.


## Loading data using Django shell

This functions identically to the script that hits the API except that it runs in the Django shell and is therefore a quicker way to load a huge amount of data. If you have more than 5000 records to load, this is the recommended way to do so. A sample script is included at `scripts/django_batch_loader.py`. This script would have to be run on Django shell as follows:

```
$ cp scripts/django_batch_loader.py app
$ cp <csv-file(s)> app/batch
$ vagrant ssh app
$ sudo docker exec -ti driver-app bash
$ ./manage.py shell_plus
>>> from django_batch_loader import main
>>> main()
```
