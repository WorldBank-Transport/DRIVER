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
            return $http.get(PICKPOINT_NOMINATIM_URL + 'forward', {
                params: {
                    key: WebConfig.nominatim.key,
                    q: text,
                    viewbox: bboxArray.join(','),
                    limit: SUGGEST_LIMIT
                }
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
                /*jshint camelcase: false */
                return result.data.display_name;
                /*jshint camelcase: true */
            });
        }
    }

    angular.module('driver.nominatim')
    .service('Nominatim', Nominatim);

})();
