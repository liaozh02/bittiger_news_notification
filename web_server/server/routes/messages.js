var express = require('express');
var router = express.Router();
var path = require('path');
const db = require("../db/mysql.js");
/* GET home page. */
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
                            res.status(200).end();
                        }
                    })                    
              })

});

module.exports = router;