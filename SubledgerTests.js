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
    	subledger.Category.Create(Subledger.CREDIT, "Credit account category", "http://create.account.category").then(function(data){
    		response.success(data)
    	}, function(error){
    		response.error(error);
    	});
  });


  Parse.Cloud.define("createAccount", function(request, response) {
    	subledger.Account.Create(Subledger.DEBIT, "Debit account", "http://create.account").then(function(data){
    		response.success(data)
    	}, function(error){
    		response.error(error);
    	});
  });

  Parse.Cloud.define("attachAccount", function(request, response) {
    var category = new subledger.Category(request.params.category_id);
    	category.attachAccountId(request.params.account_id).then(function(data){
    		response.success(data)
    	}, function(error){
    		response.error(error);
    	});
  });


  Parse.Cloud.define("createEntry", function(request, response) {
    var date = new Date();
    var effectiveAt = date.toISOString();
  	var testEntry = {
       "effective_at": effectiveAt,
       "description": "Test creating entry",
       "reference": "http://www.reference.com",
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
    	subledger.JournalEntry.CreateAndPost(testEntry).then(function(data){
    		response.success(data)
    	}, function(error){
    		response.error(error);
    	});
  });

  Parse.Cloud.define("accountBalance", function(request, response){
    var account =  new subledger.Account(request.params.account_id);
    var date = new Date();
    var effectiveAt = date.toISOString();
    account.balance(effectiveAt).then(function(data){
    		response.success(data)
    	}, function(error){
    		response.error(error);
    	});
  });

  Parse.Cloud.define("accountHistory", function(request, response){
    var date = new Date();
    var effectiveAt = date.toISOString();
  	history_params = request.params.history_params
  	if (!history_params) {
  		history_params = {"action":"starting", "effective_at": effectiveAt, "limit":3}
  	}
    var account = new subledger.Account(request.params.account_id);
  	account.lines(history_params.action, history_params.effective_at, undefined, history_params.limit).then(function(data){
    		response.success(data)
    	}, function(error){
    		response.error(error);
    	});
  });

}

module.exports = tests

