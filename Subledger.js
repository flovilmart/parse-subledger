/*

    //How to use:

    //First time

    var subledger = new Subledger();
    subledger.Identity.Create().then(function(response){
        // Store your identity id and secret
        // To use your identity for next calls call:

        var my_id = response.result.active_key.id;
        var my_secret = response.result.active_key.secret;
        subledger.initialize(my_id, my_secret);

        // Create an org

        return subledger.Org.Create(description, reference)
    }).then(function(response){
            // Store your Org id
            var org_id = response.result.active_org.id;
            subledger.setOrgId(org_id);

            // Create a book

           return subledger.Book.Create(description, reference)
    }).then(function(response){
        // Store your book Id
        var book_id = response.result.active_book.id;
        subledger.setBookId(book_id);

        // Do whatever you want
    });
    
    // After, use your id, secret, org_id and book_id
    
    // Basic init, to create an org
    var subledger = new Subledger(id, secret);

    // With and org, to create a book
    var subledger = new Subledger(id, secret, org_id);

    // All initialize
    var subledger = new Subledger(id, secret, org_id, book_id);


    // You can initialize you current org and book later
    // 
    var org = new subledger.Org(org_id);
    // The current organization for api calls will be set to org_id

    var org2 = new subledger.Org(org_id_2);
    // The current organization for api calls will be set to org_id2

    var book = new subledger.Book(book_id);
    // The current book will be set for api calls
    // This throws an exception if no org has been set

    This design is to prevent any kind of false manipulations around orgs and books
    
    Once you have your org and book id's it's recommended to initalize subledger with 4 parameters
*/

var Buffer = require("buffer").Buffer;
var url = "https://api.subledger.com:443/v1";


var api;

var Identity = function(identity, key){
    this.identity = identity;
    this.key = key;

}
// Create a new identity

Identity.Create = function(email, description, reference){
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
}

// Get an identity
Identity.Get = function(identity_id){

}

// Create a key for an identity
Identity.prototype.createKey = function(){

}

// Get active or inactive key
Identity.prototype.getKey = function(key){

}

// Archive a key
Identity.prototype.archive = function(){

}

// Activate a key
Identity.prototype.activate = function(){

}


var Org = function(org_id){
    this.id = org_id;
    api.setOrgId(org_id);
    this.api = api;
}

Org.Create = function(description, reference){
    return api.POST("/orgs", {description: description, reference: reference});
}

Org.Get = function(org_id){
    return api.GET("/orgs/"+org_id);
}
Org.prototype.get = function(){
    return Org.Get(this.id);
}

Org.prototype.update = function(version, description, reference){
    return this.api.PATCH("/orgs/"+this.id, {description: description, reference: reference, version: version});
}

Org.prototype.archive =  function(){
    return this.api.POST("/orgs/"+this.id+"/archive");
}

Org.prototype.activate =  function(){
    return this.api.POST("/orgs/"+this.id+"/activate");
}

var Book = function(book_id){
    this.id = book_id;
    api.setBookId(book_id);
    this.api = api;
    this.endpoint = api.orgEndpoint+"/books/"+book_id;
}

Book.Create = function(description, reference){
    return api.POST(api.booksEndpoint, {description: description, reference: reference});
}

Book.Find = function(state, action, description, id, limit){
    return api.GET(api.booksEndpoint, {state: state, action: action, description: description, id: id, limit: limit});
}

Book.Get = function(book_id){
    return api.GET(api.booksEndpoint+"/"+book_id);
}

Book.prototype.get = function(){
    return Book.Get(this.id);
}

Book.prototype.update = function(version, description, reference){
    return this.api.PATCH(this.endpoint, {description: description, reference: reference, version: version});
}

Book.prototype.archive = function(){
    return this.api.POST(this.endpoint+"/archive");
}

Book.prototype.activate = function(){
    return this.api.POST(this.endpoint+"/activate");
}

var Account = function(account_id){
    api.sanity();
    this.id = account_id;
    this.api = api;
    this.accountEndpoint = api.accountsEndpoint+"/"+account_id;
}

Account.Create = function(normal_operation, description, reference){
    api.POST(api.accountsEndpoint, {normal_operation: normal_operation, description: description, reference: (reference?reference:"")});
}

