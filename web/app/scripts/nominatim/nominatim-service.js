(function () {
    'use strict';

    /* ngInject */
    function Nominatim($http, WebConfig) {

        var PICKPOINT_NOMINATIM_URL = 'https://pickpoint.io/api/v1/';

        var module = {
            reverse: reverse
        };

        return module;

        function reverse(x, y) {
            return $http.get(PICKPOINT_NOMINATIM_URL + 'reverse', {
                params: {
                    key: WebConfig.nominatim.key,
                    format: 'json',
                    lat: y,
                    lon: x
                }
            }).then(function (result) {
                return result.data.display_name;
            });
        }
    }

    angular.module('driver.nominatim')
    .service('Nominatim', Nominatim);

})();
