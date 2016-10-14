'use strict';

describe('driver.details: DetailsMultiple', function () {

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

    it('should render multiple item', function () {
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
        scope.data = [
            {
                'Text field 1': 'value1',
                'Text field 2': 'value2'
            },
            {
                'Text field 3': 'value3',
                'Text field 4': 'value4'
            }
        ];
        scope.record = { data: null };

        var element = $compile('<driver-details-multiple ' +
                               'properties="properties" data="data" record="record">' +
                               '</driver-details-multiple>')(scope);
        $rootScope.$apply();

        // Four compact text fields (from the list view)
        expect(element.find('.compact .value.text').length).toEqual(4);

        // Eight total text fields (4 compact + 4 non-compact)
        expect(element.find('.value.text').length).toEqual(8);
    });
});
