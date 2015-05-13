
(function () {
    'use strict';

    /* ngInject */
    function Schemas() {
        var module = {
            Object: Object
        };
        return module;

        function Object() {
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

    angular.module('ase.schemas')
    .service('Schemas', Schemas);

})();
