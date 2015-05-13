
(function () {
    'use strict';

    function ResourcesMock () {
        var RecordTypeResponse = {
            'count': 1,
            'next': null,
            'previous': null,
            'results': [
                {
                    'uuid': '362be38f-9110-4b8f-83a5-4280251483a1',
                    'current_schema': '3ba9bc8f-7e4a-490e-8a14-666808711b10',
                    'created': '2015-05-12T17:41:09.357521Z',
                    'modified': '2015-05-12T17:41:09.357562Z',
                    'label': 'Accident',
                    'plural_label': 'Accidents',
                    'description': 'An accident.',
                    'active': true
                }
            ]
        };

        var module = {
            RecordTypeResponse: RecordTypeResponse
        };
        return module;
    }

    angular.module('ase.mock.resources', [])
    .factory('ResourcesMock', ResourcesMock);

})();
