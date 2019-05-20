# API Use Case &mdash; Health Organization

This document illustrates a use case for the DRIVER API where a health organization needs to interact with the API in order to perform a couple different tasks:

1. Obtain a list of recent accidents where a person involved was fatally injured. The results of this query may then be used to populate another system with this fatality information.
2. Search accidents for people in order to update their injury status within DRIVER. This is useful if a fatality was not observed at the scene of the accident, but occurred later within a hospital.


## Obtaining an API key

The first step in interacting with the API is to obtain an API key. The tasks discussed in this document require a user with a minimum of `analyst` credentials, which allow viewing the full set of record details (including information about involved people), as well as submitting an updated record back to the application.

Once logged into the web application, click your user email in the top navigation bar. Select `My Account` from the drop-down and the `Token` will be displayed when the page loads. Copy this token down, and use it in place of the `TOKEN` placeholder in the following examples.


## Schema assumptions

It is important to note that the DRIVER schema is dynamic and fields may change depending on how the system administrator has configured the schema. This document makes the following assumptions about a schema that may be used to enter accident information, but actual queries may need to be updated depending on the exact schema configuration:

1. The record type is named `Incident`.
2. There are two relevant sections of information within the `Incident` type: `incidentDetails`, and `person` (which is an array type containing one entry for each person involved).
3. The `incidentDetails` section contains a field for `Severity` &mdash; this field signifies the overall severity level of the incident and has an option for `Fatal`.
4. The `person` section contains a field for `Injury` which has an option for `Fatal`. It also has some other text fields for identifying a person: `Name`, `Address`, `License Number`, and `Hospital`.


## First task overview

In order to find a list of recent accidents where a person involved was fatally injured, the following sub-tasks need to be performed:

1. Determine record type uuid.
2. View schema configuration (optional).
3. Query for records with a `Severity` of `Fatal`.
4. Alternatively, query for records with a person having an `Injury` of `Fatal`.


## Obtaining the record type uuid

The record type uuid of the `Incident` record type may be obtained by querying the `recordtypes` endpoint with the `label` URL parameter set to the desired value: `Incident`. Setting `active` to `True` also ensures that only active record types will be returned. The cURL utility is used to demonstrate how to query the API, but it can be queried with any program that supports making HTTP calls. If you're experiencing SSL errors with cURL, your version of cURL may not have the right certificate authorities installed. Try passing the `-k` parameter to `curl`.

Also, the URL shown here,  `DRIVERURL`, is only a placeholder and should be replaced with the actual URL of the application. The same applies to the `TOKEN` placeholder, whose actual value was obtained earlier on in this document.

```
curl -H "Authorization: Token TOKEN" \
     "http://DRIVERURL/api/recordtypes/?active=True&label=Incident"
```

Issuing that query should result in a json response that resembles the following:

```
{
  "results": [
    {
      "active": true,
      "description": "Historical incident data",
      "plural_label": "Incidents",
      "label": "Incident",
      "modified": "2016-03-28T20:53:03.279107Z",
      "created": "2016-03-28T20:53:03.279082Z",
      "current_schema": "fada1575-4f61-4575-bc8d-8b260ef93c31",
      "uuid": "0e222fc7-fee3-454e-a2c8-3eda5b9ef922"
    }
  ],
  "previous": null,
  "next": null,
  "count": 1
}
```

The `results` array may now be inspected to retrieve the `uuid`, which in this example is `0e222fc7-fee3-454e-a2c8-3eda5b9ef922`. Store that value as it will be used in future queries. Also worth storing is the value of `current_schema`, which can be used to inspect the schema configuration. Note that there is a chance of multiple results being returned here. In that case, the `modified` date-time may be used to determine which is the most recent.


## Viewing the schema configuration

As noted above, the schema configuration is dynamic, and may be different than the example discussed in this document. In order to inspect the currently-configured schema for the record type, the `recordschemas` endpoint may be queried with the uuid of the `current_schema` of the record type.

```
curl -H "Authorization: Token TOKEN" \
     "http://DRIVERURL/api/recordschemas/fada1575-4f61-4575-bc8d-8b260ef93c31/"
```

An example response of this endpoint has been omitted due to its length, but the important piece to look for is under `schema` -> `definitions`. Here there are keys for each section of the schema. In this example case, that includes `person`, and `incidentDetails`, as well as any other sections that are defined.

Underneath each section, there is a `properties` key which contains the configuration values for all fields defined in that section. In this example, under the `person` section there are configuration values for the text fields: `Name`, `Address`, `License Number`, and `Hospital`. There is also a configuration value for `Injury`, which shows the valid options: `Fatal`, `Serious`, `Minor`, `Not injured`. The values defined within this schema may be used to perform API queries to precisely search for matching records.


## Querying for records with severity of fatal

The remaining queries in this document will use the `records` endpoint. The record type uuid from above will be used to limit the query results to the desired record type via the `record_type` parameter. It's also important to set the `archived` parameter to `False` to ensure no archived, i.e. deleted, records are returned.

The `occurred_min` and `occurred_max` parameters may be used to narrow down results to a specified date-time range, the format of these date-times being in the `ISO 8601` format. The final relevant URL parameter is `jsonb`, which can be supplied a json object that is used for filtering on the dynamic schema properties. Here we will be supplying a json object that targets the `Severity` field of `incidentDetails`, and ensures that only records marked as `Fatal` are returned.

The following query returns all records with a `Severity` of `Fatal` that occurred in January 2015 in the UTC timezone. Note that since some of the parameters contain characters that are invalid in URLs, they need to be URL-encoded.

```
curl -G -H "Authorization: Token TOKEN" \
    "http://DRIVERURL/api/records/" \
    --data-urlencode "archived=False" \
    --data-urlencode "occurred_max=2015-01-31T23:59:59.000Z" \
    --data-urlencode "occurred_min=2015-01-01T00:00:00.000Z" \
    --data-urlencode "record_type=0e222fc7-fee3-454e-a2c8-3eda5b9ef922" \
    --data-urlencode 'jsonb={"incidentDetails":{"Severity":{"_rule_type":"containment","contains":["Fatal"]}}}'
```

Here is an example snippet of the returned results:

```
{
  "results": [
    {
      "schema": "b9f5c292-7393-4f15-b298-7d1cf9c9a942",
      "archived": false,
      "location_text": null,
      "geom": {
        "coordinates": [
          121.07416391372679,
          14.648261075294313
        ],
        "type": "Point"
      },
      "occurred_to": "2015-01-25T19:20:00Z",
      "occurred_from": "2015-01-25T19:20:00Z",
      "modified": "2016-03-29T13:43:29.219230Z",
      "created": "2016-03-29T13:43:29.219207Z",
      "data": {
        "vehicle": [],
        "incidentDetails": {
          "_localId": "584967d5-5045-46da-9ef8-1a9eb0b57b7d",
          "Severity": "Fatal",
          "Description": ""
        },
        "person": []
      },
      "uuid": "1a46e29a-ce12-4e6f-b75f-307f11ba568b",
      "city": null,
      "city_district": null,
      "county": null,
      "neighborhood": null,
      "road": null,
      "state": null,
      "weather": "clear-night",
      "light": "night"
    },
    <OTHER RESULTS OMITTED>
  ],
  "previous": null,
  "next": null,
  "count": 4
}
```

The first record displayed in this result is a `Fatal` accident as expected, but unfortunately no `person` information was entered, so there is no personal information available for potential use in populating a health record database.


## Querying for records with a person having an injury of fatal

Since the system allows for entering `Fatal` records without necessarily requiring personal information to be entered, a more direct route for finding people who sustained a fatal injury may be to query the `person` section directly. Such a query looks very similar to the `incidentDetails` query, except for swapping `person` in place of `incidentDetails` and `Inury` in place of `Severity`.

One other important distinction is that since the `person` section is an array type, whereas `accidentDetails` is a singular type, a different `_rule_type` must be used to make this query: `containment_multiple`. Here is what the query looks like, along with an example result:

```
curl -G -H "Authorization: Token TOKEN" \
    "http://DRIVERURL/api/records/" \
    --data-urlencode "archived=False" \
    --data-urlencode "occurred_max=2015-01-31T23:59:59.000Z" \
    --data-urlencode "occurred_min=2015-01-01T00:00:00.000Z" \
    --data-urlencode "record_type=0e222fc7-fee3-454e-a2c8-3eda5b9ef922" \
    --data-urlencode 'jsonb={"person":{"Injury":{"_rule_type":"containment_multiple","contains":["Fatal"]}}}'
```

