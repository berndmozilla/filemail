const Cc = Components.classes;
const Ci = Components.interfaces;

var filemail_sqlite = {

  onLoad: function() {
    // initialization code
    this.initialized = true;
    this.dbInit();
  },

  dbConnection: null,

  dbSchema: {
     tables: {
       senderpath:"mailfrom     TEXT PRIMARY KEY, \
                   uri          TEXT",
       knownAuthor:"mailfrom     TEXT PRIMARY KEY"
    }
  },

  dbInit: function() {
    var dirService = Cc["@mozilla.org/file/directory_service;1"].
      getService(Ci.nsIProperties);

    var dbFile = dirService.get("ProfD", Ci.nsIFile);
    dbFile.append("filemail.sqlite");

    var dbService = Cc["@mozilla.org/storage/service;1"].
      getService(Ci.mozIStorageService);

    var dbConnection;

    if (!dbFile.exists())
      dbConnection = this._dbCreate(dbService, dbFile);
    else {
      dbConnection = dbService.openDatabase(dbFile);
    }
    this.dbConnection = dbConnection;
  },

  _dbCreate: function(aDBService, aDBFile) {
    var dbConnection = aDBService.openDatabase(aDBFile);
    this._dbCreateTables(dbConnection);
    return dbConnection;
  },

  _dbCreateTables: function(aDBConnection) {
    for(var name in this.dbSchema.tables)
      aDBConnection.createTable(name, this.dbSchema.tables[name]);
  },
  dbGetPath: function(sender) {
    var statement = this.dbConnection.createStatement("SELECT * FROM senderpath WHERE mailfrom = :mail");  
    statement.params.mail = sender;
    var uri = null;
    try {  
       while (statement.step()) {  
          uri = statement.row.uri; 
       }  
    }  
    finally {  
      statement.reset();  
    }
    return uri;  
  },
  dbCheckPath: function(sender, uri) {
     var statement = this.dbConnection.createStatement("SELECT * FROM senderpath WHERE mailfrom = :mail AND uri = :uri");  
    statement.params.mail = sender;
    statement.params.uri = uri;
    var uri = null;
    try {  
       while (statement.step()) {  
          uri = statement.row.uri; 
       }  
    }  
    finally {  
      statement.reset();  
    }
    return uri;
  },
  dbSetPath: function(sender, uri) {
    if (!this.dbGetPath(sender)) {
      var statement = this.dbConnection.createStatement("INSERT INTO senderpath VALUES (:mail, :uri)");
      statement.params.mail = sender;
      statement.params.uri = uri; 
      try {  
        while (statement.step()) {  
          // Use the results...  
        }  
      }  
      finally {  
        statement.reset();  
      } 
    }
    else if (!this.dbCheckPath(sender, uri)) {
      alert("udpate");
      var statement = this.dbConnection.createStatement("UPDATE senderpath SET uri = :uri WHERE mailfrom = :mail");
      statement.params.mail = sender;
      statement.params.uri = uri; 
      try {  
        while (statement.step()) {  
          // Use the results...  
        }  
      }  
      finally {  
        statement.reset();  
      }  
    }  
  },
  dbIsKnownAuthor: function (sender) {
    var statement = this.dbConnection.createStatement("SELECT * FROM knownAuthor WHERE mailfrom = :mail");  
    statement.params.mail = sender;
    var isknown = false;
    try {  
       while (statement.step()) {  
          isknown = true; 
       }  
    }  
    finally {  
      statement.reset();  
    }
    return isknown;  
  },
    
  
  dbSaveKnownAuthor: function (sender) {
    if (!this.dbIsKnownAuthor(sender)) {
      var statement = this.dbConnection.createStatement("INSERT INTO knownAuthor VALUES (:mail)");
      statement.params.mail = sender;
      try {  
        while (statement.step()) {  
          // Use the results...  
        }  
      }  
      finally {  
        statement.reset();  
      } 
    }
  },
};
