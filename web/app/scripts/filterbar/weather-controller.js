(function () {
    'use strict';

    /* ngInject */
    function WeatherController(WeatherService) {
        var ctl = this;

        ctl.weatherValues = WeatherService.weatherValues;
        return ctl;
    }

    angular.module('driver.filterbar')
    .controller('weatherController', WeatherController);

})();
