'use strict';

describe('driver.filterbar: FilterbarController', function () {

    beforeEach(module('driver.filterbar'));
    beforeEach(module('driver.state'));
    beforeEach(module('ase.mock.resources'));
    beforeEach(module('ase.resources'));
    beforeEach(module('driver.mock.resources'));
    beforeEach(module('ase.templates'));

    var $compile;
    var $controller;
    var $httpBackend;
    var $rootScope;
    var $scope;
    var $state;

    var Controller;
    var DriverResourcesMock;
    var RecordTypes;
    var ResourcesMock;

    beforeEach(inject(function (_$compile_, _$rootScope_, _$httpBackend_, _$state_,
                                _DriverResourcesMock_, _RecordTypes_, _ResourcesMock_) {
        $httpBackend = _$httpBackend_;
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();

        DriverResourcesMock = _DriverResourcesMock_;
        RecordTypes = _RecordTypes_;
        ResourcesMock = _ResourcesMock_;

        var element = $compile('<driver-filterbar></driver-filterbar>')($scope);
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
        var fooFilter = {foo: '1'};
        var expectedFilter = {jcontains: fooFilter};

        expect($controller.sendFilter).toHaveBeenCalled();
        expect($scope.$emit).toHaveBeenCalledWith('driver.filterbar:changed', expectedFilter);

        // reset jasmine tracking
        $controller.sendFilter.calls.reset();
        $scope.$emit.calls.reset();

        $controller.updateFilter('bar#baz', '2');
        var barFilter = {baz: '2'};
        expectedFilter = {foo: '1'};
        expectedFilter.bar = barFilter;
        expectedFilter = {jcontains: expectedFilter};

        expect($controller.sendFilter).toHaveBeenCalled();
        expect($scope.$emit).toHaveBeenCalledWith('driver.filterbar:changed', expectedFilter);
    });

    it('should unset filters', function () {

        // set a filter
        $controller.updateFilter('foo', '1');

        spyOn($controller, 'sendFilter').and.callThrough();
        spyOn($scope, '$emit').and.callThrough();

        // unset the filter
        $controller.updateFilter('foo', '');
        expect($controller.sendFilter).toHaveBeenCalled();
        expect($scope.$emit).toHaveBeenCalledWith('driver.filterbar:changed', {jcontains: {}});
    });

    it('should handle sibling filters', function () {

        var expectedFilter = {
            baz: {
                foo: '1',
                bar: '2'
            }
        };

        $controller.updateFilter('baz#foo', '1');

        spyOn($controller, 'sendFilter').and.callThrough();
        spyOn($scope, '$emit').and.callThrough();

        $controller.updateFilter('baz#bar', '2');

        expect($controller.sendFilter).toHaveBeenCalled();
        expect($scope.$emit).toHaveBeenCalledWith('driver.filterbar:changed', {jcontains: expectedFilter});
    });

    it('should handle nested filters', function () {

        var expectedFilter = {
            baz: {
                frisbee: 'yes',
                foo: {
                    bar: '1'
                }
            }
        };

        $controller.updateFilter('baz#frisbee', 'yes');

        spyOn($controller, 'sendFilter').and.callThrough();
        spyOn($scope, '$emit').and.callThrough();

        $controller.updateFilter('baz#foo#bar', '1');

        expect($controller.sendFilter).toHaveBeenCalled();
        expect($scope.$emit).toHaveBeenCalledWith('driver.filterbar:changed', {jcontains: expectedFilter});
    });
});
