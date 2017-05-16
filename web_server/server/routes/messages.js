var express = require('express');
var router = express.Router();
var path = require('path');
const db = require("../db/mysql.js");
//var amqp = require("../queue/amqp");

/* Write/Reply New message */
router.post('/userId/:userId', function(req, res, next) {
    const userId = req.params.userId;
    const title = req.body.title;
    const text = req.body.text;
    const tag = req.body.tag;
    const parentId = req.body.parentId == ""? "null": req.body.parentId;
    const recIdList = req.body.recId;
    db.query(`INSERT INTO msgs (title, sendTime, text, createdById, tag) 
              VALUES (? , now(), ?, ?,  ?)`,
              [title, text, userId, tag],
              (error, results, fields) => {
                    if(error)
                        res.status(400).end();
                    const msgId = results.insertId.toString();
                    var queryStr = "";
                    var insertStr = "INSERT INTO msgRecords (msgId, recId, status, parentId) VALUES (";
                    for(var i in recIdList) {
                        queryStr += insertStr + msgId + ", \'" + recIdList[i] + "\', 1, " + parentId + ");";
                        console.log(queryStr);
                    }
                    db.query(queryStr, (error,results, fields) => {
                        if(error) {
                            res.status(400).end();
                        }
                        else {
                            for(var i in results) {
                                console.log("msgID: " + msgId + "recordId:" + results[i].insertId);
                            }
                            res.status(200).end();
                        }
                    })                    
              })

});

// Get all received messages
router.get('/received/userId/:userId', function(req, res, next) {
    const userId = req.params.userId;
    console.log(userId);
    db.query(`CREATE TEMPORARY TABLE userRecords 
              SELECT * FROM msgRecords WHERE recId = ?;
              SELECT msgs.id,msgs.title, msgs.text, msgs.sendTime, 
              msgs.tag, msgs.createdById, userRecords.status,
              userRecords.parentId 
              FROM userRecords LEFT JOIN msgs 
              ON userRecords.msgId = msgs.id
              ORDER BY msgs.sendTime DESC;`,
              [userId], (error, results, fields) => {
                    if(error) {
                        res.status(400).end();
                    }
                    var jsonList = [];
                    for(var i in results[1]) {
                        result = results[1][i]
                        result = JSON.stringify(result);
                        result = JSON.parse(result);
                        console.log(result);
                        jsonList.push(result);
                    }
                    
                    res.status(200).json(jsonList);
              })
});

//Modify message status
router.put('/userId/:userId/messageId/:messageId', function(req, res, next) {
    const userId = req.params.userId;
    const messageId = parseInt(req.params.messageId);
    const change = req.body.change;
    var status = 0;
    if(change == '0') {
        status = 2;
    }
    else if (change == '1'){
        status = 4;
    }
    else {
        res.status(400).end();
    }
    db.query(`UPDATE msgRecords SET status = ? 
            WHERE msgId = ? and recId = ?`,
            [status,messageId, userId], (err, results, fields) =>{
                if(err) {
                    res.status(400).end();
                }
                console.log(results);
                res.status(200).end();
            })
    
    
});

// delete message
router.delete('/userId/:userId/messageId/:messageId', function(req, res, next) {
    const userId = req.params.userId;
    const messageId = parseInt(req.params.messageId);
    db.query(`UPDATE msgRecords SET status = 3 
            WHERE msgId = ? and recId = ?`,
            [messageId, userId], (err, results, fields) =>{
                if(err) {
                    res.status(400).end();
                }
                console.log(results);
                res.status(200).end();
            })
    
});
module.exports = router;