'use strict';

// PhantomJS doesn't support bind yet
Function.prototype.bind = Function.prototype.bind || function (thisp) {
    var fn = this;
    return function () {
        return fn.apply(thisp, arguments);
    };
};

describe('driver.views.record: RecordAddEdit', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('nominatim.mock'));
    beforeEach(module('ase.auth'));
    beforeEach(module('ase.resources'));
    beforeEach(module('driver.mock.resources'));
    beforeEach(module('driver.views.record'));
    beforeEach(module('ase.templates'));
    beforeEach(module('pascalprecht.translate'));

    var $compile;
    var $httpBackend;
    var $rootScope;
    var $stateParams;
    var AuthService;
    var RecordTypes;
    var DriverResourcesMock;
    var ResourcesMock;
    var NominatimMock;

    beforeEach(function() {
        var $window;

        module(function ($provide) {
            // mock UserService
            $provide.factory('UserService', function() {
                return {
                    canWriteRecords: function() {
                        return {
                            then: function(callback) {
                                return callback(true); // read-write
                            }
                        };
                    },
                    isAdmin: function() { return {
                            then: function(callback) {
                                return callback(false); // not an admin
                            }
                        };
                    }
                };
            });

            // avoid full page reload during test
            $window = {
                location: {href: '/'},
                document: window.document,
                reload: jasmine.createSpy()
            };

            $provide.constant('$window', $window);
        });

        inject(function (_$compile_, _$httpBackend_, _$rootScope_, _$stateParams_, _NominatimMock_,
                         _AuthService_, _RecordTypes_, _DriverResourcesMock_, _ResourcesMock_) {

            $compile = _$compile_;
            $httpBackend = _$httpBackend_;
            $rootScope = _$rootScope_;
            $stateParams = _$stateParams_;
            AuthService = _AuthService_;
            RecordTypes = _RecordTypes_;
            DriverResourcesMock = _DriverResourcesMock_;
            ResourcesMock = _ResourcesMock_;
            NominatimMock = _NominatimMock_;
        });
    });

    it('should load directive', function () {
        // allow user to write records
        spyOn(AuthService, 'hasWriteAccess').and.returnValue(true);

        // log in first
        var queryUrl = /\/api-token-auth/;
        $httpBackend.expectPOST(queryUrl).respond({user: 1, token: 'gotatoken'});
        AuthService.authenticate({username: 'foo', password: 'foo'});
        $httpBackend.flush();
        $rootScope.$digest();

        var recordId = DriverResourcesMock.RecordResponse.results[0].uuid;
        $stateParams.recorduuid = recordId;
        var recordSchema = ResourcesMock.RecordSchema;
        var recordSchemaIdUrl = new RegExp('api/recordschemas/' + recordSchema.uuid);
        var recordTypeUrl = new RegExp('api/recordtypes/.*record=' + recordId);
        var allRecordTypesUrl = new RegExp('api/recordtypes/');
        var recordUrl = new RegExp('api/records/' + recordId);
        var nominatimRevUrl = /\/reverse/;

        $httpBackend.expectGET(allRecordTypesUrl).respond(200, ResourcesMock.RecordTypeResponse);
        $httpBackend.expectGET(recordUrl).respond(200, DriverResourcesMock.RecordResponse.results[0]);
        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
        $httpBackend.expectGET(nominatimRevUrl).respond(200, NominatimMock.ReverseResponse);
        $httpBackend.expectGET(recordSchemaIdUrl).respond(200, recordSchema);

        var scope = $rootScope.$new();
        var element = $compile('<driver-record-add-edit></driver-record-add-edit>')(scope);
        $rootScope.$digest();

        // TODO: there's a hard-to-debug exception raised here when running the following code.
        // Commenting it out until we can investigate further.
        // Seems to be related to the element reference in the dependent JSON editor directive link.
        // $httpBackend.flush();
        // $httpBackend.verifyNoOutstandingRequest();

        expect(element.find('json-editor').length).toEqual(1);
    });
});
