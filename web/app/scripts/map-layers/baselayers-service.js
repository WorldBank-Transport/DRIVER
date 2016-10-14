(function () {
    'use strict';

    /* Service for sharing baselayer configuration.
     */

    /* ngInject */
    function BaseLayersService($translate) {

        var module = {
            streets: streets,
            satellite: satellite,
            baseLayers: baseLayers
        };
        return module;

        function streets() {
            var layer = new L.tileLayer(
                'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
                {
                    attribution: $translate.instant('MAP.CDB_ATTRIBUTION'),
                    detectRetina: false,
                    zIndex: 1
                }
            );
            return layer;
        }

        function satellite() {
            var layer = new L.tileLayer(
                '//server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                {
                    attribution: $translate.instant('MAP.ESRI_ATTRIBUTION'),
                    detectRetina: false,
                    zIndex: 1
                }            );
            return layer;
        }

        function baseLayers() {
            return [
                {
                    slugLabel: 'streets',
                    label: $translate.instant('MAP.STREETS'),
                    layer: streets()
                },
                {
                    slugLabel: 'satellite',
                    label: $translate.instant('MAP.SATELLITE'),
                    layer: satellite()
                }
            ];
        }
    }

    angular.module('driver.map-layers')
    .factory('BaseLayersService', BaseLayersService);
})();
