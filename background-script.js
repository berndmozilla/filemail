browser.commands.onCommand.addListener(async function(command) {
  if (command == "movemail") {
    let tabs = await messenger.tabs.query({
      active: true,
      currentWindow: true,
    })
    let storage = await messenger.storage.local.get({
      knownAuthors : [],
      myAuthors: [],
      accounts: [],
      folders:   []});
    const tabId = tabs[0].id;
    browser.messageDisplay.getDisplayedMessage(tabId).then((message) => {
      if ((storage.knownAuthors.length > 0) && 
        (storage.knownAuthors.find((str) => str == message.author))) {
        author = message.recipients[0];
      }
      else {
        author = message.author;
      }
      console.log(author);
      if ((storage.myAuthors.length > 0) &&
          ((index = storage.myAuthors.findIndex((str) => str == author)) > -1))  {
        path = storage.folders[index];
        id = storage.accounts[index];
        folder = message.folder;
        folder.accountId = id;
        folder.path = path; 
        messenger.messages.move([message.id], folder);  
        let filemailNotification = "filemail-notification";
        browser.notifications.create(filemailNotification, {
                type: "basic",
                title: "Message move for " + author,
                message: path,
              });  
        
        console.log("Move to: " + path);     
      }
      else {
        let filemailNotification = "filemail-notification";
        browser.notifications.create(filemailNotification, {
                type: "basic",
                title: "unknown author " + author,
                message: "move one message first by hand",
              });     
        console.log("unknown author: " + author); 
      }
    
    });
  }
  else if(command == "invertSender") {
    let tabs = await messenger.tabs.query({
      active: true,
      currentWindow: true,
    })
    let storage = await messenger.storage.local.get({
      knownAuthors : [],
      myAuthors: [],
      accounts: [],
      folders:   []});
    const tabId = tabs[0].id;
    browser.messageDisplay.getDisplayedMessage(tabId).then((message) => {
      author = message.author;
      if (!((storage.knownAuthors.length > 0) && 
          (storage.knownAuthors.find((str) => str == author)))) {
        storage.knownAuthors.push(author);
        messenger.storage.local.set(storage);
        console.log("new known author " + author);
      }
      else {
        console.log("well known author " + author);
      }
      console.log(storage.knownAuthors);
    })
  }
});

function isSpecialFolder(type)
{
  if ((type == "inbox") ||
  (type == "drafts") ||
  (type == "sent") ||
  (type == "trash") ||
  (type == "archives") ||
  (type == "junk") ||
  (type == "outbox")) {
    console.log("special folder ignore");
    return true;
  }
  return false;
}
// Add a listener for the message moved events.
messenger.messages.onMoved.addListener(async (originalMessages, movedMessages) => {
  if (movedMessages.messages.length == 1) {
    if(!isSpecialFolder(movedMessages.messages[0].folder.type)) {
      author = movedMessages.messages[0].author;
      let storage = await messenger.storage.local.get({
        knownAuthors : [],
        myAuthors: [],
        accounts: [],
        folders:   []});
      if ((storage.knownAuthors.length > 0) && 
          (storage.knownAuthors.find((str) => str == author))) {
         console.log(author);
         console.log(movedMessages.messages[0].recipients[0])
         author = movedMessages.messages[0].recipients[0];
         console.log("overwritten by: " + author);
      }
      
      path =  movedMessages.messages[0].folder.path;
      id =  movedMessages.messages[0].folder.accountId;
      if ((storage.myAuthors.length > 0) &&
          ((index = storage.myAuthors.findIndex((str) => str == author)) > -1)) {
        if ((storage.accounts[index] != id) || 
            (storage.folders[index] != path)) {
          let filemailNotification = "filemail-notification";
          browser.notifications.create(filemailNotification, {
              type: "basic",
              title: "path  update for " + author,
              message: path,
            });
          storage.accounts[index] = id;
          storage.folders[index] = path;
          messenger.storage.local.set(storage);
          console.log("path update for " + author + " path " + path);
        }
        else {
          console.log(" known path for " + author + " path: " + path);
        }
      }
      else {
        storage.myAuthors.push(author);
        storage.accounts.push(id);
        storage.folders.push(path);
        messenger.storage.local.set(storage);
        console.log("new author " + author + " path: " + path);
      }
    }  
  }
});