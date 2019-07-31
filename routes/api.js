/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
const MongoClient  = require('mongodb').MongoClient;
const ObjectId     = require('mongodb').ObjectId;
const messagehandler = require('../controllers/messageHandler.js');
const replieshandler = require('../controllers/repliesHandler.js');

const MONGO_URI = process.env.DB;
module.exports = function (app) {
  
  const messageHandler = new messagehandler();  
  const repliesHandler = new replieshandler();
  
  app.route('/api/threads/:board')
  
    .get(function(req,res) {
      const query = req.query;
      const board = req.params.board;
      const getMessages = messageHandler.getMessages(board, query, function(err, getData) {
        if(err) res.send('Server error, please try again later.');
      
        res.json(getData)
    });
    
  })
  
    .post(function(req, res) {
      const body = req.body;
      const board = req.params.board;
    
      const postMessage = messageHandler.postMessage(board, body, function(err, postData) {
        if(err) res.send('Server error, please try again later.');
      
        res.redirect('/b/' + board)
    });
      
  })
  
    .put(function(req, res) {
    
      const body = req.body
      const board = req.params.board
      const reportMessage = messageHandler.reportMessage(board, body, function(err, putData) {
        if(err) res.send('Server error, please try again later.');
        
        if(putData.result.n === 0) {
          res.send('incorrect thread id')
      } else {
        res.send('success')
      }
        
    })
    
  })
  
  .delete(function(req, res) {
    
    const body = req.body;
    const board = req.params.board;
    const deleteMessage = messageHandler.deleteMessage(board, body, function(err, deleteData) {
      if(err) res.send('Server error, please try again later.');
  
      if(deleteData.value === null || deleteData.value === undefined) {
        res.send('incorrect password');
      } else {
      res.send('success')
      }
    })

  })
  
  app.route('/api/replies/:board')
  
  .get(function(req, res) {
    const id = req.query.thread_id;
    const board = req.params.board;
    const getReplies = repliesHandler.getReplies(board, id, function(err, getData) {
      if(err) res.send('Server error, please try again later.');
      
      if(getData === undefined || getData === null) {
        res.send('incorrect thread id or board')
      } else {
      res.json(getData)
      }
      
    });
  })
  
  .post(function(req, res) {
    const body = req.body;
    const board = req.params.board
    const postMessage = repliesHandler.postReplies(board, body, function(err, postData) {
      if(err) res.send('Server error, please try again later.');
      
      res.redirect('/b/'+ board +'?thread_id='+ body.thread_id)
    });
  })
  
  .put(function(req, res) {
    const body = req.body;
    const board = req.params.board;
    const reportReply = repliesHandler.reportReply(board, body, function(err, putData) {
      if(err) res.send('Server error, please try again later.');
      
      if(putData.result.n === 0) {
          res.send('incorrect thread or reply id')
      } else if(putData.result.n === 1){
        res.send('success')
      };
    });
    
  })
  
  .delete(function(req, res) {
    const body = req.body;
    const board = req.params.board;
    const deleteReply = repliesHandler.deleteReply(board, body, function(err, deleteData) {
      if(err) res.send('Server error, please try again later.');
  
      if(deleteData.value === null || deleteData.value === undefined) {
        res.send('incorrect thread/reply id or password');
      } else {
      res.send('success')
      }
    })
  })
};
