'use strict';

describe('driver.weather: WeatherLabel', function () {

    var $filter;

    beforeEach(function () {
        module('driver.weather');

        inject(function (_$filter_) {
            $filter = _$filter_;
        });
    });

    it('should convert simple weather id', function () {
        var testVal = 'clear-night';
        var expected = 'WEATHER.CLEAR_NIGHT';
        expect($filter('weatherLabel')(testVal)).toBe(expected);
    });

    it('should work with multiple hyphens', function () {
        var testVal = 'partly-cloudy-night';
        var expected = 'WEATHER.PARTLY_CLOUDY_NIGHT';
        expect($filter('weatherLabel')(testVal)).toBe(expected);
    });

    it('should work with no hyphens', function () {
        var testVal = 'cloudy';
        var expected = 'WEATHER.CLOUDY';
        expect($filter('weatherLabel')(testVal)).toBe(expected);
    });

    it('should gracefully handle bad inputs', function () {
        var testVal = 88;
        var expected = 88;
        expect($filter('weatherLabel')(testVal)).toBe(expected);

        testVal = null;
        expected = null;
        expect($filter('weatherLabel')(testVal)).toBe(expected);
    });

});
