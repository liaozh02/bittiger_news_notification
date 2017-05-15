var express = require('express');
var router = express.Router();

const db = require("../db/mysql.js");

/* GET users listing. */
router.post('/login', function(req, res, next) {
    const email = req.body.email;
    const password = req.body.password;
    var admin = "0";
    var adminGroup = "";
    var adminGroupMembers = [];
    var userGroup = [];
    var userGroupContacts = [];

    verifyPassword(email, password).then(() => {
        getAdminGroupName(email).then((results) => {
            if(results.length > 0) {
                //user is administrator, updata admin group info
                admin = "1";
                adminGroup = results[0].name;
                getAdminGroupMembers(email).then((results) => {
                    for(var i in results) {
                        adminGroupMembers.push(results[i].userEmail);
                    }
                        userGroup = ['BITTIGER'];
                        userGroupContacts = [];
                        res.status(200).json({
                            admin: admin,
                            adminGroup: adminGroup,
                            adminGroupMembers: adminGroupMembers,
                            userGroup: userGroup,
                            userGroupContacts: userGroupContacts
                        });               
                })
            }
            else {
                //user is not administrator, get usergroup infomation
                getUserGroupName(email).then((results) => {
                    for(var i in results) {
                        userGroup.push(results[i].name);
                    }
                    getUserGroupContacts(email).then((results) => {                      
                        for(var i in results) {
                            var contact = {}
                            contact[results[i].name] = results[i].adminEmail;
                            userGroupContacts.push(contact);
                        }
                         res.status(200).json({
                            admin: admin,
                            adminGroup: adminGroup,
                            adminGroupMembers: adminGroupMembers,
                            userGroup: userGroup,
                            userGroupContacts: userGroupContacts
                        }); 
                    })
                })
            }
        })
    })
    .catch((reason) => {
        res.status(400).json({message:reason});
    })

});

var verifyPassword = function(email, password) {
    return new Promise( (resolve, reject) => {
         db.query("SELECT * FROM users WHERE email = ?", [email], 
                 (error, results, fields) => {
                     if(error){
                         reject(error);
                     }
                     if(results.length >0) {
                        if(results[0].password == password) {
                            resolve();}
                     }
                     reject('Incorrect PWD/User');
                 })
    })
}

var getAdminGroupName = function(email) {
    return new Promise( (resolve, reject) => {
         db.query("SELECT name FROM groups WHERE id = (SELECT groupId FROM admins WHERE adminEmail = ?)", 
         [email], (error, results, fields) => {
                     if(error){
                         reject(error);
                     }

                     results = JSON.stringify(results);
                     results = JSON.parse(results);
                     resolve(results);                     
                 })
    })
}

var getAdminGroupMembers = function(email) {
    return new Promise( (resolve, reject) => {
         db.query("SELECT userEmail FROM members WHERE groupId = (SELECT groupId FROM admins WHERE adminEmail = ?)", 
         [email], (error, results, fields) => {
                     if(error){
                         reject(error);
                     }

                     results = JSON.stringify(results);
                     results = JSON.parse(results);
                     resolve(results);                     
                 })
    })
}


var getUserGroupName = function(email) {
    return new Promise( (resolve, reject) => {
         db.query("SELECT name FROM groups WHERE id in (SELECT groupId FROM members WHERE userEmail = ?)", 
         [email], (error, results, fields) => {
                     if(error){
                         reject(error);
                     }
                     results = JSON.stringify(results);
                     results = JSON.parse(results);
                     resolve(results);                     
                 })
    })
}

var getUserGroupContacts = function(email) {
    return new Promise( (resolve, reject) => {
         db.query(`SELECT groups.name, admins.adminEmail 
                   FROM groups LEFT JOIN admins ON groups.id = admins.groupId
                   WHERE groups.id in 
                   (SELECT groupId FROM members WHERE userEmail = ?)`, 
                    [email], (error, results, fields) => {
                                if(error){
                                    reject(error);
                                }

                     results = JSON.stringify(results);
                     results = JSON.parse(results);
                     resolve(results);                     
                 })
    })
}

module.exports = router;