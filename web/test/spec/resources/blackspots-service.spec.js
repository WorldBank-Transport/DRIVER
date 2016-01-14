'use strict';

describe('driver.resources: BlackspotSets', function () {

    beforeEach(module('driver.mock.resources'));
    beforeEach(module('driver.resources'));

    var $httpBackend;
    var BlackspotSets;
    var DriverResourcesMock;

    beforeEach(inject(function (_$httpBackend_, _BlackspotSets_, _DriverResourcesMock_) {
        $httpBackend = _$httpBackend_;
        BlackspotSets = _BlackspotSets_;
        DriverResourcesMock = _DriverResourcesMock_;
    }));

    it('should fetch blackspots from the appropriate endpoint', function () {
        var requestUrl = /\/api\/blackspots/;
        $httpBackend.whenGET(requestUrl).respond(DriverResourcesMock.BlackspotsResponse);
        BlackspotSets.query().$promise.then(function (data) {
            expect(data);
        });
        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();
    });
});

describe('driver.resources: Blackspots', function () {

    beforeEach(module('driver.mock.resources'));
    beforeEach(module('driver.resources'));

    var $httpBackend;
    var Blackspots;
    var DriverResourcesMock;

    beforeEach(inject(function (_$httpBackend_, _Blackspots_, _DriverResourcesMock_) {
        $httpBackend = _$httpBackend_;
        Blackspots = _Blackspots_;
        DriverResourcesMock = _DriverResourcesMock_;
    }));

    it('should fetch blackspots from the appropriate endpoint', function () {
        var blackspotsUrl = /\/api\/blackspots/;
        $httpBackend.whenGET(blackspotsUrl).respond(DriverResourcesMock.BlackspotsResponse);
        Blackspots.query().$promise.then(function (data) {
            expect(data);
        });
        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();
    });
});
