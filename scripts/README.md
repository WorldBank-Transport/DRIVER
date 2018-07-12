# Loading data for development

## Requirements

## OS-level requirements

- Python 2.7
- Python bindings for GDAL (available on the [apt package index](https://packages.ubuntu.com/artful/python-gdal))
  as well as on [PyPi](https://pypi.org/project/GDAL/))

These OS-level requirements can be bootstrapped off of Azavea's GDAL docker
image ([code](https://github.com/azavea/docker-gdal),
[Quay repo](https://quay.io/repository/azavea/gdal?tag=latest&tab=tags)).

## Python requirements

- [python-dateutil](https://pypi.org/project/python-dateutil/)
- [pytz](https://pypi.org/project/pytz/)
- [requests](https://pypi.org/project/requests/)

## Loading sample data

The `sample_data` directory provides two sample data files for testing purposes:

- `black_spots.json`: sample black spots
- `interventions_sample_pts.json`: sample interventions

Retrieve your auth token by inspecting network traffic, and then load these
files using the scripts in this directory:

```
python load_black_spots.py --authz 'Token YOUR_AUTH_TOKEN' sample_data/black_spots.json
```

```
python load_interventions.py --authz 'Token YOUR_AUTH_TOKEN' sample_data/interventions_sample_pts.geojson
```
