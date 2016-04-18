'use strict';

describe('driver.details: DetailsConstants', function () {

    beforeEach(module('ase.templates'));
    beforeEach(module('driver.details'));
    beforeEach(module('driver.mock.resources'));
    beforeEach(module('pascalprecht.translate'));

    var $compile;
    var $httpBackend;
    var $rootScope;
    var DriverResourcesMock;

    beforeEach(inject(function (_$compile_, _$httpBackend_, _$rootScope_, _DriverResourcesMock_) {
        $compile = _$compile_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        DriverResourcesMock = _DriverResourcesMock_;
    }));

    it('should render constants', function () {
        var scope = $rootScope.$new();
        scope.record = DriverResourcesMock.RecordResponse.results[0];

        var element = $compile('<driver-details-constants record="record">' +
                               '</driver-details-constants>')(scope);
        $rootScope.$apply();

        expect(element.find('.map').length).toEqual(1);
        expect(element.find('.value.created').length).toEqual(1);
        expect(element.find('.value.latitude').length).toEqual(1);
        expect(element.find('.value.longitude').length).toEqual(1);
        expect(element.find('.value.occurred').length).toEqual(1);
        expect(element.find('.value.weather').length).toEqual(1);
        expect(element.find('.value.light').length).toEqual(1);
    });
});
