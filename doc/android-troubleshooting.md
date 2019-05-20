# Troubleshooting Android app issues

## Introduction
DRIVER can be optionally used in tandem with an Android-based data collection application to enable
users in the field to easily submit data to the DRIVER platform. Integrating the Android app with a
specific installation of DRIVER requires some configuration. This document provides a guide to
troubleshooting some of the most common problems with the Android application.

## Table of Contents
- [**Prerequisites**](#prerequisites)
- [**Troubleshooting instructions**](#troubleshooting-instructions)
  - [**Symptom: Logging in to the app with username and password doesn't work**](#symptom-logging-in-to-the-app-with-username-and-password-doesnt-work)
  - [**Symptom: Logging in to the app with Google doesn't work.**](#symptom-logging-in-to-the-app-with-google-doesnt-work)
  - [**Symptom: Uploading records from the app doesn't work.**](#symptom-uploading-records-from-the-app-doesnt-work)
  - [**Symptom: Updating the schema on the app doesn't work.**](#symptom-updating-the-schema-on-the-app-doesnt-work)
  - [**Symptom: Updating the schema always returns the message "Schema update is not ready yet"**](#symptom-updating-the-schema-always-returns-the-message-schema-update-is-not-ready-yet)

## Prerequisites
This document assumes that you are able to build a copy of the Android app and install it on an
Android device, and that you have a working installation of DRIVER running at a publicly-available
domain name.

If you are missing one or both of these prerequisites, please read and follow the DRIVER [system
administration](https://github.com/WorldBank-Transport/DRIVER/blob/master/doc/system-administration.md#system-administration-and-troubleshooting)
instructions in this repository to set up a DRIVER instance. You will also need to
read and follow the instructions in the
[README](https://github.com/WorldBank-Transport/DRIVER-Android#driver-android-android-client-for-adding-driver-records) for the DRIVER Android app.

## Troubleshooting instructions
### Symptom: Logging in to the app with username and password doesn't work
### Troubleshooting steps
1. Check whether you can log into the DRIVER web interface using the same credentials.
    - If this fails, use an administrator account to add a new user or change the user's password.
2. Check whether you can access the DRIVER web interface using the phone's built-in browser
    - If this fails, enable internet on the phone, and make sure that the DRIVER instance has a
      domain name that is publicly accessible.
3. Check that the domain name of the DRIVER web app is set in `app/src/main/res/values/configurables.xml` in the
  DRIVER-Android project, under `api_server_url`.
    - If the domain names don't match, update `configurables.xml` and rebuild the Android app.

### Symptom: Logging in to the app with Google doesn't work.
### Troubleshooting steps
1. Check whether signing in using Google works from the web interface
    - If this fails, follow the instructions for [OIDC
      Settings](https://github.com/WorldBank-Transport/DRIVER/blob/master/deployment/ansible/group_vars/production.example)
      and then re-provision the application
2. Check that `oauth_client_id` is correctly set in `configurables.xml`
    - If it is not set or you are unsure whether it is correct, follow the instructions for [Setting
      up Google Sign-In](https://github.com/WorldBank-Transport/DRIVER-Android#setting-up-google-sign-in)
3. Perform troubleshooting steps 2 and 3 for username and password login problems, above.

### Symptom: Uploading records from the app doesn't work.
### Troubleshooting steps
1. Use the user management web interface to check whether the user is in the Analyst group or higher
    - If the user is in the Viewers group, assign the account to the Analyst group
2. Perform steps 2 and 3 for username and password login problems, above.

### Symptom: Updating the schema on the app doesn't work.
### Troubleshooting steps
1. Check whether the primary record type label in the app is "Incidents".
    - If the record type is not "Incidents", edit
      [CheckSchemaTask.java](https://github.com/WorldBank-Transport/DRIVER-Android/blob/develop/app/src/main/java/org/worldbank/transport/driver/tasks/CheckSchemaTask.java#L33)
to match the name of the record type and rebuild the app.
2. Perform steps 2 and 3 for username and password login problems, above, to ensure that the phone
can access the DRIVER website.

### Symptom: Updating the schema always returns the message "Schema update is not ready yet"
### Troubleshooting steps
1. Check whether the server which hosts the Celery and batch tasks is running
    - If it is not, start it
2. SSH into the batch server and run the following command: `sudo service driver-gradle status`
    - If you do not see `driver-gradle start/running`, run `sudo service driver-gradle start`
3. SSH into the batch server and run the following command: `ls -l /opt/gradle/data`
    - If you do not see a line for `driver.keystore`, follow the [installation instructions](https://github.com/WorldBank-Transport/DRIVER#installation) to add the keystore file and its password to the DRIVER configuration, and then redeploy the batch server.
4. SSH into the batch server and run the following command `sudo tail -f /var/log/upstart/driver-gradle.log`, and then try to update the schema again.
    - If you do not see any changes to the file, try restarting the Celery and Redis services. Otherwise, you should see output that will describe any problems that were encountered when attempting to process the schema update request. Please [open an issue](https://github.com/WorldBank-Transport/DRIVER/issues) with this log output and a description of your problem.
