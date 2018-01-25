# System administration and troubleshooting

The goal of this document is to provide enough information to allow a system administrator to maintain a production DRIVER system, and to aid in troubleshooting if something goes wrong. This assumes a production system has already been deployed using the default configuration.


## General system architecture

The default DRIVER production setup consists of three servers, all running Ubuntu 14.04 LTS:

1. Database host
   * [PostgreSQL](https://www.postgresql.org/) database for storing data
   * [Redis](http://redis.io/) service for caching temporary data
2. App host
   * [Django](https://www.djangoproject.com/) application backend
   * [Nginx](https://www.nginx.com/) web proxy for routing requests
   * [Gunicorn](http://gunicorn.org/) for interfacing between `Nginx` and `Django`
   * [Windshaft](https://github.com/CartoDB/Windshaft) for serving map tiles
3. Celery host
   * `Nginx` web proxy for serving file downloads
   * [Celery](http://www.celeryproject.org/) workers for processing asynchronous and batch requests
   * [Gradle](http://gradle.org/) service for Android JAR creation

Each of these servers also includes:
   * [Monit](https://mmonit.com/monit/) service for monitoring and restarting services
   * Firewall configuration via [ufw](https://help.ubuntu.com/community/UFW)
   * Logs for each locally running service, see [logging.md](logging.md) for details


## Deploying updates

Deploying updates to production is done using [Ansible](https://www.ansible.com/) (version must be at minimum 1.8). An `ansible-playbook` command is run, which uses the local configuration of the application files in the `deployment` directory to deploy updates to the remote servers. It is not necessary to have the application running locally, but it is necessary to have the source code for the version you want to deploy, so make sure to pull down the latest version via `git pull` and then `git checkout tags/<version>`.

### Manual configuration

In addition to the latest source code, there are four files not checked in to the repository that are needed in order to successfully deploy. These files are as follows:

1. `production` group_vars - Defines the configured settings for the system. Must be placed in: `deployment/ansible/group_vars/`.
   Copy from deployment/ansible/group_vars/production.example and fill in the blanks.
  - Make sure to edit the `app_version` flag at the top of the `production` group_vars file to specify the version of the app you want to deploy
  - Check out that tag with `git checkout tags/<version>`
2. `production` inventory - Defines the remote servers where code will be deployed. Must be placed in: `deployment/ansible/inventory/`.
3. `driver.keystore` - The signing keystore required for building Android APKs. Must be placed in: `gradle/data/`.
4. ssh identity file - The private key used for logging into the servers. This does not need to be placed in a particular location, but must be added via `ssh-add` before starting the deploy, so commands may be run on remote machines.

These files are created while configuring the application, and contain sensitive information. They should only be supplied to administrators that will need to deploy updates to the application.

### Configuration wizard

In addition to a fully manual deployment, you can run the setup wizard at `scripts/setup` (requires Python 3.6 and pip). The wizard will generate barebones versions of the necessary files for you (`deployment/ansible/group_vars/production` and `deployment/ansible/inventory/production`). You will still need to edit these files as per the environment and locale but the wizard can be helpful in getting started.

### Deploy

Once the files are in place, deployment may be performed by opening a terminal, switching to the directory of the DRIVER source code and running the command (NOTE: Make sure to change the `user` argument to a user that has sudo privileges on those servers):
```
ansible-playbook -i deployment/ansible/inventory/production --user=ubuntu \
    deployment/ansible/database.yml \
    deployment/ansible/app.yml \
    deployment/ansible/celery.yml
```

At some point it may be desirable to modify some of the configuration values found in the `production` group_vars file, or similarly, to update the server configuration in the `production` inventory file. The following are links to the `Ansible` documentation for an in-depth description of how to use inventories and variables:
 * [Ansible inventory documentation](http://docs.ansible.com/ansible/intro_inventory.html)
 * [Ansible variables documentation](http://docs.ansible.com/ansible/playbooks_variables.html)


## Using Monit to restart services

`Monit` has an easy to use web interface for monitoring and managing the services on each machine. It may be accessed by browsing to `http://<IP_OF_THE_SERVER>:2812` and entering the supplied administrator username and password. For security reasons, the web interface is only accessible by users with IPs configured in the `monit_allow_hosts` section of the `production` group_vars file. If an administrator needs access to this interface, their IP must be added to this list.

Once logged into the interface, it is possible to see the overall status of the server via statistics on CPU, Memory, and Swap usage. There are also line items for each relevant service running. A status of `Status ok` or `Running` indicates the service is healthy. Other status messages (such as `Not monitored`) will be displayed when there is a problem. In such a scenario, it's possible to restart the service from the `Monit` interface by clicking on the name of the service to enter the service details mode, and then clicking `Start service`. None of the services listed within the `Monit` interface are optional. They are all required for the DRIVER system to be fully functional, so anything that's not listed as healthy needs to be restarted.


## Logging into servers and viewing logs

`Monit` should be the first line of troubleshooting, due to its ease of use in quickly diagnosing an issue and restarting a failed service, however it may occasionally be necessary to log into the servers themselves in order to fix a problem. For example, if after restarting a failed service via `Monit`, it fails to become healthy. In such a scenario, the individual servers may be logged into via the command:
`ssh -i <location of ssh identify file> <username>@<server IP>`

Once logged into the desired server, the log files may be examined by using `tail`, `nano`, `vim`, or any other desired method of viewing log content. See [logging.md](logging.md) for detailed information of where specific log files are located. Examination of the log files will most likely lead to the underlying problem which will need to be fixed. Once the problem has been fixed, the failing service may be restarted by either using `Monit`, as described above, or by restarting the service manually via the `service` command. For example, restarting `nginx` can be done by executing the command: `sudo service nginx restart`. Many of the custom services running in `DRIVER` start with the `driver-` prefix, and can be found by running the command `initctl list | grep driver`. If after that command is run, the web application (`driver-app`) is shown as stopped, and needs to be restarted, the command to do so would be: `sudo service driver-app restart`.


## Firewall configuration

Each server has firewall rules applied which limit access by IPs and ports. The current firewall configuration can be viewed by running the command `sudo ufw status`. If any server IPs are modified, the firewall rules will need to be updated as well. This may be done manually via `ufw` commands, but the best way to accomplish this is probabaly updating the firewall IP address configuration in the `production` group_vars file and running the deployment script. The current firewall rules are as follows:

 * App host - http[s] is allowed
 * Celery host - http[s] is allowed only from App host servers (e.g. for CSV downloads)
 * Database host - PostgreSQL and redis connections are allowed from App and Celery hosts.
 * SSH is allowed
 * Everything else is blocked

In order to diagnose issues with the firewall, it may be necessary to disable it temporarily. This may be done with the command: `sudo ufw disable`. And it may be re-enabled with the command `sudo ufw enable`.


## SSL certificate configuration

The web server is configured with an SSL certificate which has been automatically obtained using [letsencrypt](https://letsencrypt.org/). This certificate is valid for a period of 90 days, at which point a new SSL certificate must be obtained. There is a `cron` task on the App host which does this automatically. It runs once per day, and checks the age of the certificate. Once it is 60 days old, the cerficate will be renewed. This should happen automatically, but if it doesn't happen, users of the application will start to see invalid SSL certificate warnings in their browsers.

In the case of a problem, the cron task should be checked. This can be examined by running the commands:
```
sudo crontab -l
```

There should be an entry for `cd /var/lib/letsencrypt && ./renew-certs.py`. That command may be run manually as the root user in order to help diagnose an error with SSL certification renewal.


## Cleaning up after Docker

[Docker](https://www.docker.com/) is used in several places with the DRIVER sytem to keep services separated out and running in their own containers. `Docker` keeps around old cached layers, which take up a lot of disk space. If the disk is getting low, it may be helpful to clear this cache. This can be done by executing the commands:
```
sudo su -
docker images --no-trunc| grep none | awk '{print $3}' | xargs -r docker rmi
```

This is helpful as a short-term workaround for clearing up some disk space, but if it is encountered, it probably means it's a good time to allocate more space to the disk.
