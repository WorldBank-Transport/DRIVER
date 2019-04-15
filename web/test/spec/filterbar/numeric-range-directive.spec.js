'use strict';

describe('driver.filterbar: Numeric Range', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('ase.templates'));
    beforeEach(module('driver.filterbar'));
    beforeEach(module('driver.state'));
    beforeEach(module('pascalprecht.translate'));
    beforeEach(module('driver.weather'));

    var $compile;
    var $rootScope;
    var ResourcesMock;
    var $httpBackend;

    beforeEach(inject(function (_$compile_, _$rootScope_, _ResourcesMock_, _$httpBackend_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        ResourcesMock = _ResourcesMock_;
        $httpBackend = _$httpBackend_;
    }));

    it('should handle restoring filter selection', function () {
        var recordTypeUrl = /\/api\/recordtypes\//;
        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);

        var $filterbarScope = $rootScope.$new();
        var Element = $compile('<driver-filterbar><numeric-range-field></numeric-range-field></driver-filterbar>')($filterbarScope);
        $rootScope.$apply();
        var filterbarController = Element.controller('driverFilterbar');

        // set the list of filterable things on the parent controller with an option filter
        var testFilterables = {'my#amplifier': {
            fieldType: 'number',
            isSearchable: true,
            propertyOrder: 0,
            type: 'string'
        }};

        filterbarController.filterables = testFilterables;
        $rootScope.$apply();
        // should have no maximum set yet
        expect(Element.find("input[type='number'][name='maximum']").val()).toEqual('');

        // mine goes to eleven
        $rootScope.$broadcast('driver.filterbar:restore', [{'my#amplifier': {min: 0, max: 11}}, null]);
        $rootScope.$digest();

        expect(Element.find("input[type='number'][name='maximum']").val()).toEqual('11');
    });

});
