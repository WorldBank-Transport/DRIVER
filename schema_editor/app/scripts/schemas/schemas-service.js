
(function () {
    'use strict';

    /* ngInject */
    function Schemas() {
        var module = {
            JsonObject: JsonObject
        };
        return module;

/* jshint camelcase: false */
        function JsonObject() {
            return {
                type: 'object',
                title: '',
                plural_title: '',
                description: '',
                properties: {},
                definitions: {}
            };
        }
    }
/* jshint camelcase: true */

    angular.module('ase.schemas')
    .service('Schemas', Schemas);

})();
