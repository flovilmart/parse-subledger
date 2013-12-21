var Buffer = require("buffer").Buffer;
var url = "https://api.subledger.com:443/v1/";

var Subledger = function(id, secret, org_id, book_id){
    this.id = id;
    this.secret = secret;
    this.org_id = org_id;
    this.book_id = book_id;
};

Subledger.CreateIdentity = function(email, description, reference){
    var promise = new Parse.Promise()
    Parse.Cloud.httpRequest({
        url: url+"identities",
        method: "POST",
        params: {
            email: email,
            description: description,
            reference: reference
        },
         success: function(httpResponse){
            if (httpResponse.data) {
                promise.resolve(httpResponse.data);
            }else{
                promise.reject(httpResponse.text);
            }
        },
        error: function(httpResponse){
            promise.reject(httpResponse.data);
        }
    }); 
    return promise;
};

Subledger.prototype.authorizationHeader = function(){
    var auth = this.id+":"+this.secret;
    var b64 = new Buffer(auth).toString('base64');
    return 'Basic '+b64;
};

Subledger.prototype.HTTPRequest = function(method, endpoint, params){
    var promise = new Parse.Promise();
    var options = {
        method: method,
        url: url+endpoint,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': this.authorizationHeader()
        },
        success: function(httpResponse){
            if (httpResponse.data) {
                promise.resolve(httpResponse.data);
            }else{
                promise.reject(httpResponse.text);
            }
        },
        error: function(httpResponse){
            promise.reject(httpResponse.data);
        }
    };
    console.log(method);
    if (method == "GET") {
        options.params = params;
    }else if(method == "POST"){
        options.body = params;
    }
    console.log(options.params);
    Parse.Cloud.httpRequest(options);
    return promise;

};

Subledger.CREDIT = "credit";
Subledger.DEBIT = "debit";

Subledger.prototype.POST = function(endpoint, params){
    return this.HTTPRequest("POST", endpoint, params);
};

Subledger.prototype.GET = function(endpoint, params){
    return this.HTTPRequest("GET", endpoint, params);
};

Subledger.prototype.setOrgId = function(org_id){
    this.org_id = org_id;
};

Subledger.prototype.setBookId = function(book_id){
    this.book_id = book_id;
};

Subledger.prototype.bookEndpoint = function(){
    return "orgs/"+this.org_id+"/books/"+this.book_id+"/";
};

Subledger.prototype.fullEndpoint = function(endpoint){
    return this.bookEndpoint()+endpoint;
};

Subledger.prototype.createOrg = function(description, reference){
    var params = {
        description: description,
        reference: reference    
    };
    return this.POST("orgs", params); 
};

Subledger.prototype.createBook = function(description, reference){
    var params = {
        description: description,
        reference: reference    
    };
    return this.POST("orgs/"+this.org_id+"/books", params); 
};

Subledger.prototype.createAccountCategory = function(normal_balance,
description, reference){
    var params = {
        normal_balance: normal_balance,
        description: description,
        reference: reference
    };
    return this.POST(this.fullEndpoint("categories"), params);
};

Subledger.prototype.createAccount = function(normal_balance, 
description, reference){
    var params = {
        normal_balance: normal_balance,
        description: description,
        reference: reference
    };
    return this.POST(this.fullEndpoint("accounts"), params);
};

Subledger.prototype.attatchAccountToCategory = function(category_id,
account_id){
    var params = {
        account : account_id
    };
    var url = this.fullEndpoint("categories/"+category_id+"/attach");
    return this.POST(url, params);
};

Subledger.prototype.createEntry = function(effective_at, description, reference, lines){
    var params = {
        effective_at : effective_at,
        description : description,
        reference: reference,
        lines: lines
    }
    var str = JSON.stringify(params);
    console.log(str);
    return this.POST(this.fullEndpoint("journal_entries/create_and_post"),
str);
};

Subledger.prototype.accountBalance = function(account_id, date){
    return this.GET(this.fullEndpoint("accounts/"+account_id+"/balance"), {
        at : date
    });
};

Subledger.prototype.accountHistory = function(account_id, params){
    return this.GET(this.fullEndpoint("accounts/"+account_id+"/lines"), params);
};

module.exports = Subledger;
