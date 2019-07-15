# Frequently asked questions

The goal of this document is to provide concise answers to commonly asked questions pertaining to setting up, deploying, and maintaining DRIVER. Many of these topics are covered more in-depth in other sections of the documentation, so please read through the complete set of documentation in order to gain a better understanding of the system.


## Sections
- [**Setup**](#setup)
- [**Deployment**](#deployment)
- [**Environment**](#environment)


## Setup

### Why aren't my files syncing with the VM?
If you're having problems with `nfs`, you can try changing `type: "nfs"` in the Vagrantfile to: `type: "vboxsf"`.

### How do I use the `load_incidents_v3` script with an existing schema?
Change the `schema_id = create_schema(...)` line with `schema_id = 'replace-this-with-the-existing-schema-id'`.

### Why am I seeing SSL errors when running `curl` commands?
Your version of cURL may not have the right certificate authorities installed. Try passing the `-k` parameter to `curl`.

### How can I make a field searchable?
You can change the field in the schema editor by going to https://[DRIVER domain]/editor/. Drop down "Incident" on the left side and go to "View Related Content". Then, click the "Edit" button on the group the field belongs to. In there each field has a checkbox for `Filterable/Searchable` that if checked it will become filterable (if a drop-down field) or searchable (if a text field).

### Why do I see an error fetching gpg key from keyserver while provisioning?
This comes up occasionally and is generally seend as transient issue, i.e., after running the command again, the issue would not show itself.

### Why do I see an error enabling firewall while provisioning: `For default, direction must be one of "outgoing", "incoming", and "routed"`
This is a known bug in Ansible 2.7.8. Try downgrading to the previous version of Ansible and reprovisioning

### Why do I see the JavaScript error: `Cannot read property 'uuid' of undefined`?
This can happen if no Record Type exists with the name configured in: `web_js_record_type_primary_label`. Make sure to update that group_var accordingly.

### Why do I see the JavaScript warnings: `No geographies returned`, `No boundaries returned`, or `No record types returned`?
Geographies, boundaries, and record types need to be configured within the schema editor before the application can be used.


## Deployment

### When deploying to production, do I need to install Vagrant on the servers?
Vagrant is not needed on the servers: it is only used locally to simulate having the 3 servers (VMs) on the development machine.

### Where are the Docker images hosted?
Docker images are currently being hosted on `quay.io`.

### Is there a bastion machine for AWS deployments?
The example CloudFormation template doesn't make use of a bastion machine: there are 3 machines (App, Celery, and Database), which each independently allow public SSH access.


## Environment

### What is the operating system on which the database server is hosted?
The operating system on all the machines is Ubuntu 14.04 (Linux).

### What database is used within DRIVER?
DRIVER uses PostgreSQL with the PostGIS extension.

### What is the main language/framework used to build this system?
DRIVER uses JavaScript, Python, HTML, CSS, and a small amount of Java and R. The front-end UI of the app uses the AngularJS v1.5 framework and the back-end uses the Django web framework.

### What is the client-side technology used by DRIVER?
HTML5 (consumed in any modern web browser) and a native Android app.

### What set of basemaps does DRIVER use?
The basemaps are using Carto. You should see requests to map tiles similar to `https://cartodb-basemaps-b.global.ssl.fastly.net/light_all/5/12/16.png` in your network tab.

### Does DRIVER have links to or interfaces with other systems?
DRIVER gathers crash records from its companion Android application, which runs on users' Android smartphones. It also interfaces with darksky.net, which is an API that provides weather information for the crash records. It pull street information from Open Street Map extracts from GeoFabrik. Pickpoint.io is used for geocoding and reverse geocoding. DRIVER grabs street-level images from Mapillary to display to the user. DRIVER uses a basemap tile service from Carto.

### Does DRIVER have News Feeds or Widgets (e.g. RSS, Twitter, Atom, etc.)?
No, there isn't any news feed integration.

### Does DRIVER have any type of authentication or access control mechanisms that will be present when the site is live and in production?
The site requires authentication to use. It offers two methods of authentication. One is username/password authentication. The second is Single Sign On that can be accessed if the user has a Google account. The SSO is achieved via the OAuth protocol. The site does not utilize 2FA/MFA. Once authentication has been achieved, the user receives a token that is used to authenticate each request to the site's API.

### What APIs does the Android app require access to?
The DRIVER Android app needs access to the camera API.
