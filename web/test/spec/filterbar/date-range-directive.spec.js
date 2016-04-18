'use strict';

describe('driver.filterbar: Date Range', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('ase.templates'));
    beforeEach(module('driver.filterbar'));
    beforeEach(module('driver.state'));
    beforeEach(module('pascalprecht.translate'));

    var $compile;
    var $rootScope;
    var RecordState;
    var $httpBackend;
    var ResourcesMock;

    beforeEach(inject(function (_$compile_, _$rootScope_, _RecordState_, _$httpBackend_, _ResourcesMock_) {
        $compile = _$compile_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        RecordState = _RecordState_;
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
        $rootScope.$apply();

        // should have no maximum set yet
        expect(Element.find("input[type='text'][name='maximum']").val()).toEqual('');

        var date = new Date();
        $rootScope.$broadcast('driver.filterbar:restore', [{'__dateRange': {max: date.toString()}}, null]);
        $rootScope.$digest();

        expect(Element.find("input[type='text'][name='maximum']").val()).toEqual(date.toString());
    });

});
