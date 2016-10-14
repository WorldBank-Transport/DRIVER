'use strict';

describe('ase.resources: BlackSpotConfig', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('ase.resources'));

    var $httpBackend;
    var BlackSpotConfig;
    var ResourcesMock;

    beforeEach(inject(function (_$httpBackend_, _BlackSpotConfig_, _ResourcesMock_) {
        $httpBackend = _$httpBackend_;
        BlackSpotConfig = _BlackSpotConfig_;
        ResourcesMock = _ResourcesMock_;
    }));

    it('should extract black spot configs from paginated response', function () {
        var requestUrl = /\/api\/blackspotconfig/;
        $httpBackend.whenGET(requestUrl).respond(ResourcesMock.BlackSpotConfigResponse);
        BlackSpotConfig.query().$promise.then(function (data) {
            expect(data.length).toBe(1);

            var config = data[0];
            /* jshint camelcase: false */
            expect(config.severity_percentile_threshold).toEqual(jasmine.any(Number));
            /* jshint camelcase: true */
        });
        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();
    });
});
