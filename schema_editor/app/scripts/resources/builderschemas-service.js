/**
 * Wrapper service for getting json schemas used for building new schemas via the json-editor.
 * Currently the only builder schema is 'related' which is used for building related objects.
 * These are stored as json files, because that's their native form, and it makes it easy to
 * perform validation or test with using external tools (e.g. jdorn's forms).
 */
(function () {
    'use strict';

    /* ngInject */
    function BuilderSchemas($resource) {
        return $resource('builder-schemas/:name.json', { name: '@name' }, {
            get: {
                method: 'GET'
            }
        });
    }

    angular.module('ase.resources')
    .factory('BuilderSchemas', BuilderSchemas);

})();
