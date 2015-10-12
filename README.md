# DRIVER
DRIVER - Data for Road Incident Visualization, Evaluation, and Reporting

[![Build Status](https://travis-ci.org/WorldBank-Transport/DRIVER.svg?branch=develop)](https://travis-ci.org/WorldBank-Transport/DRIVER)

## Developing

Requires Vagrant 1.5+, Ansible 1.8+ and the following plugins:
  - `vagrant-hostmanager`

Obtain a pickpoint api key from https://pickpoint.io.

Copy `deployment/ansible/group_vars/all.example` to `deployment/ansible/group_vars/all`
and add the API key for pickpoint under `web_js_nominatim_key`.

Install plugins before `vagrant up` via: `vagrant plugin install <plugin-name>`

The app runs on localhost on port 7000. The schema editor is available at /editor/.

A default django superuser will be created, but only on a development provision:
  - username: `admin`
  - password: `admin`

A default OAuth2 application will be created, but only on a development provision.
Navigate to http://localhost:7000/o/applications/ to retrieve the client id/secret after
logging in via http://localhost:70000/admin/

Requires [ashlar](https://github.com/azavea/ashlar/) to be available at the same level as
the DRIVER repository. Running `git clone https://github.com/azavea/ashlar/ && git clone
https://github.com/WorldBank-Transport/DRIVER` should be sufficient.

Then run `vagrant up` from the DRIVER repository.

For development, ssh into the app vm with `vagrant ssh app`.

Then, the Angular schema editor is located at: `/opt/schema_editor`
The application Angular frontend is located at: `/opt/web`.

Both Angular apps can be run in development mode via:
```
./scripts/grunt.sh {editor,web} serve
```

The frontend app will be available on port 7002 and the schema editor will be available on port
7001. Both will reload automatically as changes are made.

## Docker

As a shortcut to building the Docker container images contained within the `app`
virtual machine, use the `Makefile` at the root of the project:

```bash
export DOCKER_HOST=tcp://127.0.0.1:2375
make {all,app,editor,web}
```

This will make use of a Docker client installed on the virtual machine host,
telling it to communicate with the Docker daemon on the `app` virtual machine.

## Testing Data

A CSV of historical data can be downloaded from the project /data folder (accidents_and_sites.csv).

Once the app has been built, this data can be loaded by running
`python scripts/load_pnp_accidents.py /path/to/accidents_and_sites.csv`.
Note that the import process will take roughly two hours for the full data set; you can cut down the
number of records with `head`.

## Production

TODO: Notes on creating a production superuser and adding a production OAuth2 application


## Using OAuth2 / Getting tokens

Get a token:
```
curl -X POST -d "grant_type=password&username=<user_name>&password=<password>" -u"<client_id>:<client_secret>" http://localhost:7000/o/token/
```

Returns:
```
{
    "access_token": "<your_access_token>",
    "token_type": "Bearer",
    "expires_in": 36000,
    "refresh_token": "<your_refresh_token>",
    "scope": "read write groups"
}
```

Making requests with a token:
```
# GET
curl -H "Authorization: Bearer <your_access_token>" http://localhost:7000:/api/record/
curl -H "Authorization: Bearer <your_access_token>" http://localhost:7000:/api/recordschema/
```

Restricted access (disabled in development to allow access to the browsable API):

Add an additional `scope` parameter to token request:
```
curl -X POST -d "grant_type=password&username=<user_name>&password=<password>&scope=read" -u"<client_id>:<client_secret>" http://localhost:7000/o/token/
```

Now, this token will have read-only access to the API.


## Testing

### Javascript

First, ssh into the app vm: `vagrant ssh app`

Then, cd to the web dir and run the grunt tests: `cd /opt/web && grunt test`
