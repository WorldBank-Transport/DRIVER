# DRIVER
DRIVER - Data for Road Incident Visualization, Evaluation, and Reporting

[![Build Status](https://travis-ci.org/WorldBank-Transport/DRIVER.svg?branch=develop)](https://travis-ci.org/WorldBank-Transport/DRIVER)

## Deploying

1. Follow the Installation instructions below
2. Follow the instructions in doc/system-administration.md

## Developing

### Installation

1. Install Vagrant 1.5+

1. Install Ansible 1.8+

1. Install `vagrant-hostmanager` plugin via:

    ```bash
    vagrant plugin install vagrant-hostmanager
    ```

1. Prevent changes in `group_vars/development` from being tracked by git.

    - You will likely make changes to `group_vars/development` to configure your local environment. To make sure you don't commit those changes unless you need to change the default development settings, you can make git not track changes to that file. To do this, run `git update-index --assume-unchanged deployment/ansible/group_vars/development`.
    - To revert back to tracking changes, run `git update-index --no-assume-unchanged deployment/ansible/group_vars/development`.

1. Create `gradle/data/driver.keystore`

    - To run in development without support for JAR file building:
      ```bash
      touch gradle/data/driver.keystore
      ```
      (If you just want to install the DRIVER web interface, do this. You can add Android integration later.)

    - To build schema model JAR files for the Android app, copy the signing keystore to `gradle/data/driver.keystore`
    and set the password for the keystore under `keystore_password` in `deployment/ansible/group_vars/development`.

1. (Optional) To enable geocoding, [set up Pickpoint in `group_vars/development`](#pickpoint)

1. Install [NFS](https://en.wikipedia.org/wiki/Network_File_System). On Debian/Ubuntu, run:

    ```bash
    sudo apt-get install nfs-common nfs-kernel-server
    ```

1. Start the Vagrant VM
    ```bash
    vagrant up
    ```

    If you run into issues provisioning the VMs or forget a step, try re-provisioning as needed:
    ```bash
    vagrant provision <vm-name>
    ```

### Pickpoint

Pickpoint is a geocoding service used by DRIVER to obtain lat/lon coordinates from input addresses. DRIVER can work without Pickpoint configured, but to enable geocoding, obtain a pickpoint API key from https://pickpoint.io and enter the key in `deployment/ansible/group_vars/development` under `web_js_nominatim_key`.

### Running & Configuration

The app is available on http://localhost:7000/, and the schema editor at http://localhost:7000/editor/.

In development environments a default Django superuser will be created for you:
  - Username: `admin`
  - Password: `admin`

### Google OAuth

To configure Google OAuth for development, follow [these steps](https://support.google.com/googleapi/answer/6158849?hl=en&ref_topic=7013279) to create a web application and credentials for your local DRIVER instance.

When creating a client ID for your web application, use these URLs:

**Authorized JavaScript origins**:

http://localhost:7000

**Authorized redirect URIs**:

http://localhost:7000/openid/callback/login/

Once you have the client ID and client secret, add those values to `deployment/ansible/group_vars/development` and reprovision the `app` VM  as needed:
```bash
vagrant provision app
```

### Frontend
Both Angular apps can be run in development mode via:
```bash
./scripts/grunt.sh editor serve
```
and
```bash
./scripts/grunt.sh web serve
```
You will need to run these commands in separate terminals if you'd like to have both running at the same time.

The frontend app will be available on port 7002 at http://localhost:7002 and the schema editor will be available on port
7001 at http://localhost:7001. Both will reload automatically as changes are made.

To make requests to a Django runserver directly (for example, to perform interactive debugging in
the request-response cycle), run:
```bash
./scripts/manage.sh runserver 0.0.0.0:8000
```
You should then be able to access the Django runserver on port 3001 of the `app` VM at http://localhost:3001.

Front end files are mounted inside the `app` Vagrant VM at `/opt/schema_editor` for the Angular editor and `/opt/web` for the Angular interface.

#### Updating existing translation files
New Angular translation tokens should be added to i18n/exclaim.json with a value of "!<english>".
The English translation (en-us.json) is automatically built from exclaim.json. New tokens are also
propagated to other translations via a grunt task:

```bash
./scripts/grunt.sh web translate
```

#### Adding a new translation file
Place the new JSON file in the i18n folder. Add the file to the i18nForeignLanguages var in Gruntfile.js.
To enable the language to be selected via the language picker, add an item to the `languages` list in
`deployment/ansible/group_vars/development`. Setting `rtl` to true will enable right-to-left CSS changes.


### Docker
To update the Docker container images to reflect environment changes (Such as changed Python packages), provision the `app` VM:
```bash
vagrant provision app
```

### Testing

#### Javascript
To run the Javascript automated tests, use:
```bash
./scripts/grunt.sh web test
```

## Testing Data

### Boundaries
Geographic boundaries are used to filter records to a defined area, such as a region or state. These boundaries are created by uploading shape files to the editor, http://localhost:7000/editor under "Add new geographies".

For developers at Azavea, use the `regions.zip` and `states.zip` files available in the DRIVER project folder on the fileshare. For non-Azavea users, upload a zipped shapefile containing the boundaries of the jurisdictions where you plan to operate DRIVER. If you don't have such a shapefile, [Natural Earth](https://www.naturalearthdata.com/features/) is a good place to start."

After uploading each the file, select `name` as the display field, then hit save. Either refresh the page or navigate somewhere else in between uploads.

### Records
Record data can be populated from a CSV file that contains named columns for `"lat"`, `"lon"`, and `"record_date"`. A file with semi-realistic data can be found in `scripts/sample_data/sample_traffic.csv` for use. For developers at Azavea, CSV files containing historical data can be downloaded from the `/data` folder of the project's directory in the fileshare, with names of the format `<city or agency>_traffic.csv`.

In order to import record data you will have to obtain an Authorization header and its API token. To do this, log in to the web application, then open the network tab in web developer tools and reload the page. Inspect the request headers
from an API request and pull out the value of the `Authorization` header, for example
`Token f1acac96cc79c4822e9010d23ab425231d580875`.

Using the API token, run:
```bash
python scripts/load_incidents_v3.py --authz 'Token <YOUR_AUTH_TOKEN>' scripts/sample_data/
```
Note that the import process will take roughly two hours for the full data set; you can cut down the
number of records with `head` on the individual CSVs.

The `load_incidents_v3.py` script will also create a schema for you. If you already have a schema in place, and simply want to load data associated with that schema, you will need to modify the script accordingly: change the `schema_id = create_schema(...)` line with `schema_id = 'replace-this-with-the-existing-schema-id'`.

To load mock black spots, run:
```bash
python scripts/load_black_spots.py --authz 'Token <YOUR_AUTH_TOKEN>' /path/to/black_spots.json
```
Mock black spot data is available in `scripts/sample_data/black_spots.json`.

To load mock interventions, run:
```bash
python scripts/load_interventions.py --authz 'Token <YOUR_AUTH_TOKEN>' /path/to/interventions_sample_pts.geojson
```
Mock intervention data is available in `scripts/sample_data/interventions_sample_pts.geojson`.

To generate black spot and load forecast training inputs, run:
```bash
python scripts/generate_training_input.py /path/to/roads.shp /path/to/records.csv
```

More information on the requirements for loading data can be found in the [`scripts/`
directory](./scripts/README.md).

### Costs

You can't request records with associated costs successfully until you configure some costs.
To do this, navigate to your editor (by default on http://localhost:7000/editor/), select "Incident" from
record types in the menu on the left. (If there are multiple record types named "Incident", delete all but one.) Select "Cost aggregation settings", then:

- Choose a currency prefix in "Cost Prefix" (e.g., `$`, but anything is fine)
- Select "Incident Details" in "Related Content Type"
- Choose "Severity" in "Field"
- Then decide how much money you think human lives, human physical security, and property are worth

## Production

TODO: Notes on creating a production superuser and adding a production OAuth2 application


## Using OAuth2 / Getting tokens

Get a token:
```bash
curl -X POST -d "grant_type=password&username=<user_name>&password=<password>" -u"<client_id>:<client_secret>" http://localhost:7000/o/token/
```

Returns:
```json
{
    "access_token": "<your_access_token>",
    "token_type": "Bearer",
    "expires_in": 36000,
    "refresh_token": "<your_refresh_token>",
    "scope": "read write groups"
}
```

Note: If you're experiencing SSL errors with cURL, your version of cURL may not have the right certificate authorities installed. Try passing the `-k` parameter to `curl`.

Making requests with a token:
```bash
# GET
curl -H "Authorization: Bearer <your_access_token>" http://localhost:7000:/api/record/
curl -H "Authorization: Bearer <your_access_token>" http://localhost:7000:/api/recordschema/
```

Restricted access (disabled in development to allow access to the browsable API):

Add an additional `scope` parameter to token request:
```bash
curl -X POST -d "grant_type=password&username=<user_name>&password=<password>&scope=read" -u"<client_id>:<client_secret>" http://localhost:7000/o/token/
```

Now, this token will have read-only access to the API.

## Releases

Releases use a `github_changelog_generator` tool written in `ruby`.

- Make sure your `develop` is up-to-date
- Start the Gitflow release:
    ```bash
    git flow release start <your release version>
    ```
-
    ```bash
    docker run -ti --rm -v ${PWD}:/changelog -w /changelog ruby:2.5 /bin/bash
    ```
- From the container:
    ```bash
    gem install github_changelog_generator
    ```
- Then, to generate the changelog since the last release:
    ```bash
    $ export RELEASE_VERSION=<your release version>
    $ export LAST_RELEASE=<the most recent tag>
    $ export GITHUB_TOKEN=<your github personal access token>
    $ github_changelog_generator "WorldBank-Transport/DRIVER" \
        --token ${GITHUB_TOKEN} \
        --since-tag ${LAST_RELEASE} \
        --future-release ${RELEASE_VERSION} \
        --base CHANGELOG.md \
        --no-issues \
        --no-issues-wo-labels \
        --no-author
    ```

It's important to include the `since-tag` argument, since without it, the changelog generator
will include everything that went into 1.0.0, which is a lot of stuff and not super meaningful,
since `1.0.0` is "what was there when we decided to start using semantic versioning."
Note: We've had some problems with the `since-tag` argument not being respected; if this happens,
manually delete the duplicate entries and update the GitHub diff link.

- Include the CHANGELOG in your release branch
- Git flow publish the release:
    ```
    git flow release publish <your release version>
    ```
- Open a PR for your release
- Wait for a successful build and approval (from whom?), then:
    ```bash
    $ git flow release finish <your release version>
    $ git checkout master
    $ git tag -f <your version>  # git-flow puts the tag on `develop`
    $ git push origin master
    $ git checkout develop
    $ git push origin develop
    $ git push [-s] --tags
    ```

:tada:
