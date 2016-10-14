(function () {
    'use strict';

    function DriverResourcesMock () {

        var RecordList = [
            {
                'uuid': '35d74ce1-7b08-486b-b791-da9bc1e93cfb',
                'archived': false,
                'data': {
                    'Person': [],
                    'Crime Details': {
                        'County': 'Philadelphia',
                        'Description': 'First test',
                        'District': '13',
                        '_localId': 'e116f30b-e493-4d57-9797-a901abddf7d5'
                    },
                    'Vehicle': []
                },
                'created': '2015-07-30T17:36:29.483160Z',
                'modified': '2015-07-30T17:36:29.483206Z',
                'occurred_from': '2015-07-30T17:36:29.263000Z',
                'occurred_to': '2015-07-30T17:36:29.263000Z',
                'geom': {
                    'type': 'Point',
                    'coordinates': [
                        25.0,
                        75.0
                    ]
                },
                'location_text': '',
                'schema': 'db446730-3d6d-40b3-8699-0027205d54ed'
            },
            {
                'uuid': '57dd6700-6e87-4110-ab11-dc7eefc50c96',
                'archived': false,
                'data': {
                    'Person': [
                        {
                            'Last name': 'John',
                            'First name': 'Smith',
                            'Street address': '3 Test St.',
                            '_localId': '4cde1cc9-2cd2-487b-983d-ae1de1d6198c'
                        },
                        {
                            'Last name': 'Jane',
                            'First name': 'Doe',
                            'Street address': '4 Test Ln.',
                            '_localId': 'b383cf8c-95f2-46de-aaed-d05115db8d4d'
                        }
                    ],
                    'Crime Details': {
                        'County': 'Philadelphia',
                        'Description': 'Second test',
                        'District': '14',
                        '_localId': '2382abab-0958-4aef-a1f6-ccca379ae9a4'
                    },
                    'location_text': '',
                    'schema': 'db446730-3d6d-40b3-8699-0027205d54ed'
                }
            },
            {
                "uuid": "80621b6f-4036-45c5-940b-796f23ea0185",
                "data": {
                    "interventionDetails": {
                        "Type": "Intersection - Roundabout",
                        "_localId": "dddb643b-18ae-4b3d-8eba-e3d59c7fb14f"
                    }
                },
                "created": "2016-02-02T19:11:00.479893Z",
                "modified": "2016-02-02T19:11:00.479924Z",
                "occurred_from": "2016-02-02T06:11:00.395264Z",
                "occurred_to": "2016-02-02T06:11:00.395273Z",
                "geom": {
                    "type": "Point",
                    "coordinates": [
                        121.03756381620197,
                        14.644203676970669
                    ]
                },
                "location_text": null,
                "city": null,
                "city_district": null,
                "county": null,
                "neighborhood": null,
                "road": null,
                "state": null,
                "weather": null,
                "light": null,
                "schema": "d71e6475-e328-41d3-8e1f-556ab4145129"
            }
        ];

        var RecordResponse = {
            'count': 3,
            'next': null,
            'previous': null,
            'results': RecordList
        };

        var BoundaryResponse = {
            "count": 1,
            "next": null,
            "previous": null,
            "results": [
                {
                    "uuid": "ce9b10ef-1cec-46e9-8a0b-4c7d9c0881ab",
                    "label": "admin zero",
                    "color": "#fffff",
                    "display_field": "",
                    "data_fields": [
                        "GADMID",
                        "ISO",
                        "NAME_ENGLI",
                        "NAME_ISO",
                        "NAME_FAO",
                        "NAME_LOCAL",
                        "NAME_OBSOL",
                        "NAME_VARIA",
                        "NAME_NONLA",
                        "NAME_FRENC",
                        "NAME_SPANI",
                        "NAME_RUSSI",
                        "NAME_ARABI",
                        "NAME_CHINE",
                        "WASPARTOF",
                        "CONTAINS",
                        "SOVEREIGN",
                        "ISO2",
                        "WWW",
                        "FIPS",
                        "ISON",
                        "VALIDFR",
                        "VALIDTO",
                        "AndyID",
                        "POP2000",
                        "SQKM",
                        "POPSQKM",
                        "UNREGION1",
                        "UNREGION2",
                        "DEVELOPING",
                        "CIS",
                        "Transition",
                        "OECD",
                        "WBREGION",
                        "WBINCOME",
                        "WBDEBT",
                        "WBOTHER",
                        "CEEAC",
                        "CEMAC",
                        "CEPLG",
                        "COMESA",
                        "EAC",
                        "ECOWAS",
                        "IGAD",
                        "IOC",
                        "MRU",
                        "SACU",
                        "UEMOA",
                        "UMA",
                        "PALOP",
                        "PARTA",
                        "CACM",
                        "EurAsEC",
                        "Agadir",
                        "SAARC",
                        "ASEAN",
                        "NAFTA",
                        "GCC",
                        "CSN",
                        "CARICOM",
                        "EU",
                        "CAN",
                        "ACP",
                        "Landlocked",
                        "AOSIS",
                        "SIDS",
                        "Islands",
                        "LDC",
                        "Shape_Leng",
                        "Shape_Area"
                    ],
                    "errors": null,
                    "created": "2015-09-11T15:07:54.893439Z",
                    "modified": "2015-09-11T15:07:56.876548Z",
                    "status": "COMPLETE",
                    "source_file": "http://localhost:7000/media/boundaries/2015/09/11/PHL_adm0.zip"
                }
            ]
        };

        var PolygonResponse = {
            'count': 3,
            'next': null,
            'previous': null,
            'results': {
                'type': 'FeatureCollection',
                'features': [
                    {
                        'id': '8275cda9-ba6a-493b-9fb1-409dd8659a43',
                        'type': 'Feature',
                        'geometry': {
                            'type': 'MultiPolygon',
                            'coordinates': [[[
                                [-75.18023798707824, 39.98634201985354],
                                [-75.17990304282124, 39.986089975971524],
                                [-75.17970297881145, 39.98593905049045],
                                [-75.17957996535179, 39.98584695753356],
                                [-75.18023798707824, 39.98634201985354]
                            ]]]
                        },
                        'properties': {
                            'data': {
                                'name': 'Polygon #1'
                            },
                            'created': '2015-08-10T12:21:23.912703Z',
                            'modified': '2015-08-10T12:21:23.912941Z'
                        }
                    },
                    {
                        'id':'7d6445ee-fcdb-4a6a-ba5c-3867bc3494d0',
                        'type': 'Feature',
                        'geometry': {
                            'type': 'MultiPolygon',
                            'coordinates': [[[
                                [-75.28023798707824, 39.98634201985354],
                                [-75.27990304282124, 39.986089975971524],
                                [-75.27970297881145, 39.98593905049045],
                                [-75.27957996535179, 39.98584695753356],
                                [-75.28023798707824, 39.98634201985354]
                            ]]]
                        },
                        'properties': {
                            'data': {
                                'name': 'Polygon #2'
                            },
                            'created': '2015-08-20T12:21:23.912703Z',
                            'modified': '2015-08-20T12:21:23.912941Z'
                        }
                    },
                    {
                        'id':'351da4bf-f705-4178-a156-3b7593a2adde',
                        'type': 'Feature',
                        'geometry': {
                            'type': 'MultiPolygon',
                            'coordinates': [[[
                                [-75.38023798707824, 39.98634201985354],
                                [-75.37990304282124, 39.986089975971524],
                                [-75.37970297881145, 39.98593905049045],
                                [-75.37957996535179, 39.98584695753356],
                                [-75.38023798707824, 39.98634201985354]
                            ]]]
                        },
                        'properties': {
                            'data': {
                                'name': 'Polygon #3'
                            },
                            'created': '2015-08-30T12:21:23.912703Z',
                            'modified': '2015-08-30T12:21:23.912941Z'
                        }
                    }
                ]
            }
        };

        var SavedFiltersResponse = {
            'count': 5,
            'next': null,
            'previous': null,
            'results': [
                {
                    'uuid': '89ef93ac-e011-4ca1-bec7-4dbbb8cb63a9',
                    'filter_json': {
                        'Incident Details#Severity': {
                            'contains': [
                                'Injury'
                            ],
                            '_rule_type': 'containment'
                        }
                    },
                    'label': 'Injury filter',
                    'owner': 1
                },
                {
                    'uuid': '4a270f45-eaf6-4c04-aeb7-1ee78998a38e',
                    'filter_json': {
                        'Incident Details#Severity': {
                            'contains': [
                                'Injury'
                            ],
                            '_rule_type': 'containment'
                        },
                        'Incident Details#Num driver casualties': {
                            '_rule_type': 'intrange',
                            'min': 2
                        }
                    },
                    'label': 'Injury with min casualties filter',
                    'owner': 1
                },
                {
                    'uuid': 'ec6b4c9a-4527-4abc-b943-3ab576da0070',
                    'filter_json': {
                        'Incident Details#Severity': {
                            'contains': [
                                'Injury'
                            ],
                            '_rule_type': 'containment'
                        },
                        'Incident Details#Num driver casualties': {
                            'max': 4,
                            '_rule_type': 'intrange',
                            'min': null
                        }
                    },
                    'label': 'Injury with max casualties filter',
                    'owner': 1
                },
                {
                    'uuid': 'f5779d32-a3e4-49a1-9e84-cb76c157589e',
                    'filter_json': {
                        'Incident Details#Severity': {
                            'contains': [
                                'Injury'
                            ],
                            '_rule_type': 'containment'
                        },
                        'Incident Details#Num driver casualties': {
                            'max': 4,
                            '_rule_type': 'intrange',
                            'min': 1
                        }
                    },
                    'label': 'Injury with casualty range',
                    'owner': 1
                },
                {
                    'uuid': '0a1235a1-fd2b-49d2-986d-81d677d546f1',
                    'filter_json': {
                        'Incident Details#Main cause': {
                            'contains': [
                                'Vehicle defect'
                            ],
                            '_rule_type': 'containment'
                        },
                        'Incident Details#Weather': {
                            'contains': [
                                'Wind'
                            ],
                            '_rule_type': 'containment'
                        },
                        'Incident Details#Num driver casualties': {
                            'max': 4,
                            '_rule_type': 'intrange',
                            'min': 1
                        },
                        'Incident Details#Severity': {
                            'contains': [
                                'Injury'
                            ],
                            '_rule_type': 'containment'
                        },
                        'Incident Details#Collision type': {
                            'contains': [
                                'Right angle'
                            ],
                            '_rule_type': 'containment'
                        }
                    },
                    'label': 'Very specific filter',
                    'owner': 1
                }
            ]
        };

        var SSOClientsResponse = {
            'clients': ['google.com']
        };

        var BlackspotSetResponse = {
            results: [{
                uuid: 'uuid'
            }]
        };

        var BlackspotResponse = {
            results: [{
                uuid: 'uuid',
                severity_score: 'severity_score',
                num_records: 'num_records',
                num_severe: 'num_severe'
            }]
        };

        var DuplicatesResponse = {
            'count': 1,
            'next': null,
            'previous': null,
            'results': [
                {
                    uuid: '0cf5604a-a743-4c30-9fc2-a8820d543fd8',
                    created: '2016-02-03T19:20:31.266354Z',
                    modified: '2016-02-08T14:51:51.169961Z',
                    score: 0.0,
                    resolved: false,
                    job: '05b59583-2776-458c-835d-b7747a82b7d9',
                    record: RecordList[0],
                    duplicate_record: RecordList[1]
                }
            ]
        };

        return {
            BoundaryResponse: BoundaryResponse,
            PolygonResponse: PolygonResponse,
            RecordResponse: RecordResponse,
            SavedFiltersResponse: SavedFiltersResponse,
            SSOClientsResponse: SSOClientsResponse,
            BlackspotSetResponse: BlackspotSetResponse,
            BlackspotResponse: BlackspotResponse,
            DuplicatesResponse: DuplicatesResponse
        };
    }

    angular.module('driver.mock.resources', [])
    .factory('DriverResourcesMock', DriverResourcesMock);

})();
