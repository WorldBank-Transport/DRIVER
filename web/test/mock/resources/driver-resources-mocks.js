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

        return {
            RecordResponse: RecordResponse
        };
    }

    angular.module('driver.mock.resources', [])
    .factory('DriverResourcesMock', DriverResourcesMock);

})();
