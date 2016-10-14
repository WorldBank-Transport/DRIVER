(function () {
    'use strict';

    /* ngInject */
    function Nominatim($http, WebConfig) {

        var PICKPOINT_NOMINATIM_URL = 'https://pickpoint.io/api/v1/';
        var SUGGEST_LIMIT = 15;

        var module = {
            forward: forward,
            reverse: reverse
        };

        return module;

        function forward(text, bboxArray) {
            var params = {
                key: WebConfig.nominatim.key,
                q: text,
                countrycodes: WebConfig.localization.countryCode,
                limit: SUGGEST_LIMIT,
                addressdetails: 1
            };

            // bboxArray can sometimes be null, which was causing a null ref error
            if (bboxArray) {
                params.viewBox = bboxArray.join(',');
            }

            return $http.get(PICKPOINT_NOMINATIM_URL + 'forward', {
                params: params
            }).then(function (result) {
                return result.data;
            });
        }

        function reverse(x, y) {
            return $http.get(PICKPOINT_NOMINATIM_URL + 'reverse', {
                params: {
                    key: WebConfig.nominatim.key,
                    format: 'json',
                    lat: y,
                    lon: x
                }
            }).then(function (result) {
                return result.data;
            });
        }
    }

    angular.module('driver.nominatim')
    .service('Nominatim', Nominatim);

})();
