'use strict';

describe('driver.filterbar: Options', function () {

    beforeEach(module('ase.templates'));
    beforeEach(module('driver.filterbar'));
    beforeEach(module('driver.state'));

    var $compile;
    var $rootScope;
    var Element;

    beforeEach(inject(function (_$compile_, _$rootScope_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        var $filterbarScope = $rootScope.$new();

        Element = $compile('<driver-filterbar><options-field></options-field></driver-filterbar>')($filterbarScope);
        $rootScope.$apply();
        var filterbarController = Element.controller('driverFilterbar');

        // set the list of filterable things on the parent controller with an option filter
        var testFilterables = {'foo#bar': {
            displayType: 'select',
            enum: ['baz', 'bing', 'bop', 'fizz'],
            fieldType: 'selectlist',
            isSearchable: true,
            propertyOrder: 0,
            type: 'string'
        }};

        filterbarController.filterables = testFilterables;
        $rootScope.$apply();
    }));

    it('should handle restoring filter selection', function () {
        // should have no selection yet
        expect(Element.find('select').val()).toEqual('');
        $rootScope.$broadcast('driver.filterbar:restore', [{'foo#bar': {'_rule_type': 'containment', 'contains': ['baz']}}, null]);
        $rootScope.$digest();
        // should have baz selected now
        expect(Element.find('select').val()).toEqual('string:baz');
    });

});
