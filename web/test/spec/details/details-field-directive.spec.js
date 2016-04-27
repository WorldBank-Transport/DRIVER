'use strict';

describe('driver.details: DetailsField', function () {

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

    it('should render a non-compact text field', function () {
        var scope = $rootScope.$new();
        scope.property = {
            fieldType: 'text',
            format: 'color',
            propertyName: 'Color field',
            type: 'string'
        };
        scope.data = '#ea1313';

        var element = $compile('<driver-details-field property="property" data="data">' +
                               '</driver-details-field>')(scope);
        $rootScope.$apply();

        expect(element.find('rect').length).toEqual(1);
        expect(element.find('.value.color').length).toEqual(1);
        expect(element.find('.compact').length).toEqual(0);
        expect(element.find('label').length).toEqual(1);
    });

    it('should render a compact text field', function () {
        var scope = $rootScope.$new();
        scope.property = {
            fieldType: 'text',
            format: 'color',
            propertyName: 'Color field',
            type: 'string'
        };
        scope.data = '#ea1313';

        var element = $compile('<driver-details-field compact="true"' +
                               ' property="property" data="data">' +
                               '</driver-details-field>')(scope);
        $rootScope.$apply();

        expect(element.find('rect').length).toEqual(1);
        expect(element.find('.value.color').length).toEqual(1);
        expect(element.find('.compact').length).toEqual(1);
        expect(element.find('label').length).toEqual(0);
    });

    it('should render a non-compact image field', function () {
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

        var element = $compile('<driver-details-field property="property" data="data">' +
                               '</driver-details-field>')(scope);
        $rootScope.$apply();

        expect(element.find('.value.image').length).toEqual(1);
        expect(element.find('img').length).toEqual(1);
        expect(element.find('.compact').length).toEqual(0);
        expect(element.find('label').length).toEqual(1);
    });

    it('should render a compact image field', function () {
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

        var element = $compile('<driver-details-field compact="true"' +
                               ' property="property" data="data">' +
                               '</driver-details-field>')(scope);
        $rootScope.$apply();

        expect(element.find('.value.image').length).toEqual(1);
        expect(element.find('img').length).toEqual(1);
        expect(element.find('.compact').length).toEqual(1);
        expect(element.find('label').length).toEqual(0);
    });

    it('should render a non-compact selectlist field', function () {
        var scope = $rootScope.$new();
        scope.property = {
            displayType: 'select',
            fieldType: 'selectlist',
            propertyName: 'A selectlist field',
            type: 'string',
            enum: ['First option', 'Second option', 'Third Option']
        };
        scope.data = 'Second option';

        var element = $compile('<driver-details-field property="property" data="data">' +
                               '</driver-details-field>')(scope);
        $rootScope.$apply();

        expect(element.find('.value.selectlist').length).toEqual(1);
        expect(element.find('.compact').length).toEqual(0);
        expect(element.find('label').length).toEqual(1);
    });

    it('should render a compact selectlist field', function () {
        var scope = $rootScope.$new();
        scope.property = {
            displayType: 'select',
            fieldType: 'selectlist',
            propertyName: 'A selectlist field',
            type: 'string',
            enum: ['First option', 'Second option', 'Third Option']
        };
        scope.data = 'Second option';

        var element = $compile('<driver-details-field compact="true"' +
                               ' property="property" data="data">' +
                               '</driver-details-field>')(scope);
        $rootScope.$apply();

        expect(element.find('.value.selectlist').length).toEqual(1);
        expect(element.find('.compact').length).toEqual(1);
        expect(element.find('label').length).toEqual(0);
    });

    it('should render a non-compact reference field', function () {
        var scope = $rootScope.$new();
        scope.property = {
            fieldType: 'reference',
            propertyName: 'A reference field'
        };
        scope.data = '2ed9a5f0-b5de-4b93-9972-353b85dd7837';
        scope.record = { data: null };

        var element = $compile('<driver-details-field ' +
                               'property="property" data="data" record="record">' +
                               '</driver-details-field>')(scope);
        $rootScope.$apply();

        expect(element.find('.value.reference').length).toEqual(1);
        expect(element.find('.compact').length).toEqual(0);
        expect(element.find('label').length).toEqual(1);
    });

    it('should render a compact reference field', function () {
        var scope = $rootScope.$new();
        scope.property = {
            fieldType: 'reference',
            propertyName: 'A reference field'
        };
        scope.data = '2ed9a5f0-b5de-4b93-9972-353b85dd7837';
        scope.record = { data: null };

        var element = $compile('<driver-details-field compact="true"' +
                               'property="property" data="data" record="record">' +
                               '</driver-details-field>')(scope);
        $rootScope.$apply();

        expect(element.find('.value.reference').length).toEqual(1);
        expect(element.find('.compact').length).toEqual(1);
        expect(element.find('label').length).toEqual(0);
    });
});
