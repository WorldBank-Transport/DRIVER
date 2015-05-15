'use strict';

describe('ase.resources: Geography', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('ase.resources'));

    var $httpBackend;
    var Geography;
    var ResourcesMock;

    beforeEach(inject(function (_$httpBackend_, _Geography_, _ResourcesMock_) {
        $httpBackend = _$httpBackend_;
        Geography = _Geography_;
        ResourcesMock = _ResourcesMock_;
    }));

    it('should extract geographies from paginated response', function () {
        var requestUrl = /\/api\/boundaries/;
        $httpBackend.whenGET(requestUrl).respond(ResourcesMock.GeographyResponse);
        Geography.query().$promise.then(function (data) {
            expect(data.length).toBe(1);

            var geography = data[0];
            expect(geography.uuid).toEqual('80c10057-2cfc-4a32-8e3c-0573e8bf853f');
        });
        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();
    });
});
