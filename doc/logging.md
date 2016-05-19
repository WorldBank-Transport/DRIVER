# System administration: Logging

DRIVER is composed of a number of separate services; all of these services must be operating in
order for DRIVER to work properly. In order to diagnose potential problems with the system, it may
be necessary to use log files on the system to view output from these services.

## Database (PostgreSQL)
Database host

Path: `/var/log/postgresql/postgresql-9.4-main.log`

## Cache (Redis)
Database host

Path: `/var/log/redis/redis-server.log`

## Tile server (Windshaft)
App host

Path: `/var/log/upstart/windshaft.log`

## Web proxy (Nginx)
App host

Paths:
- `/var/log/nginx/driver-app.access.log` (log rotation appends `.1`, `.2`, etc.)
- `/var/log/nginx/error.log` (log rotation as above)

## Web application (Django)
App host

Path: `/var/log/upstart/driver-app.log`

## Android JAR creation (Gradle)
Celery host

Path: `/var/log/upstart/driver-gradle.log`

## File download server (Nginx)
Celery host

Paths:
- `/var/log/nginx/driver-celery.access.log` (log rotation appends `.1`, `.2`, etc)
- `/var/log/nginx/error.log` (log rotation as above)


## Scheduled tasks (cron)
Celery host

Path: `/var/log/driver-tasks/*.log`

## Asynchronous jobs (Celery)
This includes CSV exports and other asynchronous tasks triggered by the web UI and/or Android application.
Celery host

Path: `/var/log/upstart/driver-celery.log`
