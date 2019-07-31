const MongoClient  = require('mongodb').MongoClient;
const ObjectId     = require('mongodb').ObjectId;
const shortid      = require('shortid');

const MONGO_URI = process.env.DB;

function repliesHandler() {
  
  this.getReplies = function(board, id, callback) {
    MongoClient.connect(MONGO_URI, function(err, db) {
      if(err) console.log('DATABASE CONNECTION ERROR ' + err);
      
      db.collection(board).find({_id: id}).limit(1).project({reported: 0, 'delete_password': 0}).toArray(function(err, data) {
        if(err) console.log('DATABASE ERROR ' + err);
        
        let result = data.map(x => {
          
          x.replies = x.replies.map( i=> { delete i.reported; delete i.delete_password; return i;});
          return x;
        })
        
        callback(null, result[0])
        
        db.close()
      })
    })
  }
  
  this.postReplies = function(board, body, callback) {
    const ShortId = shortid.generate(); // makes short unique ids
    const id = body['thread_id']
    
    let newReplies = {
     _id: ShortId,
     text: body.text,
     created_on:  Date(),
     reported: false,
     delete_password: body.delete_password,
   };
    
    MongoClient.connect(MONGO_URI, function(err, db) {
     if(err) console.log('DATABASE CONNECTION ERROR '+ err)
     db.collection(board).findOneAndUpdate({_id: id},{$push: {replies: newReplies}, $set: {bumped_on: Date()} }, 
      function(err, data) {
       if(err) console.log('DATABASE ERROR ' + err)
       
       callback(null, data)
       
       db.close()
     });
   })
  }
  
  this.reportReply = function(board, body, callback) {
    const id = body['thread_id'] || body['report_id'];
    const replyId = body.reply_id;
    
    MongoClient.connect(MONGO_URI, function(err, db) {
      if(err) console.log('DATABASE CONNECTION ERROR '+ err);
      db.collection(board).updateOne({_id: id, 'replies._id': replyId}, {$set: {"replies.$.reported": true}},function(err, data) {
        if(err) console.log('DATABASE ERROR ' + err)
        
        callback(null, data)
        db.close()
      })
    })
  }
   
  this.deleteReply = function(board, body, callback) {
    const id = body['thread_id'];
    const replyId = body.reply_id;
    const password = body['delete_password'];
    
    MongoClient.connect(MONGO_URI, function(err, db) {
      if(err) console.log('DATABASE CONNECTION ERROR '+ err);
      db.collection(board).findOneAndUpdate({_id: id, replies: {$elemMatch: {_id: replyId, delete_password: password}}},
      {$set: {"replies.$.text": "[This comment has been removed]" }}, function(err, data) {
        if(err) console.log('DATABASE ERROR ' + err);
        
        callback(null, data)
        db.close
      })
    })
  }
};

module.exports = repliesHandler;