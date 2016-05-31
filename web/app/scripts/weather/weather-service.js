(function () {
    'use strict';

    function WeatherService() {
        return {
            lightValues: [
                '',
                'dawn',
                'day',
                'dusk',
                'night'
            ],
            weatherValues: [
                '',
                'clear-day',
                'clear-night',
                'cloudy',
                'fog',
                'hail',
                'partly-cloudy-day',
                'partly-cloudy-night',
                'rain',
                'sleet',
                'snow',
                'thunderstorm',
                'tornado',
                'wind'
            ]
        };
    }

    angular.module('driver.weather')
    .factory('WeatherService', WeatherService);
})();
