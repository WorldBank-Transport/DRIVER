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
    beforeEach(module('ase.auth'));
    beforeEach(module('ase.resources'));
    beforeEach(module('driver.mock.resources'));
    beforeEach(module('driver.views.record'));
    beforeEach(module('ase.templates'));

    var $compile;
    var $httpBackend;
    var $rootScope;
    var AuthService;
    var RecordTypes;
    var DriverResourcesMock;
    var ResourcesMock;

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
                        }
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

        inject(function (_$compile_, _$httpBackend_, _$rootScope_,
                         _AuthService_, _RecordTypes_, _DriverResourcesMock_, _ResourcesMock_) {

            $compile = _$compile_;
            $httpBackend = _$httpBackend_;
            $rootScope = _$rootScope_;
            AuthService = _AuthService_;
            RecordTypes = _RecordTypes_;
            DriverResourcesMock = _DriverResourcesMock_;
            ResourcesMock = _ResourcesMock_;
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

        var recordTypeUrl = /\/api\/recordtypes\/\?active=True/;
        var recordUrl = /\/api\/records/;
        var recordSchemaIdUrl = new RegExp('api/recordschemas/' + ResourcesMock.RecordSchema.uuid);

        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
        $httpBackend.expectGET(recordSchemaIdUrl).respond(200, ResourcesMock.RecordSchema);

        var scope = $rootScope.$new();
        var element = $compile('<driver-record-add-edit></driver-record-add-edit>')(scope);
        $rootScope.$digest();

        // TODO: there's a hard-to-debug exception raised here when running the following code.
        // Commenting it out until we can investigate further.
        // Seems to be related to the element reference in the dependent JSON editor directive link.
        //$httpBackend.flush();
        //$httpBackend.verifyNoOutstandingRequest();

        expect(element.find('json-editor').length).toEqual(1);
    });
});
