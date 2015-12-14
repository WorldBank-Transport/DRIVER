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
        var expected = 'Clear night';
        expect($filter('weatherLabel')(testVal)).toBe(expected);
    });

    it('should work with multiple hyphens', function () {
        var testVal = 'partly-cloudy-night';
        var expected = 'Partly cloudy night';
        expect($filter('weatherLabel')(testVal)).toBe(expected);
    });

    it('should work with no hyphens', function () {
        var testVal = 'cloudy';
        var expected = 'Cloudy';
        expect($filter('weatherLabel')(testVal)).toBe(expected);
    });

    it('should gracefully handle bad inputs', function () {
        var testVal = 88;
        var expected = 88;
        expect($filter('weatherLabel')(testVal)).toBe(expected);

        testVal = null;
        expected = null;
        expect($filter('weatherLabel')(testVal)).toBe(expected);

        testVal = 'a';
        expected = 'A';
        expect($filter('weatherLabel')(testVal)).toBe(expected);
    });

});
