'use strict';

describe('driver.details: DetailsSelectlist', function () {

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

    it('should render selectlist', function () {
        var scope = $rootScope.$new();
        scope.property = {
            displayType: 'select',
            fieldType: 'selectlist',
            propertyName: 'A selectlist field',
            type: 'string',
            enum: ['First option', 'Second option', 'Third Option']
        };
        scope.data = 'Second option';

        var element = $compile('<driver-details-selectlist property="property" data="data">' +
                               '</driver-details-selectlist>')(scope);
        $rootScope.$apply();

        expect(element.find('.value.selectlist').length).toEqual(1);
    });
});
