
(function () {
    'use strict';

    function ResourcesMock () {
        var RecordSchemaResponse = {
            'count': 1,
            'next': null,
            'previous': null,
            'results': [
                {
                    'uuid': '80c10057-2cfc-4a32-8e3c-0573e8bf8f3f',
                    'schema': {
                        // Note: the format of this is still in flux and will change a bit
                        'description': '',
                        'title': '',
                        'plural_title': '',
                        'definitions': {
                            'Firearm': {
                                'description': 'Guns and other projectiles.',
                                'title': 'Firearm',
                                'plural_title': 'Firearms',
                                'definitions': {},
                                'type': 'object',
                                'properties': {}
                            }
                        },
                        'type': 'object',
                        'properties': {}
                    },
                    'created': '2015-05-13T21:44:28.324760Z',
                    'modified': '2015-05-13T21:44:28.324819Z',
                    'version': 2,
                    'next_version': null,
                    'record_type': '15460346-65d7-4f4d-944d-27324e224691'
                }
            ]
        };

        var RecordTypeResponse = {
            'count': 2,
            'next': null,
            'previous': null,
            'results': [
                {
                    'uuid':'15460346-65d7-4f4d-944d-27324e224691',
                    'current_schema':'80c10057-2cfc-4a32-8e3c-0573e8bf8f3f',
                    'created':'2015-05-13T21:43:29.227598Z',
                    'modified':'2015-05-13T21:43:29.227639Z',
                    'label':'Accident',
                    'plural_label':'Accidents',
                    'description':'An accident.',
                    'active':true
                },
                {
                    'uuid':'1a8232f4-2fe8-4df0-9c78-786f666b3551',
                    'current_schema':'311791af-409e-40ac-8209-fe9785469479',
                    'created':'2015-05-13T21:43:45.242844Z',
                    'modified':'2015-05-13T21:43:45.242894Z',
                    'label':'Bird Sighting',
                    'plural_label':'Bird Sightings',
                    'description':'Birds and their environments.',
                    'active':true
                }
            ]
        };

        var module = {
            RecordSchemaResponse: RecordSchemaResponse,
            RecordTypeResponse: RecordTypeResponse
        };
        return module;
    }

    angular.module('ase.mock.resources', [])
    .factory('ResourcesMock', ResourcesMock);

})();
