(function () {
    'use strict';

    /* ngInject */
    function InterventionsController(InitialState) {
	    var ctl = this;
        InitialState.ready().then(initialize);
        return ctl;

        function initialize() {
        	ctl.exportCSV = exportCSV;
        }

    	function exportCSV() {
    		//TODO
    	}

    }

    angular.module('driver.interventions')
    .controller('InterventionsController', InterventionsController);

})();
