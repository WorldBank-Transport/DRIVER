(function () {
    'use strict';

    /* ngInject */
    function GeographyEdit() {
        var module = {
            restrict: 'E',
            templateUrl: 'scripts/views/geography/edit-partial.html',
            controller: 'GeoEditController',
            controllerAs: 'geoEdit',
            bindToController: true
        };
        return module;
    }

    angular.module('ase.views.geography')
    .directive('aseGeoEdit', GeographyEdit);

})();
