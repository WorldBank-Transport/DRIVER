'use strict';

describe('driver.filterbar: Options', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('ase.templates'));
    beforeEach(module('driver.filterbar'));
    beforeEach(module('driver.state'));
    beforeEach(module('pascalprecht.translate'));
    beforeEach(module('driver.weather'));

    var $compile;
    var $rootScope;
    var Element;
    var ResourcesMock;
    var $httpBackend;

    beforeEach(inject(function (_$compile_, _$rootScope_, _$httpBackend_, _ResourcesMock_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $httpBackend = _$httpBackend_;
        ResourcesMock = _ResourcesMock_;
    }));

    it('should handle restoring filter selection', function () {
        var recordTypeUrl = /\/api\/recordtypes\//;
        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);

        var $filterbarScope = $rootScope.$new();
        Element = $compile('<driver-filterbar></driver-filterbar>')($filterbarScope);
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

        // should have no selection yet
        var getSelectValue = function() {
            return Element.find('select[data-title=bar]').val();
        };
        expect(getSelectValue()).toEqual(null);
        $rootScope.$broadcast('driver.filterbar:restore', [{'foo#bar': {'_rule_type': 'containment', 'contains': ['baz']}}, null]);
        $rootScope.$digest();
        // should have baz selected now
        expect(getSelectValue()).toEqual(['string:baz']);
    });

});
