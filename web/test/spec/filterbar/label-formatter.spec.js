'use strict';

describe('driver.filterbar: LabelFormatter', function () {

    beforeEach(module('driver.filterbar'));

    var $filter;

    beforeEach(inject(function (_$filter_) {
        $filter = _$filter_;
    }));

    it('should have a label formatting filter', function () {
        expect($filter('labelFormatter')).not.toBeNull();
    });

    it('should return a prettified label', function () {
        var result = $filter('labelFormatter')('parent#child');
        expect(result).toBe('child');
    });
});
