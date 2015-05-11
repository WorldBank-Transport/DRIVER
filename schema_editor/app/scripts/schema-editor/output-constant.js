
(function () {
    'use strict';

    var Output = {
        title: 'Person',
        type: 'object',
        properties: {
            'First Name': {
                type: 'string',
                title: 'First Name',
                format: 'text',
                options: {
                    searchable: false
                }
            },
            'Last Name': {
                type: 'string',
                title: 'Last Name',
                format: 'text',
                options: {
                    searchable: true
                }
            },
            'Involvement': {
                type: 'array',
                title: 'Involvement',
                //format: 'select',
                //uniqueItems: true,
                format: 'checkbox',
                items: {
                    type: 'string',
                    enum: [
                        'Driver',
                        'Passenger',
                        'Pedestrian',
                        'Witness'
                    ]
                }
            },
            'Image': {
                type: 'string',
                title: 'Image',
                media: {
                    binaryEncoding: 'base64',
                    type: 'image/png'
                }
            },
            // TODO: We may have to tweak how this one works
            'Vehicle': {
                title: 'Vehicle',
                '$ref': '#/vehicle'
            }
        }
    };

    angular.module('schema-editor')
    .factory('SchemaOutput', Output);

})();