```
{
  "results": [
    {
      "schema": "fada1575-4f61-4575-bc8d-8b260ef93c31",
      "archived": false,
      "location_text": "Sumapa Ligas Road, Sumapang Matanda, Bulacan, Central Luzon, 3000, Philippines",
      "geom": {
        "coordinates": [
          120.82582890987396,
          14.858803025925443
        ],
        "type": "Point"
      },
      "occurred_to": "2015-01-02T06:33:13.947000Z",
      "occurred_from": "2015-01-02T06:33:13.947000Z",
      "modified": "2016-05-02T18:38:10.579733Z",
      "created": "2016-05-02T18:38:10.579710Z",
      "data": {
        "person": [
          {
            "_localId": "2457f168-3ab7-4a43-a7e6-5a7a1b144277",
            "License number": "7777777",
            "Name": "John Doe",
            "Age": "",
            "vehicle": "",
            "Sex": "Male",
            "Address": "123 Test St.",
            "Injury": "Fatal",
            "Hospital": "Test Hospital"
          },
          {
            "_localId": "922ed1f0-b08b-49e9-8861-8e28ac9ecd2b",
            "License number": "8888888",
            "Name": "Jane Doe",
            "Age": "",
            "vehicle": "",
            "Sex": "Female",
            "Address": "234 Test St.",
            "Injury": "Not injured",
            "Hospital": ""
          }
        ],
        "incidentDetails": {
          "Num vehicles": "",
          "Description": "",
          "Num passenger casualties": "",
          "Num driver casualties": "",
          "Main cause": "Vehicle defect",
          "Num pedestrian casualties": "",
          "_localId": "364ddb5f-50fc-4c3e-91fb-1fde47d437ad",
          "Severity": "Fatal",
          "Collision type": "Right angle"
        },
        "vehicle": [],
        "photo": []
      },
      "uuid": "a2b5586f-f77c-4fc0-bc3d-5c35167a6c54",
      "city": null,
      "city_district": null,
      "county": null,
      "neighborhood": null,
      "road": "Sumapa Ligas Road",
      "state": "Bulacan",
      "weather": "clear-day",
      "light": "day"
    }
  ],
  "previous": null,
  "next": null,
  "count": 1
}
```

One record has been returned, which contains two people. One of these people has an `Injury` listed as `Fatal`, so it is possible to use this information in order to populate a health record database.


## Second task overview

In order to search for specific people and update their information within DRIVER, the following sub-tasks need to be performed:

1. Determine record type uuid (already done in previous example).
2. Query for records using `person` fields.
3. Use the returned json object to submit a `PATCH` request to DRIVER.


## Searching for a specific person

Any of the fields defined in the schema can be queried against. This can be useful if some information is already known about a person, and one wants to check if that person exists within the DRIVER system. For example, if a name of a person is known, the `Name` field can be used in the `jsonb` parameter to search for a match. In order to search a text field, the syntax needed is the `pattern` attribute. For example, if records are needed that contain a person named "John Doe", a query can be constructed as follows:

```
curl -G -H "Authorization: Token TOKEN" \
    "http://DRIVERURL/api/records/" \
    --data-urlencode "archived=False" \
    --data-urlencode "occurred_max=2015-01-31T23:59:59.000Z" \
    --data-urlencode "occurred_min=2015-01-01T00:00:00.000Z" \
    --data-urlencode "record_type=0e222fc7-fee3-454e-a2c8-3eda5b9ef922" \
    --data-urlencode 'jsonb={"person":{"Name":{"_rule_type":"containment_multiple","pattern":"John Doe"}}}'
```

This query returns the same result record as in the previous example, since John Doe was one of the people involved. If multiple pieces of information are known about a person, they may all be supplied within the same query and results in order to narrow potential results. For example, if we want to find records involving "John Doe" where the hospital they were admitted to was "Test Hospital", the query would look as follows:

