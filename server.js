var Particle = require('particle-api-js');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
const express = require('express');
const app = express();

var server = require('http').createServer(app);
var io = require('socket.io')(server);

var Devices = require('./models/device.js');
var EventsObj = require('./models/eventObj.js');

var particle = new Particle();
var token;

var myDevice = '190036001047343438323536';

//connexion db
var promise=mongoose.connect('mongodb://localhost:27017/objet',{
    useMongoClient:true,
});


promise.then(function(db){
    console.log('db.connected');
    server.listen(3000, function(){
        console.log('Listenning on port 3000!');
    });
});

io.sockets.on('connection', function(socket){
    console.log('User Connected');
    socket.on('Disconnect', function(){
        console.log('User Discnnected');
    });
});

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.set('views','./views');
app.use('/client',express.static('./client/'));

app.get('/', function(req,res){
    res.sendFile(__dirname + '/index.html');
});


app.get('/event',function(req,res){
    EventsObj.find({},null,function(err,collection){
        if(err){
            console.log(err);
            return res.send(500);
        }else{
            // console.log(collection);
            res.send(collection);
        }
    });
});

app.get('/liste',function(req,res){
    Devices.find({},null,function(err,collection){
        if(err){
            console.log(err);
            return res.send(500);
        }else{
            // console.log(collection);
            res.send(JSON.stringify(collection));
        }
    });
});

app.get('/liste/:id', function(req,res){
    Devices.findOne({'_id':req.params.id},function(err,objet){
        if(err){
            console.log('Find Error' + err);
        }else {
            return res.send(objet);
        }
    });
});

particle.login({username:'sikara57@gmail.com',password:'zfgp64s3*'}).then(
    function(data){
        token = data.body.access_token;
        console.log('Access Granted !');
        var devicesPr = particle.listDevices({ auth: token });
        devicesPr.then(
            function(devices){
              //console.log('Devices: ', devices);
              devices.body.forEach(function(device){
                // console.log(device.id);
                Devices.findOne({"id":device.id}, function(err,objet){
                    if(objet)
                    {
                        // si je trouve objet je update
                        console.log('device Update in progress');
                        var dateActu = new Date();
                        var toUpdate = new Devices(objet);
                        toUpdate.last_heard = dateActu.toISOString();
                        Devices.findByIdAndUpdate(objet._id,toUpdate,{new:true}, function(err,objet){
                            if(err){
                                console.log('Update Error ' + err);
                            }else{
                                console.log('Device updated ');
                            }
                        });

                    }
                    else if(err)
                    {
                        console.log('Error '+ err);
                    }
                    else
                    { 
                        // Si je trouve pas un objet avec le même id objet je l'ajoute
                        console.log('device Add in progress');
                        var toSave = new Devices(device);
                        toSave.save(function(err,success){
                            if(err){
                                console.log('Add Error '+ err);
                            }else{
                                console.log('Device added');
                            }
                        });
                    }
                })
                
              });
            },
            function(err) {
              console.log('List devices call failed: ', err);
            }
        );
        particle.getEventStream({ deviceId: myDevice,name: 'beamStatus', auth: token }).then(function(stream) {
            stream.on('event', function(data) {
                var toSave = new EventsObj(data);
                toSave.save(function(err,success){
                    if(err){
                        console.log('Add event Error ' + err);
                    }else{
                        console.log('Event added');
                        io.emit('newEvent',success);
                    }
                });
              // console.log("Event: " + JSON.stringify(data));
            });
        });
        particle.getEventStream({ deviceId: myDevice,name: 'Intensity', auth: token }).then(function(stream) {
            stream.on('event', function(data) {
                var toSave = new EventsObj(data);
                toSave.save(function(err,success){
                    if(err){
                        console.log('Add event Error ' + err);
                    }else{
                        console.log('Intensity Chart Value added');
                        io.emit('Intensity',success);
                    }
                });
              // console.log("Event: " + JSON.stringify(data));
            });
        });

    },
    function(err){
        console.log('Could not login '+ err);
    }
);

app.post('/event', function(req,res){
    console.log("une requete est arrivée");
    var objet = {};
    var fnPr = particle.callFunction({ deviceId: myDevice, name: 'light', argument: 'hi', auth: token });
 
    fnPr.then(
        function(data) {
            console.log('Function called succesfully');
            var EventLight = {
                'device':myDevice,
                'data':data
            };
            io.emit('etatLight',EventLight);
        }, function(err) {
            console.log('An error occurred');
    });
});


app.post('/liste', function(req,res){
    var myPhoto = particle.getVariable({ deviceId: myDevice, name: 'analogvalue', auth: token });
    
    myPhoto.then(
        function(data) {
            console.log('Device variable retrieved successfully:', data);
        }, 
        function(err) {
            console.log('An error occurred while getting attrs:', err);
    });
});