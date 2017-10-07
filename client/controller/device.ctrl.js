app.controller('device.ctrl', function($scope,$routeParams,deviceFactory,deviceEventFactory){

	$scope.myDevice = deviceFactory.get({deviceId:$routeParams.id});
	var socket = io.connect();
	$scope.myDeviceEvent = [];
	$scope.appareil = '';
	$scope.switchLight = '';
	$scope.load = true;

	$scope.myDeviceEvent = deviceEventFactory.query();

	socket.on('newEvent',function(data){
		// console.log(data);
		$scope.myDeviceEvent.unshift(data);
		$scope.load = false;
		$scope.$apply();
	});

	$scope.light = function()
	{
		deviceEventFactory.save();
		socket.on('etatLight',function(data){
			if(data.data.body.return_value == 0)
			{
				$scope.switchLight = 'Lampe allumée !';
			}
			else if(data.data.body.return_value == 1)
			{
				$scope.switchLight = 'Lampe éteinte !';
			}
			else
			{
				$scope.switchLight = 'Erreur';
			}
			
			$scope.appareil = data.device;
		});
	}

	$scope.labels = [0];
	$scope.series = ['Intensity'];
	$scope.data = [0];

	$scope.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
	$scope.options = {
	scales: {
	  yAxes: [
	    {
	      id: 'y-axis-1',
	      type: 'linear',
	      display: true,
	      position: 'left'
	    }
	  ]
	}
	};

	socket.on('Intensity',function(data){
		// console.log(data.data);
		var last_elem = $scope.labels[$scope.labels.length-1];
		$scope.labels.push(last_elem + 5);
		$scope.data.push(data.data);
		$scope.$apply();
	});
});