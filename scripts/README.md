# Loading data for development

## Requirements

## OS-level requirements

- Python 2.x.
- Python bindings for GDAL (available on the [apt package index](https://packages.ubuntu.com/artful/python-gdal))
  as well as on [PyPi](https://pypi.org/project/GDAL/))

These OS-level requirements can be bootstrapped off of Azavea's GDAL docker
image ([code](https://github.com/azavea/docker-gdal),
[Quay repo](https://quay.io/repository/azavea/gdal?tag=latest&tab=tags)).

## Python requirements

- [python-dateutil](https://pypi.org/project/python-dateutil/)
- [pytz](https://pypi.org/project/pytz/)
- [requests](https://pypi.org/project/requests/)

## Script and schema dependencies

Certain ETL scripts and schemas in this repo depend on specific data
sources to run properly. Retrieve these dependencies from the fileshare and
make sure they exist in this repo before you load the data.

These dependencies include:

| script/schema | depends on |
| ------------- | --------------- |
| `pnp_incident_schema.json` | `incidents_and_sites.csv` |
| `pnp_incident_schema_v2.json` | 'public.csv' |
| `incident_schema_v3.json` | `data_for_v3` directory |
| `load_black_spots.py` | `black_spots.json` |
| `load_interventions.py | `interventions_sample_pts.geojson` |
| `generate_training_input.py` | `blackspot_training/roads_utm.*` and `blackspot_training/all_crashes_2008-2012.csv` |
