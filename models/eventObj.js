var mongoose = require('mongoose');

var eventObjsSchema = mongoose.Schema({
        "data": String,
        "ttl": Number,
        "published_at": Date,
        "coreid": String,
        "name": String,
});
// je crée un model et j'attache le schema ci dessus
var EventObj = mongoose.model('EventObj', eventObjsSchema);

module.exports = EventObj;