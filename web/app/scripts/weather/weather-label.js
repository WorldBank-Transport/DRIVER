(function () {
    'use strict';

    // Angular filter for converting a weather/light id to a translation string
    function WeatherLabel() {
        // Simple filter: just converts hyphens to underscores, adds suffix, and uses all-caps
        return function(id) {
            if (!_.isString(id)) {
                return id;
            }

            return 'WEATHER.' + (id ? id.toUpperCase().replace(/-/g, '_') : 'EMPTY');
        };
    }

    angular.module('driver.weather')
    .filter('weatherLabel', WeatherLabel);

})();
