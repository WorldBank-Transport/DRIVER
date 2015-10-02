'use strict';

// PhantomJS doesn't support bind yet
Function.prototype.bind = Function.prototype.bind || function (thisp) {
    var fn = this;
    return function () {
        return fn.apply(thisp, arguments);
    };
};

describe('driver.views.map: Layers Controller', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('ase.resources'));
    beforeEach(module('driver.mock.resources'));
    beforeEach(module('driver.resources'));
    beforeEach(module('ase.templates'));
    beforeEach(module('driver.views.map'));

    var $compile;
    var $controller;
    var $httpBackend;
    var $rootScope;
    var $scope;

    var Controller;
    var Element;
    var ResourcesMock;
    var DriverResourcesMock;
    var RecordState;

    beforeEach(inject(function (_$compile_, _$controller_, _$httpBackend_, _$rootScope_,
                                _ResourcesMock_, _DriverResourcesMock_, _RecordState_) {
        $compile = _$compile_;
        $controller = _$controller_;
        $httpBackend = _$httpBackend_;
        $scope = _$rootScope_.$new();
        $rootScope = _$rootScope_;
        DriverResourcesMock = _DriverResourcesMock_;
        ResourcesMock = _ResourcesMock_;
        RecordState = _RecordState_;

        var recordTypeUrl = /\/api\/recordtypes\/\?active=True/;
        $httpBackend.whenGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
        var boundaryUrl = /\/api\/boundaries\//;
        $httpBackend.whenGET(boundaryUrl).respond(200, ResourcesMock.BoundaryResponse);

        Element = $compile('<div leaflet-map driver-map-layers></div>')($scope);
        Controller = Element.controller('driverMapLayers');
        $rootScope.$apply();

        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();
    }));

    it('should have a controller', function () {
        expect(Controller).toBeDefined();
    });

    it('should build a popup', function () {
        expect(Controller.buildRecordPopup).toBeDefined();

        var record = DriverResourcesMock.RecordResponse.results[0];
        // JSONB from record is returned as string from UTFGrid
        record.data = JSON.stringify(record.data);

        var expected = '<div class="record-popup"><div><h3>Occurred on: 2015-07-30T17:36:29.263000Z</h3><h4>Person</h4><div style="margin:15px;"></div><h4>Crime Details</h4><div style="margin:15px;"><p>County: Philadelphia</p><p>Description: First test</p><p>District: 13</p></div><h4>Vehicle</h4><div style="margin:15px;"></div></div></div>';

        var popup = Controller.buildRecordPopup(record);
        expect(popup).toEqual(expected);
    });

    it('should filter URLs', function () {
        var interactivityUrl = 'http://localhost:7000/tiles/table/ashlar_record/id/ALL/5/26/15.grid.json';

        Controller.recordType = 'b4e49ec6-32f2-46db-9b27-d0f6ba5c9406';
        var resultUrl = Controller.getFilteredRecordUrl(interactivityUrl);

        expect(resultUrl).toBe('http://localhost:7000/tiles/table/ashlar_record/id/b4e49ec6-32f2-46db-9b27-d0f6ba5c9406/5/26/15.grid.json');
    });

    it('should listen for record type change', function() {
        spyOn(Controller, 'setRecordLayers');
        RecordState.setSelected({uuid: 'foo'});
        expect(Controller.setRecordLayers).toHaveBeenCalled();
    });

});
