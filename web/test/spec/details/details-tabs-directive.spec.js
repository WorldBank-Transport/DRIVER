'use strict';

describe('driver.details: DetailsTabs', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('driver.mock.resources'));
    beforeEach(module('ase.templates'));
    beforeEach(module('driver.details'));

    var $compile;
    var $httpBackend;
    var $rootScope;
    var DriverResourcesMock;
    var ResourcesMock;

    beforeEach(inject(function (_$compile_, _$httpBackend_, _$rootScope_,
                               _DriverResourcesMock_, _ResourcesMock_) {
        $compile = _$compile_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        DriverResourcesMock = _DriverResourcesMock_;
        ResourcesMock = _ResourcesMock_;
    }));

    it('should render tabs item', function () {
        var scope = $rootScope.$new();

        scope.record = DriverResourcesMock.RecordResponse.results[0];
        scope.recordSchema = ResourcesMock.RecordSchemaResponse.results[0];

        var element = $compile('<driver-details-tabs ' +
                               'record-schema="recordSchema" record="record">' +
                               '</driver-details-tabs>')(scope);
        $rootScope.$apply();

        expect(element.find('.tab-content').length).toEqual(1);
    });
});
