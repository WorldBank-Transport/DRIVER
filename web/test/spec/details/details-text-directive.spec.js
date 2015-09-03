'use strict';

describe('driver.details: DetailsText', function () {

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

    it('should render colors', function () {
        var scope = $rootScope.$new();
        scope.property = {
            fieldType: 'text',
            format: 'color',
            propertyName: 'Color field',
            type: 'string'
        };
        scope.data = '#ea1313';

        var element = $compile('<driver-details-text property="property" data="data">' +
                               '</driver-details-text>')(scope);
        $rootScope.$apply();

        expect(element.find('rect').length).toEqual(1);
        expect(element.find('.value.color').length).toEqual(1);
    });

    it('should render text', function () {
        var scope = $rootScope.$new();
        scope.property = {
            fieldType: 'text',
            format: 'text',
            propertyName: 'Text field',
            type: 'string'
        };
        scope.data = 'A single line of text';

        var element = $compile('<driver-details-text property="property" data="data">' +
                               '</driver-details-text>')(scope);
        $rootScope.$apply();

        expect(element.find('.value.text').length).toEqual(1);
    });

    it('should render textareas', function () {
        var scope = $rootScope.$new();
        scope.property = {
            fieldType: 'text',
            format: 'textarea',
            propertyName: 'Textarea field',
            type: 'string'
        };
        scope.data = 'Multiple \n lines \n of \n text';

        var element = $compile('<driver-details-text property="property" data="data">' +
                               '</driver-details-text>')(scope);
        $rootScope.$apply();

        expect(element.find('pre').length).toEqual(1);
        expect(element.find('.value.textarea').length).toEqual(1);
    });

    it('should render numbers', function () {
        var scope = $rootScope.$new();
        scope.property = {
            fieldType: 'text',
            format: 'number',
            propertyName: 'Number field',
            type: 'string'
        };
        scope.data = '42';

        var element = $compile('<driver-details-text property="property" data="data">' +
                               '</driver-details-text>')(scope);
        $rootScope.$apply();

        expect(element.find('.value.text').length).toEqual(1);
    });

    it('should render telephone numbers', function () {
        var scope = $rootScope.$new();
        scope.property = {
            fieldType: 'text',
            format: 'tel',
            propertyName: 'Telephone number field',
            type: 'string'
        };
        scope.data = '867-5309';

        var element = $compile('<driver-details-text property="property" data="data">' +
                               '</driver-details-text>')(scope);
        $rootScope.$apply();

        expect(element.find('.value.text').length).toEqual(1);
    });

    it('should render datetimes', function () {
        var scope = $rootScope.$new();
        scope.property = {
            fieldType: 'text',
            format: 'datetime',
            propertyName: 'DateTime field',
            type: 'string'
        };
        scope.data = '2015/09/01 00:00:00';

        var element = $compile('<driver-details-text property="property" data="data">' +
                               '</driver-details-text>')(scope);
        $rootScope.$apply();

        expect(element.find('.value.text').length).toEqual(1);
    });


    it('should render urls', function () {
        var scope = $rootScope.$new();
        scope.property = {
            fieldType: 'text',
            format: 'url',
            propertyName: 'URL field',
            type: 'string'
        };
        scope.data = 'http://test.com';

        var element = $compile('<driver-details-text property="property" data="data">' +
                               '</driver-details-text>')(scope);
        $rootScope.$apply();

        expect(element.find('a').length).toEqual(1);
        expect(element.find('.value.url').length).toEqual(1);
    });
});
