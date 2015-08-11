(function () {
    'use strict';

    function DriverResourcesMock () {

        var RecordResponse = {
            'count': 2,
            'next': null,
            'previous': null,
            'results': [
                {
                    'uuid': '35d74ce1-7b08-486b-b791-da9bc1e93cfb',
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
                    'label': 'testlabel',
                    'slug': 'testslug',
                    'geom': {
                        'type': 'Point',
                        'coordinates': [
                            25.0,
                            75.0
                        ]
                    },
                    'schema': 'db446730-3d6d-40b3-8699-0027205d54ed'
                },
                {
                    'uuid': '57dd6700-6e87-4110-ab11-dc7eefc50c96',
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
                        'Vehicle': []
                    },
                    'created': '2015-07-30T18:02:30.979249Z',
                    'modified': '2015-07-30T18:02:30.979305Z',
                    'occurred_from': '2015-07-30T18:02:30.944000Z',
                    'occurred_to': '2015-07-30T18:02:30.944000Z',
                    'label': 'testlabel',
                    'slug': 'testslug',
                    'geom': {
                        'type': 'Point',
                        'coordinates': [
                            0.0,
                            0.0
                        ]
                    },
                    'schema': 'db446730-3d6d-40b3-8699-0027205d54ed'
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

        return {
            PolygonResponse: PolygonResponse,
            RecordResponse: RecordResponse
        };
    }

    angular.module('driver.mock.resources', [])
    .factory('DriverResourcesMock', DriverResourcesMock);

})();
