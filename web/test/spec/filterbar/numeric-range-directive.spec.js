'use strict';

describe('driver.filterbar: Numeric Range', function () {

    beforeEach(module('ase.templates'));
    beforeEach(module('driver.filterbar'));
    beforeEach(module('driver.state'));

    var $compile;
    var $rootScope;

    beforeEach(inject(function (_$compile_, _$rootScope_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        var $filterbarScope = $rootScope.$new();

        Element = $compile('<driver-filterbar><numeric-range-field></numeric-range-field></driver-filterbar>')($filterbarScope);
        $rootScope.$apply();
        var filterbarController = Element.controller('driverFilterbar');

        // set the list of filterable things on the parent controller with an option filter
        var testFilterables = {'my#amplifier': {
            format: 'number',
            fieldType: 'text',
            isSearchable: true,
            propertyOrder: 0,
            type: 'string'
        }};

        filterbarController.filterables = testFilterables;
        $rootScope.$apply();
    }));

    it('should handle restoring filter selection', function () {
        // should have no maximum set yet
        expect(Element.find("input[type='number'][name='maximum']").val()).toEqual('');

        // mine goes to eleven
        $rootScope.$broadcast('driver.filterbar:restore', {'my#amplifier': {min: 0, max: 11}});
        $rootScope.$digest();

        expect(Element.find("input[type='number'][name='maximum']").val()).toEqual('11');
    });

});
