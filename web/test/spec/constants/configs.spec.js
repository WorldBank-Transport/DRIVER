/**
 * Tests to ensure there is no namespace conflict between the two loaded project config constants.
 */

'use strict';

// PhantomJS doesn't support bind yet
Function.prototype.bind = Function.prototype.bind || function (thisp) {
    var fn = this;
    return function () {
        return fn.apply(thisp, arguments);
    };
};

describe('driver.views.map: WebConfig and ASEConfig', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('ase.resources'));
    beforeEach(module('driver.mock.resources'));
    beforeEach(module('driver.resources'));

    var ResourcesMock;
    var DriverResourcesMock;
    var WebConfig;
    var ASEConfig;

    beforeEach(inject(function (_ResourcesMock_, _DriverResourcesMock_, _WebConfig_, _ASEConfig_) {

        DriverResourcesMock = _DriverResourcesMock_;
        ResourcesMock = _ResourcesMock_;
        WebConfig = _WebConfig_;
        ASEConfig = _ASEConfig_;
    }));

    it('should have a web app config constant', function () {
        expect(WebConfig).toBeDefined();
    });

    it('should have a schema editor config constant', function () {
        expect(ASEConfig).toBeDefined();
    });

    it('should have a Windshaft URL on the web app config', function() {
        expect(WebConfig.windshaft.hostname).toBeDefined();
    });

    it('should *not* have a Windshaft URL on the editor config', function() {
        expect(ASEConfig.windshaft).toBeUndefined();
    });

    it('should reference the same API endpoint from both app configs', function() {
        expect(ASEConfig.api.hostname).toEqual(WebConfig.api.hostname);
    });

});
