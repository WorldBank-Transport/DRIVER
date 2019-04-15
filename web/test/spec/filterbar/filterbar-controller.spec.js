'use strict';

describe('driver.filterbar: FilterbarController', function () {

    beforeEach(module('driver.weather'));
    beforeEach(module('driver.filterbar'));
    beforeEach(module('driver.state'));
    beforeEach(module('ase.mock.resources'));
    beforeEach(module('ase.resources'));
    beforeEach(module('driver.mock.resources'));
    beforeEach(module('ase.templates'));
    beforeEach(module('pascalprecht.translate'));

    var $compile;
    var $controller;
    var $httpBackend;
    var $rootScope;
    var $scope;
    var $timeout;

    var DriverResourcesMock;
    var RecordTypes;
    var ResourcesMock;

    beforeEach(inject(function (_$compile_, _$rootScope_, _$httpBackend_, _$timeout_,
                                _DriverResourcesMock_, _RecordTypes_, _ResourcesMock_) {
        $httpBackend = _$httpBackend_;
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $timeout = _$timeout_;
        $scope = $rootScope.$new();

        DriverResourcesMock = _DriverResourcesMock_;
        RecordTypes = _RecordTypes_;
        ResourcesMock = _ResourcesMock_;

        var element = $compile('<driver-filterbar></driver-filterbar>')($scope);

        var recordTypeUrl = /\/api\/recordtypes\//;
        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);

        $rootScope.$apply();
        $controller = element.controller('driverFilterbar');

    }));

    it('should initially have an empty filter collection', function () {
        expect($controller.filters).toEqual({});
    });

    it('should send filter parameters', function () {

        spyOn($controller, 'sendFilter').and.callThrough();
        spyOn($scope, '$emit').and.callThrough();

        $controller.updateFilter('foo', '1');
        $timeout.flush();

        expect($controller.sendFilter).toHaveBeenCalled();
        expect($scope.$emit).toHaveBeenCalledWith('driver.filterbar:changed');
    });
});
