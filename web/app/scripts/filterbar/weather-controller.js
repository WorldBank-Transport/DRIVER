(function () {
    'use strict';

    /* ngInject */
    function WeatherController(WeatherService) {
        var ctl = this;

        // Ignore first value, which is blank
        ctl.weatherValues = WeatherService.weatherValues.slice(1);

        return ctl;
    }

    angular.module('driver.filterbar')
    .controller('weatherController', WeatherController);

})();