Account.Find = function(state, action, description, id, limit){
    return api.GET(api.accountsEndpoint, {state: state, action: action, description: description, id: id, limit: limit});
}

Account.Get = function(id){
    return api.GET(api.accountsEndpoint+"/"+id);
}

Account.prototype.get = function(){
    return Account.Get(this.id);
}

Account.prototype.update = function(version, normal_balance, description, reference){
    return this.api.PATCH(this.accountEndpoint, {normal_balance: normal_balance, description: description, reference: reference, version: version});
}

Account.prototype.lines = function(action, effective_at, line_id, limit){
    var params = {
        action: action,
        effective_at : effective_at
    }
    if (line_id !== undefined && line_id !== null) {
        params.line_id = line_id;
    }
    if (limit != undefined && limit !== 0) {
        params.limit = limit;
    };
    return this.api.GET(this.accountEndpoint, params);
}

Account.prototype.archive = function(){
    return this.api.POST(this.accountEndpoint+"/archive");
}

Account.prototype.activate = function(){
    return this.api.POST(this.accountEndpoint+"/activate");
}

Account.prototype.balance = function(at){
    return this.api.GET(this.accountEndpoint+"/balance", {at: at});
}

Account.prototype.line = function(line_id){
    return this.api.GET(this.accountEndpoint+"/lines/"+line_id);
}

Account.prototype.firstAndLastLine = function(){
    return this.api.GET(this.accountEndpoint+"/first_and_last_line");
}

var JournalEntry = function(entry_id){
    this.id = entry_id;
    this.api = api;
    api.sanity();
    this.journalEntryEndpoint = api.journalEntriesEndpoint+"/"+entry_id;
    this.endpoint = this.journalEntryEndpoint;
}

JournalEntry.Create = function(effective_at, description, reference){
    return api.POST(api.journalEntriesEndpoint, {effective_at: effective_at, description: description, reference: reference});
}

JournalEntry.Find = function(state, action, description, id, limit){
    return api.GET(api.journalEntriesEndpoint, {state: state, action: action, description: description, id: id, limit: limit});
}

JournalEntry.CreateAndPost = function(params){
    /*var params = {
        effective_at : effective_at,
        description : description,
        reference: reference,
        lines: lines
    }*/
    return api.POST(api.journalEntriesEndpoint+"/create_and_post", JSON.stringify(params));
}

JournalEntry.prototype.post = function(){
    return api.POST(this.journalEntryEndpoint);
}

JournalEntry.prototype.get = function(){
    return api.GET(this.journalEntryEndpoint);
}

JournalEntry.prototype.update = function(version, effective_at, description, reference){
    return api.PATCH(this.journalEntryEndpoint, {version: version, effective_at: effective_at, description: description, reference: reference});
}

JournalEntry.prototype.lines = function(){
    return api.GET(this.journalEntryEndpoint+"/lines");
}

JournalEntry.prototype.archive = function(){
    return api.POST(this.journalEntryEndpoint+"/archive");
}

JournalEntry.prototype.activate = function(){
    return api.POST(this.journalEntryEndpoint+"/activate");
}

JournalEntry.prototype.balance = function(){
    return api.GET(this.journalEntryEndpoint+"/balance");
}

JournalEntry.prototype.progress = function(){
    return api.GET(this.journalEntryEndpoint+"/progress");
}

JournalEntry.prototype.createLine = function(aLine){
    return api.POST(this.journalEntryEndpoint+"/create_line", JSON.stringify(aLine));
}

var Line = function(journalEntry, line_id){
    this.journalEntry =journalEntry;
    this.id = id;
    this.api = api;
    this.endpoint = this.journalEntry.endpoint+"/lines/"+this.id;
}

JournalEntry.prototype.Line = Line;

Line.prototype.get = function(){
    return api.GET(this.endpoint);
}

Line.prototype.update = function(patchLine){
    return api.PATCH(this.endpoint, JSON.stringify(patchLine));
}

Line.prototype.archive = function(){
    return api.POST(this.endpoint+"/archive");
}

Line.prototype.activate = function(){
    return api.POST(this.endpoint+"/activate");
}


