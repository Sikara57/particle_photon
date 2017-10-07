app.factory('deviceFactory', function($resource){
	return $resource('http://localhost:3000/liste/:deviceId',{deviceId:'@id'},
	{
		update:
		{
			method : 'PUT'
		}
	});
});