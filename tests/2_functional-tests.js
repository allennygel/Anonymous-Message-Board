/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
let messageId2;
  suite('API ROUTING FOR /api/threads/:board', function() {
    let messageId;
    suite('POST', function() {
      
      test('New board and message', function(done) {
       chai.request(server)
        .post('/api/threads/test')
        .send({
         board: 'test',
         text: 'hello',
         delete_password: 'hi'
        })
        .end(function(err, res){
         
         assert.equal(res.status, 200);
                   chai.request(server)
          .post('/api/threads/test/')
          .send({ board: 'test',
                 text: 'testText',
                 delete_password: 'testPass'})
          .end( (err, res) => {
            assert.equal(res.status, 200);

            
         done()
         })
       });
        
      })
    });
    suite('GET', function() {
      test('Get array with 10 most recent bumped threads with 3 most recent replies', function(done){
        chai.request(server)
        .get('/api/threads/test/')
        .end( (err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.isAtMost(res.body.length, 10);
          assert.property(res.body[0], '_id');
          assert.property(res.body[0], 'text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'bumped_on');
          assert.notProperty(res.body[0], 'reported');
          assert.notProperty(res.body[0], 'delete_password');
          assert.property(res.body[0], 'replies');
          assert.isArray(res.body[0].replies);
          assert.isAtMost(res.body[0].replies.length, 3);
          if(res.body[0].replies.length != 0) {
            assert.property(res.body[0].replies[0], '_id');
            assert.property(res.body[0].replies[0], 'text');
            assert.property(res.body[0].replies[0], 'created_on');
            assert.notProperty(res.body[0].replies[0], 'reported');
            assert.notProperty(res.body[0].replies[0], 'delete_password');
          };
          messageId = res.body[0]._id;
          messageId2 = res.body[1]._id;
          done();
        });
      });
    });
    
    suite('DELETE', function() {
      test('No delete with wrong thread_id', function(done){
        chai.request(server)
        .delete('/api/threads/test/')
        .send({ board: 'test',
                thread_id: '612521',
                delete_password: 'testPass'})
        .end( (err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incorrect password');
          
          done();
        });
      });
      
      test('No delete with wrond delete_password', function(done) {
        chai.request(server)
        .delete('/api/threads/test/')
        .send({ board: 'test',
                thread_id: messageId,
                delete_password: ''})
        .end( (err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incorrect password');
        console.log(messageId)
          done();
        });
      });
      
      test('Delete thread with thread_id and delete_password', function(done){
        chai.request(server)
        .delete('/api/threads/test/')
        .send({ board: 'test',
                thread_id: messageId,
                delete_password: 'hi'})
        .end( (err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          console.log('2nd', messageId2)
          done();
        });
      });
    });
    
    suite('PUT', function() {
       test('No reporting when given wrong thread_id', function(done){
        chai.request(server)
        .put('/api/threads/test/')
        .send({ board: 'test',
                thread_id: 5123 })
        .end( (err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incorrect thread id');
          
          done();
        });
      });
      
      test('Thread reported with thread_id', function(done) {
        chai.request(server)
        .put('/api/threads/test/')
        .send({ board: 'test',
                thread_id: messageId2 })
        .end( (err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          
          done();
        });
      });
    });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    let replyId;
    suite('POST', function() {
       test('Create reply on given thread with thread_id', function(done) {
        chai.request(server)
        .post('/api/replies/test')
        .send({ board: 'test',
                thread_id: messageId2,
                text: 'testText',
                delete_password: 'testPass' })
        .end( (err, res) => {
          assert.equal(res.status, 200);
          
          done();
        });
      });
    });
    
    suite('GET', function() {
      test('Get no thread with board and wrong thread_id', function(done){
        chai.request(server)
        .get('/api/replies/test')
        .query({ thread_id: '101235' })
        .end( (err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incorrect thread id or board');
          
          done();
        });
      });
      
      test('Get thread and all replies with board, thread_id', function(done){
        chai.request(server)
        .get('/api/replies/test')
        .query({ thread_id: messageId2 })
        .end( (err, res) => {
          assert.equal(res.status, 200);
          assert.propertyVal(res.body, '_id', messageId2);
          assert.property(res.body, 'text');
          assert.property(res.body, 'created_on');
          assert.property(res.body, 'bumped_on');
          assert.notProperty(res.body, 'reported');
          assert.notProperty(res.body, 'delete_password');
          assert.property(res.body, 'replies');
          assert.isArray(res.body.replies);
          if(res.body.replies.length > 0) {
            assert.property(res.body.replies[0], '_id');
            assert.property(res.body.replies[0], 'text');
            assert.property(res.body.replies[0], 'created_on');
            assert.notProperty(res.body.replies[0], 'reported');
            assert.notProperty(res.body.replies[0], 'delete_password');
            replyId = res.body.replies[0]._id;
          }
          
          done();
        });
      });
    });
    
    suite('PUT', function() {
       test('No reply reporting with wrong thread_id', function(done){
        chai.request(server)
        .put('/api/replies/test')
        .send({ board: 'test',
                thread_id: '12312',
                reply_id: replyId })
        .end( (err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incorrect thread or reply id');
          
          done();
        });
      });
      
      test('No reply reporting with wrong reply_id', function(done){
        chai.request(server)
        .put('/api/replies/test')
        .send({ board: 'test',
                thread_id: messageId2,
                reply_id: '23123' })
        .end( (err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incorrect thread or reply id');
          
          done();
        });
      });
      
      test('Report reply with board, thread_id, reply_id', function(done){
        chai.request(server)
        .put('/api/replies/test')
        .send({ board: 'test',
                thread_id: messageId2,
                reply_id: replyId })
        .end( (err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          
          done();
        });
      });
    });
    
    suite('DELETE', function() {
      test('No reply deleting with board, thread_id, delete_password, wrong reply_id', function(done) {
        chai.request(server)
        .delete('/api/replies/test')
        .send({ board: 'test',
                thread_id: messageId2,
                reply_id: '15124',
                delete_password: 'testPass'})
        .end( (err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incorrect thread/reply id or password');
          
          done();
        });
      });
      
      test('No reply deleting with board, reply_id, delete_password, wrong thread_id', function(done) {
        chai.request(server)
        .delete('/api/replies/test')
        .send({ board: 'test',
                thread_id: '612124',
                reply_id: replyId,
                delete_password: 'testPass'})
        .end( (err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incorrect thread/reply id or password');
          
          done();
        });
      });
      
      test('No reply deleting with board, reply_id, thread_id, wrong delete_password', function(done) {
        chai.request(server)
        .delete('/api/replies/test')
        .send({ board: 'test',
                thread_id: messageId2,
                reply_id: replyId,
                delete_password: ''})
        .end( (err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incorrect thread/reply id or password');
          
          done();
        });
      });
      
      test('Delete reply with board, reply_id, thread_id, delete_password', function(done) {
        chai.request(server)
        .delete('/api/replies/test')
        .send({ board: 'test',
                thread_id: messageId2,
                reply_id: replyId,
                delete_password: 'testPass'})
        .end( (err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          
          done();
        });
      });
    });
    
  });

});
