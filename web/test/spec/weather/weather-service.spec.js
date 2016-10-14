'use strict';

describe('driver.weather: WeatherService', function () {
    beforeEach(module('driver.weather'));

    var WeatherService;

    beforeEach(inject(function (_$rootScope_, _WeatherService_) {
        WeatherService = _WeatherService_;
    }));

    it('should provide light values', function () {
        expect(WeatherService.lightValues.length).toBeGreaterThan(0);
    });

    it('should provide weather values', function () {
        expect(WeatherService.weatherValues.length).toBeGreaterThan(0);
    });

});
