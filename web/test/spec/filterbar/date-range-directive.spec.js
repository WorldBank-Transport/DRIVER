'use strict';

describe('driver.filterbar: Date Range', function () {

    beforeEach(module('ase.templates'));
    beforeEach(module('driver.filterbar'));
    beforeEach(module('driver.state'));

    var $compile;
    var $rootScope;

    beforeEach(inject(function (_$compile_, _$rootScope_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        var $filterbarScope = $rootScope.$new();

        Element = $compile('<driver-filterbar><date-range-field></date-range-field></driver-filterbar>')($filterbarScope);
        $rootScope.$apply();
        var filterbarController = Element.controller('driverFilterbar');

        $rootScope.$apply();
    }));

    it('should handle restoring filter selection', function () {
        // should have no maximum set yet
        expect(Element.find("input[type='text'][name='maximum']").val()).toEqual('');

        var date = new Date();
        $rootScope.$broadcast('driver.filterbar:restore', {'__dateRange': {max: date.toString()}});
        $rootScope.$digest();

        expect(Element.find("input[type='text'][name='maximum']").val()).toEqual(date.toString());
    });

});
