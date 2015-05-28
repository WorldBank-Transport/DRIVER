/**
 * Responsible for schema serialization and deserialization
 *
 * In order to add a new FieldType, you need to do the following:
 * 1. Add a key/value pair to the module.FieldTypes object
 * 2. Add a new field definition object to the json schema (builder-schemas/related.json).
 *    Ensure your newly created object has a matching fieldType attribute.
 *    This is so that when we serialize this object to data and back, we can remember what
 *    type of field it is.
 *
 * @return {[type]} [description]
 */
(function () {
    'use strict';

    /* ngInject */
    function Schemas() {
        var module = {
            JsonObject: jsonObject,
            FieldTypes: {
                'text': {
                    label: 'Text Field',
                    jsonType: 'string'
                },
                'selectlist': {
                    label: 'Select List',
                    jsonType: 'string'
                },
                'image': {
                    label: 'Image Uploader',
                    jsonType: 'string'
                }
            },
            addVersion4Declaration: addVersion4Declaration,
            definitionFromSchemaFormData: definitionFromSchemaFormData,
            encodeJSONPointer: encodeJSONPointer
        };
        return module;

        /**
         * Encode a string so that it complies with the JSON Pointer spec
         * http://tools.ietf.org/html/draft-pbryan-zyp-json-pointer-02
         * This is what is used in $ref to specify sub-schema paths
         * @param {string} str
         * @return {string} Currently just returns encodeURIComponent(string)
         */
        function encodeJSONPointer(str) {
            // TODO: Technically, we should be doing this:
            // return encodeURIComponent(str);
            // But json-editor doesn't seem to support that properly.
            return str;
        }

        /**
         * Converts part of the output of a Schema Entry Form (data about fields)
         * into a snippet designed to be inserted into the 'properties' key of a Data Form Schema
         * which would be used for data entry / editing. Does not perform validation.
         * @param {object} fieldData The value of one Schema Entry Form field, specifying required,
         *      searchable, possible values, etc.
         * @return {object} A snippet designed to be inserted into the 'properties' of a Data Form
         *      Schema
         */
        // TODO: This monolithic function isn't great; investigate more modular options
        function _propertyFromSchemaFieldData(fieldData) {
            var propertyDefinition = {};
            propertyDefinition.type = module.FieldTypes[fieldData.fieldType].jsonType;

            if (fieldData.fieldType === 'selectlist') {
                propertyDefinition.enum = fieldData.fieldOptions;
            }
            if (fieldData.fieldType === 'image') {
                propertyDefinition.media = {
                    binaryEncoding: 'base64',
                    type: 'image/jpeg'
                };
            }
            return propertyDefinition;
        }

        /**
         * Converts the outut of a Schema Entry Form into a sub-schema designed to be
         * inserted into the 'definitions' key of a Data Form Schema. Does not perform
         * validation.
         * @param {array} formData The values in the Schema Form, defining the fields in
         *      this Data Form Schema
         */
        function definitionFromSchemaFormData(formData) {
            var definition = {
                type: 'object',
                properties: {}
            };

            // properties
            _.each(formData, function(fieldData) {
                definition.properties[fieldData.fieldTitle] = _propertyFromSchemaFieldData(fieldData);
            });

            // required
            // A list containing the titles of properties which are required.
            definition.required = _.pluck(_.filter(formData, function(fieldData) {
                    return fieldData.isRequired;
                }), 'fieldTitle');
            return definition;
        }

        /**
         * Adds a $schema keyword to an object; this declares that the object is JSON-Schema v4
         * @param {object} schema Object to which the declaration should be added
         * @return {object} The schema with the $schema keyword added, pointing to Draft 4
         */
        function addVersion4Declaration(schema) {
            return angular.extend(schema, { $schema: 'http://json-schema.org/draft-04/schema#' });
        }

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
    }

    angular.module('ase.schemas')
    .service('Schemas', Schemas);

})();
