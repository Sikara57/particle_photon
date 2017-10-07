app.factory('deviceEventFactory', function($resource){
	return $resource('http://localhost:3000/event/:eventId',{eventId:'@id'},
	{
		update:
		{
			method : 'PUT'
		}
	});
});