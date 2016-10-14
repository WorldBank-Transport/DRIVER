'use strict';

describe('driver.details: DetailsReference', function () {

    beforeEach(module('ase.templates'));
    beforeEach(module('driver.details'));
    beforeEach(module('pascalprecht.translate'));

    var $compile;
    var $httpBackend;
    var $rootScope;

    beforeEach(inject(function (_$compile_, _$httpBackend_, _$rootScope_) {
        $compile = _$compile_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
    }));

    it('should render reference', function () {
        var scope = $rootScope.$new();
        scope.property = {
            fieldType: 'reference',
            propertyName: 'A reference field'
        };
        scope.data = '2ed9a5f0-b5de-4b93-9972-353b85dd7837';
        scope.record = { data: null };

        var element = $compile('<driver-details-reference ' +
                               'property="property" data="data" record="record">' +
                               '</driver-details-reference>')(scope);
        $rootScope.$apply();

        expect(element.find('.value.reference').length).toEqual(1);
    });
});