var Category = function(category_id){
    this.id = category_id;
    this.api = api;
    api.sanity();
    this.endpoint = api.categoriesEndpoint+"/"+category_id;
}

Category.Create = function(normal_balance, description, reference){
    return api.POST(api.categoriesEndpoint, {normal_balance: normal_balance, description: description, reference: reference});
}

Category.Find = function(state, action, description, id, limit){
    var params = {};
    (state ? params.state = state : null);
    (action ? params.action = action : null);
    (description ? params.description = description : null);
    (id ? params.id = id : null);
    (limit ? params.limit = limit : null);
    
    return api.GET(api.categoriesEndpoint, params);
}

Category.prototype.get = function (){
    return this.api.GET(this.endpoint);
}

Category.prototype.update = function(version, normal_balance, reference, description){
    var params = {
        version : version
    }
    (normal_balance ? params.normal_balance = normal_balance : null);
    (reference ? params.reference = reference : null);
    (description ? params.description = description : null);

    return this.api.POST(this.endpoint, params);
}

Category.prototype.attach = function(account){
    return this.attachAccountId(account.id);
}

Category.prototype.attachAccountId = function(accountid){
    return this.api.POST(this.endpoint+"/attach", {account: accountid });
}

Category.prototype.detach = function(account) {
    return this.detachAccountId(account.id);
}

Category.prototype.detachAccountId = function(accountid){
    return this.api.POST(this.endpoint+"/detach", {account: accountid });
}

Category.prototype.archive = function(){
    return this.api.POST(this.endpoint+"/archive");
}

Category.prototype.activate = function(){
    return this.api.POST(this.endpoint+"/activate");
}


/*
Setup the subledger API

Pass org ID and book_id in order to be able to use:
Account, Category and JournalEntry, otherwise will throw exception
*/

var Subledger = function(id, secret, org_id, book_id){


    this.initialize = function(id, secret){
        this.id = id;
        this.secret = secret;
    }

    if (id && secret) {
        this.initialize(id, secret);
    }
    api = this;
    
    this.setOrgId = function(org_id){
        if (!org_id) {
            throw "Trying to set api org_id but org_id is undefined";
        }
        this.org_id = org_id;
        
        this.orgEndpoint = "/orgs/"+org_id;
        this.booksEndpoint = this.orgEndpoint+"/books";
    };

    this.setBookId = function(book_id){
        if (!book_id) {
            throw "Trying to set api book_id but book_id is undefined";
        }
        this.book_id = book_id;
        
        this.bookEndpoint = this.booksEndpoint+"/"+book_id;
        this.accountsEndpoint = this.bookEndpoint+"/accounts";
        this.journalEntriesEndpoint = this.bookEndpoint+"/journal_entries";
        this.categoriesEndpoint = this.bookEndpoint+"/categories";
    };

    if (org_id) {
        this.org = new Org(org_id);
    }
    if (book_id) {
        this.book = new Book(book_id);
    }
    
};

Subledger.Indentity = Identity;
Subledger.prototype.Org = Org;
Subledger.prototype.Book = Book;
Subledger.prototype.Account = Account;
Subledger.prototype.JournalEntry = JournalEntry;
Subledger.prototype.Category = Category;


Subledger.prototype.sanity = function(){
    this.orgSanity();
    this.bookSanity();
}

Subledger.prototype.bookSanity = function(){
    if (!this.book) {
        throw "No book set"
    }
}

Subledger.prototype.orgSanity = function(){
    if (!this.org) {
        throw "No org set"
    }
}


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

Subledger.State = {
    ACTIVE: "active",
    ARCHIVED: "archived"
}

Subledger.Action = {
   BEFORE: "before", 
   ENDING: "ending", 
   STARTING: "starting", 
   AFTER: "after", 
   PRECEDING: "preceding", 
   FOLLOWING: "following"
}


Subledger.prototype.GET = function(endpoint, params){
    return this.HTTPRequest("GET", endpoint, params);
};

Subledger.prototype.POST = function(endpoint, params){
    return this.HTTPRequest("POST", endpoint, params);
};

Subledger.prototype.PATCH = function(endpoint, params){
    return this.HTTPRequest("PATCH", endpoint, params);
};

/*
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
};*/

module.exports = Subledger;
