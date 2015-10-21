'use strict';

describe('driver.state: Records', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('driver.state'));

    var $rootScope;
    var $httpBackend;
    var RecordTypeState;
    var ResourcesMock;

    beforeEach(inject(function (_$rootScope_, _$httpBackend_, _RecordTypeState_, _ResourcesMock_) {
        $rootScope = _$rootScope_;
        $httpBackend = _$httpBackend_;
        RecordTypeState = _RecordTypeState_;
        ResourcesMock = _ResourcesMock_;
    }));

    it('should make a request for state options on call to "updateOptions"', function () {
        var recordTypeUrl = /\/api\/recordtypes\/\?active=True/;

        RecordTypeState.updateOptions();
        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
    });

});