```
curl -G -H "Authorization: Token TOKEN" \
    "http://DRIVERURL/api/records/" \
    --data-urlencode "archived=False" \
    --data-urlencode "occurred_max=2015-01-31T23:59:59.000Z" \
    --data-urlencode "occurred_min=2015-01-01T00:00:00.000Z" \
    --data-urlencode "record_type=0e222fc7-fee3-454e-a2c8-3eda5b9ef922" \
    --data-urlencode 'jsonb={"person":{"Name":{"_rule_type":"containment_multiple","pattern":"John Doe"}, "Hospital":{"_rule_type":"containment_multiple","pattern":"Test Hospital"}}}'
```


## Updating a record within DRIVER

In the previous example, a query was constructed for finding a specific person. It is also possible to modify the data found in DRIVER by submitting `PATCH` queries. For example, if "John Doe" in the previous example was incorrectly marked as sustaining a `Fatal` injury, but it was actually a `Serious` injury, the record may be altered via a `PATCH` request.

In order to submit a `PATCH` request, the uuid of the record is needed. The previous response indicates that the uuid of this record is `a2b5586f-f77c-4fc0-bc3d-5c35167a6c54`, therefore we must submit a `PATCH` request to: "http://DRIVERURL/api/records/a2b5586f-f77c-4fc0-bc3d-5c35167a6c54". The request must contain the full json object retrieved in the original request, along with any desired modifications. Since in this example we only want to change the injury status of "John Doe" to `Serious`, only that one modification will be made and the `curl` command will look like:

```
curl -H "Authorization: Token TOKEN" \
     -H "Content-Type:application/json" \
     -X PATCH \
     "http://DRIVERURL/api/records/a2b5586f-f77c-4fc0-bc3d-5c35167a6c54/" \
     --data '{"uuid":"a2b5586f-f77c-4fc0-bc3d-5c35167a6c54","data":{"photo":[],"vehicle":[],"incidentDetails":{"Description":"","Num passenger casualties":"","Num driver casualties":"","Main cause":"Vehicle defect","Num pedestrian casualties":"","_localId":"364ddb5f-50fc-4c3e-91fb-1fde47d437ad","Severity":"Fatal","Collision type":"Right angle","Num vehicles":""},"person":[{"License number":"7777777","Name":"John Doe","Age":"","vehicle":"","Sex":"Male","Address":"123 Test St.","Injury":"Serious","Hospital":"Test Hospital","_localId":"2457f168-3ab7-4a43-a7e6-5a7a1b144277"},{"License number":"8888888","Name":"Jane Doe","Age":"","vehicle":"","Sex":"Female","Address":"234 Test St.","Injury":"Not injured","Hospital":"","_localId":"922ed1f0-b08b-49e9-8861-8e28ac9ecd2b"}]},"created":"2016-05-02T18:38:10.579710Z","modified":"2016-05-03T03:28:32.379533Z","occurred_from":"2015-01-02T06:33:13.947000Z","occurred_to":"2015-01-02T06:33:13.947000Z","geom":{"type":"Point","coordinates":[120.82582890987396,14.858803025925443]},"location_text":"Sumapa Ligas Road, Sumapang Matanda, Bulacan, Central Luzon, 3000, Philippines","city":null,"city_district":null,"county":null,"neighborhood":null,"road":"Sumapa Ligas Road","state":"Bulacan","weather":"clear-day","light":"dawn","archived":false,"schema":"fada1575-4f61-4575-bc8d-8b260ef93c31"}'
```

If the `PATCH` was successful, the updated record will be returned in the response, and it should contain the updates that have been made. Also, the HTTP status code of the request may be inspected. A successful status code is `200 OK`, whereas a request containing invalid data will return with the status code `400 BAD REQUEST`. Within `curl`, these status codes are displayed when enabling verbose mode via the `-v` argument.


## Troubleshooting

*   Received error "Failed to connect" or "Connection refused".

    Ensure the protocol of the DRIVER URL is correct (http vs. https depending on configuration).


*   Received error "JSON parse error" on `PATCH` request.

    Ensure the JSON data being sent is valid. It can be run through a json validator program in order to help spot problems.


*   Received error "Authentication credentials were not provided".

    Ensure the `Authorization` header is present, and that the actual token is prepended with the text "Token ".
