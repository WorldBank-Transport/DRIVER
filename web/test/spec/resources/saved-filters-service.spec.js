'use strict';

describe('driver.resources: SavedFilters', function () {

    beforeEach(module('driver.mock.resources'));
    beforeEach(module('driver.resources'));

    var $httpBackend;
    var SavedFilters;
    var DriverResourcesMock;

    beforeEach(inject(function (_$httpBackend_, _SavedFilters_, _DriverResourcesMock_) {
        $httpBackend = _$httpBackend_;
        SavedFilters = _SavedFilters_;
        DriverResourcesMock = _DriverResourcesMock_;
    }));

    it('should extract saved filters from paginated response', function () {
        var requestUrl = /\/api\/userfilters/;
        $httpBackend.whenGET(requestUrl).respond(DriverResourcesMock.SavedFiltersResponse);
        SavedFilters.query().$promise.then(function (data) {
            expect(data.length).toBe(5);

            var savedFilter = data[0];
            expect(savedFilter.label).toEqual(jasmine.any(String));
        });
        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();
    });
});
