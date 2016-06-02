(function () {
    'use strict';

    /* ngInject */
    function GeographyAdd() {
        var module = {
            restrict: 'E',
            templateUrl: 'scripts/views/geography/add-partial.html',
            controller: 'GeoAddController',
            controllerAs: 'geoAdd',
            bindToController: true
        };
        return module;
    }

    angular.module('ase.views.geography')
    .directive('aseGeoAdd', GeographyAdd);

})();
