'use strict';

describe('driver.recordstateservice: Map', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('driver.state'));
    beforeEach(module('driver.mock.resources'));

    var $rootScope;
    var $httpBackend;
    var ResourcesMock;
    var RecordSchemaState;

    beforeEach(inject(function (_$rootScope_, _$httpBackend_,
                                _RecordSchemaState_, _ResourcesMock_) {
        $rootScope = _$rootScope_;
        $httpBackend = _$httpBackend_;
        RecordSchemaState = _RecordSchemaState_;
        ResourcesMock = _ResourcesMock_;
    }));

    it('should limit the number of requests being made for a given UUID', function () {
        // Try to get it twice - the same UUID should not send of more than one
        RecordSchemaState.get('a-weird-uuid');
        RecordSchemaState.get('a-weird-uuid');

        var recordSchemaUrl = /\/api\/recordschemas/;
        $httpBackend.expectGET(recordSchemaUrl).respond(200, ResourcesMock.RecordSchema);

        $rootScope.$apply();
        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should send a new request for a different UUID', function () {
        // Try to get it twice - the same UUID should not send of more than one
        RecordSchemaState.get('a-weird-uuid');
        RecordSchemaState.get('a-werd-uuid');

        var recordSchemaUrl = /\/api\/recordschemas/;
        $httpBackend.expectGET(recordSchemaUrl).respond(200, ResourcesMock.RecordSchema);
        $httpBackend.expectGET(recordSchemaUrl).respond(200, ResourcesMock.RecordSchema);

        $rootScope.$apply();
        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();
    });
});
