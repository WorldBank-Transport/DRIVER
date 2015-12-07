'use strict';

describe('driver.localization: LocalDateTime', function () {

    var $filter;
    var localDateTime;

    beforeEach(function () {
        module('driver.localization');

        inject(function (_$filter_) {
            $filter = _$filter_;
            localDateTime = $filter('localDateTime');
        });
    });

    it('should render short datetime with no format option provided', function () {
        var input = new Date('2015-12-03T05:00:00Z');
        var expected = '12/3/15 1:00 PM'; // Manila is UTC+08:00
        expect(localDateTime(input)).toBe(expected);
    });

    it('should render datetime with specified format', function () {
        var format = 'MMM D, YYYY h:mm:ss A';
        var input = new Date('2015-12-03T05:00:00Z');
        var expected = 'Dec 3, 2015 1:00:00 PM';
        expect(localDateTime(input, format)).toBe(expected);
    });

    it('should handle invalid datetime inputs', function () {
        var input = new Date('1/1/1/1/1/1/1/1');
        var expected = 'Invalid date';
        expect(localDateTime(input)).toBe(expected);
    });

});
