
(function () {
    'use strict';

    /* ngInject */
    function Schemas() {
        var module = {
            JsonObject: jsonObject,
            FieldTypes: {
                'text': 'Text Field',
                'selectlist': 'Select List'
            },
            Fields: {
                TextField: textField,
                SelectList: selectList
            }
        };
        return module;

        function jsonObject(newObject) {
            newObject = newObject || {};
            return angular.extend({}, {
                /* jshint camelcase: false */
                type: 'object',
                title: '',
                plural_title: '',
                description: '',
                properties: {},
                definitions: {}
                /* jshint camelcase: true */
            }, newObject);
        }

        function textField(newField) {
            newField = newField || {};
            var newTextField = jsonObject(newField);
            return angular.extend(newTextField, {
                headerTemplate: '{{ self.fieldTitle }}',
                properties: {
                    fieldTitle: {
                        type: 'string',
                        title: 'Field Title',
                    },
                    isRequired: {
                        type: 'boolean',
                        format: 'checkbox',
                        title: 'Required'
                    },
                    isSearchable: {
                        type: 'boolean',
                        format: 'checkbox',
                        title: 'Filterable/Searchable'
                    },
                    textOptions: {
                        type: 'string',
                        title: 'Text Options',
                        enum: [
                            'text',
                            'textarea',
                            'number',
                            'color',
                            'tel',
                            'datetime',
                            'url'
                        ],
                        options: {
                            /* jshint camelcase: false */
                            enum_titles: [
                                'Single line text',
                                'Paragraph text',
                                'Number',
                                'HTML Color',
                                'Telephone number',
                                'Date / Time',
                                'Website URL'
                            ]
                            /* jshint camelcase: true */
                        }
                    }
                },
                options: {
                    fieldType: 'text'
                }
            });
        }

        function selectList(newList) {
            newList = newList || {};
            var newSelectList = jsonObject(newList);
            return angular.extend(newSelectList, {
                headerTemplate: '{{ self.fieldTitle }}',
                properties: {
                    fieldTitle: {
                        type: 'string',
                        title: 'Field Title',
                    },
                    isRequired: {
                        type: 'boolean',
                        format: 'checkbox',
                        title: 'Required'
                    },
                    isSearchable: {
                        type: 'boolean',
                        format: 'checkbox',
                        title: 'Filterable/Searchable'
                    },
                    displayType: {
                        type: 'string',
                        enum: [
                            'select',
                            'checkbox'
                        ]
                    }
                },
                options: {
                    fieldType: 'selectlist'
                }
            });

        }
    }

    angular.module('ase.schemas')
    .service('Schemas', Schemas);

})();
