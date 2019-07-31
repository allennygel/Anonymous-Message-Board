const MongoClient  = require('mongodb').MongoClient;
const ObjectId     = require('mongodb').ObjectId;
const shortid      = require('shortid');

const MONGO_URI = process.env.DB;

function messageHandler() {
  
  this.getMessages = function(board, query, callback) {
   let Query = Object.keys(query).reduce((x, i) => { x[i] = query[i]; return x }, {});
    
    MongoClient.connect(MONGO_URI, function(err, db) {
      if(err) console.log('DATABASE CONNECTION ERROR ' + err);
      db.collection(board).find(Query).limit(10).sort({bumped_on: -1}).project({reported: 0, 'delete_password': 0, }).toArray(function(err, data) {
        if(err) console.log('DATABASE ERROR ' + err);
        
        let result = data.map(x => {
          x.replyCount = x.replies.length;
          
          x.replies = x.replies.slice( x.replies.length >= 3 ? -3 : -x.replies.length );
          x.replies = x.replies.map( i=> { delete i.reported; delete i.delete_password; return i;});
          return x;
        })
        
        callback(null, result)
        
        db.close()
      })
    })
  }
  
  this.postMessage = function(board, body, callback) {
   const id = shortid.generate(); // makes short unique ids
    
    let newMessage = {
     _id: id,
     text: body.text,
     created_on:  Date(),
     bumped_on:  Date(),
     reported: false,
     delete_password: body.delete_password,
     replies: []
   };
    
    MongoClient.connect(MONGO_URI, function(err, db) {
     if(err) console.log('DATABASE CONNECTION ERROR '+ err)
      
     db.collection(board).insertOne(newMessage, function(err, data) {
       if(err) console.log('DATABASE ERROR ' + err)
       
       callback(null, data)
       
       db.close()
     });
   })
  }
  
  this.reportMessage = function(board, body, callback) {
    const id = body['thread_id'] || body['report_id']
    
    MongoClient.connect(MONGO_URI, function(err, db) {
      if(err) console.log('DATABASE CONNECTION ERROR '+ err);
      db.collection(board).updateOne({_id: id}, {$set: {reported: true}}, function(err, data) {
        if(err) console.log('DATABASE ERROR ' + err)
        callback(null, data)
        db.close()
      })
    })
  }
  
  this.deleteMessage = function(board, body, callback) {
    const id = body['thread_id']
    const password = body['delete_password']
    
    MongoClient.connect(MONGO_URI, function(err, db) {
      if(err) console.log('DATABASE CONNECTION ERROR '+ err);
      db.collection(board).findOneAndDelete({_id: id, delete_password: {$eq: password} }, function(err, data) {
        if(err) console.log('DATABASE ERROR ' + err);
        callback(null, data)
        db.close
      })
    })
  }
}
module.exports = messageHandler;