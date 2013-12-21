/*
Test suite for parse subledger

Pass path as the path to Subledger.js
ex: 
var SubledgerTests = require("cloud/SubledgerTests.js");

var test = new SubledgerTests(path, id, secret, org_id, book_id);

It will create the accoring Cloud Code functions 
*/


var tests = function(path, id, secret, org_id, book_id){
var Subledger = require(path);
var subledger = new Subledger(id, secret, org_id, book_id);

Parse.Cloud.define("createAccountCategory", function(request, response) {
  	subledger.createAccountCategory(Subledger.CREDIT, "Credit account category", "http://create.account.category").then(function(data){
  		response.success(data)
  	}, function(error){
  		response.error(data);
  	});
});


Parse.Cloud.define("createAccount", function(request, response) {
  	subledger.createAccount(Subledger.DEBIT, "Debit account", "http://create.account").then(function(data){
  		response.success(data)
  	}, function(error){
  		response.error(data);
  	});
});

Parse.Cloud.define("attachAccount", function(request, response) {
  	subledger.attatchAccountToCategory(request.params.category_id, request.params.account_id).then(function(data){
  		response.success(data)
  	}, function(error){
  		response.error(data);
  	});
});


Parse.Cloud.define("createEntry", function(request, response) {
	var testEntry = {
     "effective_at": "2013-12-12T23:20:50.52Z",
     "description": "Test creating entry",
     "reference": "Reference",
     "lines": [
       {
         "account": request.params.account_0,
         "value": {
           "type": "debit",
           "amount": "10.00"
         }
       },
       {
         "account": request.params.account_1,
         "value": {
           "type": "credit",
           "amount": "10.00"
         }
       }
     ]
   };
  	subledger.createEntry(testEntry).then(function(data){
  		response.success(data)
  	}, function(error){
  		response.error(error);
  	});
});

Parse.Cloud.define("accountBalance", function(request, response){
	subledger.accountBalance(request.params.account_id, request.params.date).then(function(data){
  		response.success(data)
  	}, function(error){
  		response.error(error);
  	});
});

Parse.Cloud.define("accountHistory", function(request, response){
	history_params = request.params.history_params
	if (!history_params) {
		history_params = {"action":"starting", "effective_at": "2013-12-12T23:20:50.52Z", "limit":3}
	}
	subledger.accountHistory(request.params.account_id, history_params).then(function(data){
  		response.success(data)
  	}, function(error){
  		response.error(error);
  	});
});

}

module.exports = tests

