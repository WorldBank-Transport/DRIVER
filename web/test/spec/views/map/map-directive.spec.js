'use strict';

describe('driver.views.map: Map', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('ase.resources'));
    beforeEach(module('driver.mock.resources'));
    beforeEach(module('driver.resources'));
    beforeEach(module('driver.templates'));
    beforeEach(module('driver.views.map'));

    var $compile;
    var $httpBackend;
    var $rootScope;
    var RecordTypes;
    var ResourcesMock;
    var DriverResourcesMock;

    beforeEach(inject(function (_$compile_, _$httpBackend_, _$rootScope_,
                                _RecordTypes_, _DriverResourcesMock_, _ResourcesMock_) {
        $compile = _$compile_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        RecordTypes = _RecordTypes_;
        ResourcesMock = _ResourcesMock_;
        DriverResourcesMock = _DriverResourcesMock_;
    }));

    it('should load directive', function () {
        var requestUrl = /\/api\/records/;
        $httpBackend.whenGET(requestUrl).respond(DriverResourcesMock.RecordResponse);
        var scope = $rootScope.$new();
        var element = $compile('<driver-map></driver-map>')(scope);
        $rootScope.$apply();

        // placeholder test
        expect(element.find('.records-map').length).toEqual(1);
    });
});
