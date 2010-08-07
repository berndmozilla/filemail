var filemail_newMailListener = {
    msgsMoveCopyCompleted: function(aMove, 
                                    aSrcMsgs,
                                    aDestFolder,
                                    aDestMsgs) {   
	 
      const nsMsgFolderFlags = Components.interfaces.nsMsgFolderFlags;
      var ignoreFlags = nsMsgFolderFlags.Trash | nsMsgFolderFlags.SentMail |
                        nsMsgFolderFlags.Drafts | nsMsgFolderFlags.Queue |
                        nsMsgFolderFlags.Templates | nsMsgFolderFlags.Junk |
                         nsMsgFolderFlags.Inbox;
                         
      if (!(aDestFolder.flags & ignoreFlags)) { // isSpecialFlags does some strange hacks
        for each (let msgHdr in fixIterator(aSrcMsgs.enumerate(),
                                          Components.interfaces.nsIMsgDBHdr)) {
          let mailfrom = msgHdr.author;
          if (filemail_sqlite.dbIsKnownAuthor(mailfrom)) {
            mailfrom = gFolderDisplay.selectedMessage.recipients;
          }                                
          filemail_sqlite.dbSetPath(mailfrom, aDestFolder.URI);
        }
      } 
    }
}

var filemail = {
  onLoad: function() {
    // initialization code
    this.initialized = true;
    this.strings = document.getElementById("filemail-strings");
    filemail_sqlite.onLoad();
    var notificationService =
	 Components.classes["@mozilla.org/messenger/msgnotificationservice;1"]
	 .getService(Components.interfaces.nsIMsgFolderNotificationService);
     notificationService.addListener(filemail_newMailListener, notificationService.msgsMoveCopyCompleted); 
  },
  notify: function(title, text) {
    try {
      Components.classes['@mozilla.org/alerts-service;1']
              .getService(Components.interfaces.nsIAlertsService)
              .showAlertNotification(null, title, text, false, '', null);
    } catch(e) {
      // prevents runtime error on platforms that don't implement nsIAlertsService
    }
  },
  moveMail: function() {
    if (gFolderDisplay.selectedCount == 1) {
      let mailfrom = gFolderDisplay.selectedMessage.author;
      if (filemail_sqlite.dbIsKnownAuthor(mailfrom)) {
        mailfrom = gFolderDisplay.selectedMessage.recipients;
      }
      let path = filemail_sqlite.dbGetPath(mailfrom);
      if (path) {
        MsgMoveMessage(GetMsgFolderFromUri(path, false));
        filemail.notify(mailfrom + " " + this.strings.getString("movedto"), path); 
      }
      else {
        filemail.notify(this.strings.getString("unknown"), this.strings.getString("hand"));
      }
    }
    else {
      filemail.notify(this.strings.getString("onemsg"),this.strings.getString("key"));
    }
  },
  invertSender: function() {
    if (gFolderDisplay.selectedCount == 1) {
      let mailfrom = gFolderDisplay.selectedMessage.author;
      filemail_sqlite.dbSaveKnownAuthor(mailfrom);
    }
  }
};

window.addEventListener("load", function(){filemail.onLoad()}, false);
