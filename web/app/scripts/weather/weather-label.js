(function () {
    'use strict';

    // Angular filter for converting a weather/light id to a label
    function WeatherLabel() {
        // Simple filter: just converts hyphens to spaces and capitalizes first letter
        return function(id) {
            if (!id || !_.isString(id)) {
                return id;
            }

            var label = id.charAt(0).toUpperCase();
            if (id.length > 1) {
                label += id.slice(1).replace(/-/g, ' ');
            }

            return label;
        };
    }

    angular.module('driver.weather')
    .filter('weatherLabel', WeatherLabel);

})();
