/**
 * DataField
 *
 * Base class for the different types of fields in the schema editor
 *
 * @return {DataField}
 */
(function () {
    'use strict';

    /**
     * Return RFC 4122 v4 compliant UUID
     * @return {string} A UUID
     */
    function UUID() {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c=='x' ? r : (r&0x3|0x8)).toString(16);
        });
        return uuid;
    }

    function Schema() {

        /**
         * DataField defines a few properties common to all Field instances
         */
        function DataField (field) {}
        DataField.prototype.super = function (field) {
            field = field || {};

            this.fieldId = field.fieldId || UUID();
            this.fieldTitle = field.fieldTitle || '';
            this.required = field.required || false;
            this.searchable = field.searchable || false;
        };
        DataField.prototype.toJsonSchema = function () {
            throw 'DataField.toJsonSchema is abstract. Implement in subclass';
        };


        /**
         * Wrapper for type: 'object' in JsonSchema
         */
        function ObjectField(field) {
            field = field || {};
            this.super(field);

            this.properties = field.properties || [];
        }
        ObjectField.prototype = new DataField();

        ObjectField.prototype.toJsonSchema = function () {
            var schema = {
                id: this.fieldId,
                title: this.fieldTitle,
                type: 'object',
                properties: {},
                required: []
            };
            angular.forEach(this.properties, function (value) {
                schema.properties[value.fieldTitle] = value.toJsonSchema();
                if (value.required) {
                    schema.required.push(value.fieldTitle);
                }
            });
            return schema;
        };

        /**
         * Single-line text field
         */
        function TextField(field) {
            console.log(field);
            field = field || {};
            this.super(field);
            console.log(this);

            // Must be one of the HTML5 input types
            if (field.textOptions && field.textOptionsDisplay) {
                this.textOptions = field.textOptions;
                this.textOptionsDisplay = field.textOptionsDisplay;
            } else {
                this.textOptions = [
                    'text',
                    'textarea',
                    'email',
                    'datetime',
                    'tel',
                    'url'
                ];
                this.textOptionsDisplay = [
                    'Single-line text',
                    'Paragraph text',
                    'Email address',
                    'Date / Time',
                    'Telephone number',
                    'Website URL'
                ];
            }

            // Must be one of this.textOptions
            // TODO: This will need better error checking to enforce above conditions
            this.fieldType = this.fieldType || this.textOptions[0];
        }
        TextField.prototype = new DataField();

        TextField.prototype.toJsonSchema = function () {
            var schema = {
                id: this.fieldId,
                type: 'string',
                title: this.fieldTitle,
                format: this.fieldType,
                options: {
                    searchable: this.searchable
                }
            };
            return schema;
        };


        var module = {
            ObjectField: ObjectField,
            TextField: TextField
        };
        return module;
    }

    angular.module('schema-editor')
    .service('Schema', Schema);

})();
