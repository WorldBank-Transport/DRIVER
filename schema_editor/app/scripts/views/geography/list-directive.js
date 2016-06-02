(function () {
    'use strict';

    /* ngInject */
    function GeographyList() {
        var module = {
            restrict: 'E',
            templateUrl: 'scripts/views/geography/list-partial.html',
            controller: 'GeoListController',
            controllerAs: 'geoList',
            bindToController: true
        };
        return module;
    }

    angular.module('ase.views.geography')
    .directive('aseGeoList', GeographyList);

})();
