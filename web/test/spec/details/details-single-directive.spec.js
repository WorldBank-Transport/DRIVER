'use strict';

describe('driver.details: DetailsSingle', function () {

    beforeEach(module('ase.templates'));
    beforeEach(module('driver.details'));

    var $compile;
    var $httpBackend;
    var $rootScope;

    beforeEach(inject(function (_$compile_, _$httpBackend_, _$rootScope_) {
        $compile = _$compile_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
    }));

    it('should render single item', function () {
        var scope = $rootScope.$new();
        scope.properties = [
            {
                fieldType: 'text',
                format: 'text',
                propertyName: 'Text field 1'
            },
            {
                fieldType: 'text',
                format: 'text',
                propertyName: 'Text field 2'
            }
        ];
        scope.data = {
            'Text field 1': 'value1',
            'Text field 2': 'value2'
        };
        scope.record = { data: null };

        var element = $compile('<driver-details-single ' +
                               'properties="properties" data="data" record="record">' +
                               '</driver-details-single>')(scope);
        $rootScope.$apply();

        expect(element.find('.value.text').length).toEqual(2);
    });
});
