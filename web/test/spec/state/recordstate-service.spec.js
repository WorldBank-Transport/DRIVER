'use strict';

describe('driver.state: Records', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('driver.state'));
    beforeEach(module('pascalprecht.translate'));

    var $rootScope;
    var $httpBackend;
    var RecordState;
    var ResourcesMock;

    beforeEach(inject(function (_$rootScope_, _$httpBackend_, _RecordState_, _ResourcesMock_) {
        $rootScope = _$rootScope_;
        $httpBackend = _$httpBackend_;
        RecordState = _RecordState_;
        ResourcesMock = _ResourcesMock_;
    }));

    it('should make a request for state options on call to "updateOptions"', function () {
        var recordTypeUrl = /\/api\/recordtypes\/\?active=True/;

        RecordState.updateOptions();
        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
    });

});
