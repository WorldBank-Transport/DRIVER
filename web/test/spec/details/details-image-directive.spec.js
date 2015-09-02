'use strict';

describe('driver.details: DetailsImage', function () {

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

    it('should render image', function () {
        var scope = $rootScope.$new();
        scope.property = {
            fieldType: 'image',
            media: {
                binaryEncoding: 'base64',
                type: 'image/jpeg'
            },
            propertyName: 'An image field'
        };
        scope.data = 'data:image/png;base64,xxxtestxxx';

        var element = $compile('<driver-details-image property="property" data="data">' +
                               '</driver-details-image>')(scope);
        $rootScope.$apply();

        expect(element.find('.value.image').length).toEqual(1);
        expect(element.find('img').length).toEqual(1);
    });
});
