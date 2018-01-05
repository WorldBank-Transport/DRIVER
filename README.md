# DRIVER
DRIVER - Data for Road Incident Visualization, Evaluation, and Reporting

[![Build Status](https://travis-ci.org/WorldBank-Transport/DRIVER.svg?branch=develop)](https://travis-ci.org/WorldBank-Transport/DRIVER)

## Developing

### Installation

1. Install Vagrant 1.5+

1. Install Ansible 1.8+

1. Install `vagrant-hostmanager` plugin via:

    ```
    vagrant plugin install vagrant-hostmanager
    ```

1. Create `gradle/data/driver.keystore`

    To run in development without support for JAR file building, `touch gradle/data/driver.keystore`. (If you just want to install the DRIVER web interface, do this. You can add Android integration later.)

    To build schema model JAR files for the Android app, copy the signing keystore to `gradle/data/driver.keystore`
    and set the password for the keystore under `keystore_password` in `deployment/ansible/group_vars/all`.

1. Copy `deployment/ansible/group_vars/all.example` to `deployment/ansible/group_vars/all`

1. Install [NFS](https://en.wikipedia.org/wiki/Network_File_System). On Debian/Ubuntu, run:

    ```
    sudo apt-get install nfs-common nfs-kernel-server
    ```

1. Clone the [Ashlar](https://github.com/azavea/ashlar) project such that it is a sibling of DRIVER (Ashlar is needed for generating dynamic schemas used by DRIVER).

    An example setup might be as follows:
    ```
    /home/username/
      git
        DRIVER
        ashlar
    ```

1. Run `vagrant up`

    If you run into issues provisioning the VMs or forget a step, try re-provisioning via `vagrant provision <vm-name>` as needed.

### Pickpoint

Obtain a pickpoint api key from https://pickpoint.io.

Copy `deployment/ansible/group_vars/all.example` to `deployment/ansible/group_vars/all`
and add the API key for pickpoint under `web_js_nominatim_key`.

### Running & Configuration

The app runs on localhost on port 7000. The schema editor is available at /editor/.

A default django superuser will be created, but only on a development provision:
  - username: `admin`
  - password: `admin`

A default OAuth2 application will be created, but only on a development provision.
Navigate to http://localhost:7000/o/applications/ to retrieve the client id/secret after
logging in via http://localhost:7000/admin/

### Frontend

For frontend development, ssh into the app vm with `vagrant ssh app`.

Then, the Angular schema editor is located at: `/opt/schema_editor`
The application Angular frontend is located at: `/opt/web`.

Both Angular apps can be run in development mode via:
```
./scripts/grunt.sh {editor,web} serve
```

The frontend app will be available on port 7002 and the schema editor will be available on port
7001. Both will reload automatically as changes are made.

To make requests to a Django runserver directly (for example, to perform interactive debugging in
the request-response cycle), run `./scripts/manage.sh runserver 0.0.0.0:8000`. You should then be
able to access the Django runserver on port 3001 of the `app` VM.

#### Updating existing translation files
New angular translation tokens should be added to i18n/exclaim.json with a value of "!<english>".
The English translation (en-us.json) is automatically built from exclaim.json. New tokens are also
propagated to other translations via a grunt task:

```
./scripts/grunt.sh web translate
```

#### Adding a new translation file
Place the new JSON file in the i18n folder. Add the file to the i18nForeignLanguages var in Gruntfile.js.
To enable the language to be selected via the language picker, add an item to the `languages` list in
`deployment/ansible/group_vars/all`. Setting `rtl` to true will enable right-to-left CSS changes.


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

### Boundaries

To load boundaries, upload the `regions.zip` and `states.zip` files to Ashlar.
Ashlar is runs on localhost:7001. For each file, first upload the file, then select
`name` as the display field, then hit save. Either refresh the page or
navigate somewhere else in between any two uploads.

### Records

A CSV of historical data can be downloaded from the project /data folder.
Good files are `<city or agency>_traffic.csv`.

Once the app has been built, this data can be loaded.

You will first have to obtain an authorization header. Log in to the web application.
Then open the network tab in web developer tools and reload the page. Inspect the request headers
from an API request and pull out the value of the `Authorization` header, for example
`Token f1acac96cc79c4822e9010d23ab425231d580875`.

Run `python scripts/load_incidents_v3.py --authz 'Token YOUR_AUTH_TOKEN' /path/to/directory_containing_incident_csvs`.
Note that the import process will take roughly two hours for the full data set; you can cut down the
number of records with `head` on the individual CSVs.

To load mock black spots, run `python scripts/load_black_spots.py --authz 'Token YOUR_AUTH_TOKEN' /path/to/black_spots.json`.

To load mock interventions, run `python scripts/load_interventions.py --authz 'Token YOUR_AUTH_TOKEN' /path/to/interventions_sample_pts.geojson`.

To generate black spot and load forecast training inputs, run `python scripts/generate_training_input.py /path/to/roads.shp /path/to/records.csv`.

### Costs

You can't request records with associated costs successfully until you configure some costs.
To do this, navigate to your editor (by default on `localhost:7001`), select "Incident" from
record types in the menu on the left. Select "Cost aggregation settings", then:

- choose a currency prefix in "Cost Prefix" (e.g., `$`, but anything is fine)
- Select "Incident Details" in "Related Content Type"
- Choose "Severity" in "Field"
- then decide how much money you think human lives, human physical security, and property are worth

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

## Releases

Releases use a `github_changelog_generator` tool written in `ruby`.

- make sure your `develop` is up-to-date
- `git flow release start <your release version>`
- `docker run -ti --rm -v ${PWD}:/changelog -w /changelog ruby:2.3 /bin/bash`
- From the container, `gem install github_changelog_generator`
- Then, to generate the changelog since the last release:

```bash
$ export RELEASE_VERSION=<your release version>
$ export LAST_RELEASE=<the most recent tag>
$ export GITHUB_TOKEN=<your github personal access token>
$ github_changelog_generator "WorldBank-Transport/DRIVER" \
      --token ${GITHUB_TOKEN} \
      --since-tag ${LAST_RELEASE} \
      --future-release ${RELEASE_VERSION} \
      --no-issues \
      --no-issues-wo-labels \
      --no-author
```

It's important to include the `since-tag` argument, since without it, the changelog generator
will include everything that went into 1.0.0, which is a lot of stuff and not super meaningful,
since `1.0.0` is "what was there when we decided to start using semantic versioning."

- include the CHANGELOG in your release branch
- `git flow release publish <your release version>`
- open a PR for your release
- Wait for a successful build and approval (from whom?), then:

```bash
$ git flow release finish <your release version>
$ git checkout master
$ git push origin master
$ git checkout develop
$ git push origin develop
$ git push [-s] --tags
```

:tada:
