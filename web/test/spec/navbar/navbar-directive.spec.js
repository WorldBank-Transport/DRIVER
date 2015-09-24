'use strict';

describe('driver.navbar: Navbar', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('ase.resources'));
    beforeEach(module('driver.mock.resources'));
    beforeEach(module('ase.templates'));
    beforeEach(module('driver.navbar'));
    beforeEach(module('driver.views.account'));
    beforeEach(module('driver.views.dashboard'));
    beforeEach(module('driver.views.map'));
    beforeEach(module('driver.views.record'));
    beforeEach(module('driver.elemstat'));

    var $compile;
    var $httpBackend;
    var $rootScope;
    var DriverResourcesMock;
    var RecordTypes;
    var ResourcesMock;
    var $state;
    var $stateParams;

    beforeEach(inject(function (_$compile_, _$httpBackend_, _$rootScope_, _$state_, _$stateParams_,
                                _DriverResourcesMock_, _RecordTypes_, _ResourcesMock_) {
        $state = _$state_;
        $stateParams = _$stateParams_;
        $compile = _$compile_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        DriverResourcesMock = _DriverResourcesMock_;
        RecordTypes = _RecordTypes_;
        ResourcesMock = _ResourcesMock_;

        spyOn($state, 'go');
    }));

    it('should load directive', function () {
        var geographiesUrl = /\/api\/boundaries/;
        var recordTypeUrl = /\/api\/recordtypes\/\?active=True/;
        var boundaryUrl = /\/api\/boundarypolygons/;

        $httpBackend.expectGET(geographiesUrl).respond(200, ResourcesMock.GeographyResponse);
        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
        $httpBackend.expectGET(boundaryUrl).respond(200, DriverResourcesMock.BoundaryResponse);

        var scope = $rootScope.$new();
        var element = $compile('<driver-navbar></driver-navbar>')(scope);
        $rootScope.$apply();

        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();
        $rootScope.$apply();

        expect(element.find('.nav-rt-item').length).toBeGreaterThan(0);
        expect(element.find('.nav-page-item').length).toBeGreaterThan(0);
    });
});
