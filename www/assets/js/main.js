"use strict";
// initialize Hoodie
var hoodie  = new Hoodie();

// create a scoped 'message' store for easier re-use
var messageStore = hoodie.store('message');

// Select the chat form
var chatForm = $('[data-action="chat-input"]');

// Select the textarea from the chat form
var chatBox = $('[data-action="send-message"]');

// Setup keydown listener for power user message submitting, CMD/Ctrl + Enter
chatBox.on('keydown', checkSubmit);

function checkSubmit(e) {
  // if the CMD/Ctrl key and the Enter key are both pressed down, then send the message to the store
  if (e.metaKey && e.keyCode === 13) {
    sendMessage(e);
  }
}

// Select the chat stream area
var chatStream = $('[data-action="chat-stream"]');

// Setup submit event listener on chat form
chatForm.on('submit', sendMessage);

// create sendMessage function
function sendMessage(e) {
  e.preventDefault();

  // check for content in the chatBox,
  // if there is content,
  // then assign it to a variable
  // else, return false to cancel function
  var messageContent = chatBox.val().trim();

  if ( messageContent.length < 1 ) { return false; }

  // create a new message model
  var message = new messageModel(messageContent);

  // using the global messageStore, add this message object and publish it to the global store.
  messageStore.add(message).publish();

  // Dont't forget to clear out the charBox
  chatBox.val('');
}

// create a message model for re-use later
function messageModel(message) {
  var user = hoodie.account.username;
  var postDate = new Date();

  return {
    'user': user,
    'date': postDate,
    'message': message
  };
}

// create a notification model for re-use later
function notifyModel(notification, status) {
  var postDate = new Date();

  return {
    'date': postDate,
    'notification': notification,
    'status': status
  };
}

// setup event listener for new messages being saved to Hoodie
hoodie.global.on('add', streamMessage);

// post newly added message to the stream
function streamMessage(message) {
  if(message.notification) { return streamNotification(message); }

  if (message.type !== 'message') { return; }

  var date = new Date(message.date);
  
  // create template to store message content
  var messageTemplate = $('<div></div>');
  var messageUser = $('<h4 class="inline-block mr1">'+message.user+'</h4>');
  var messageDate = $('<span class="inline-block h6 regular muted">'+date.toLocaleTimeString()+'</span>');
  var messageContent = $('<p>'+message.message+'</p>');

  // insert data into template
  messageTemplate.append(messageUser);
  messageTemplate.append(messageDate);
  messageTemplate.append(messageContent);

  // finally, insert template into the chat stream
  // then, clear out the chat box
  messageTemplate.appendTo(chatStream);

  // scroll the new message into view if it overflows the chat stream
  scrollIntoViewIfNeeded(messageTemplate[0]);
}

function notifySignIn(e) {
  var notification = e + " has signed into the chat.";
  var model = new notifyModel(notification, 'green');

  messageStore.add(model).publish();
}

function notifySignOut(e) {
  var notification = e + " has signed out or disconnected.";
  var model = new notifyModel(notification, 'red');

  messageStore.add(model).publish();
}

function streamNotification(notification) {
  var date = new Date(notification.date);

  // create template for notification
  var notifyTemplate = $('<div></div>');
  var notifyContent = $('<h5 class="inline-block mr1 '+notification.status+'">'+notification.notification+'</h5>');
  var notifyDate = $('<span class="inline-block h6 regular muted">'+date.toLocaleTimeString()+'</span>');

  // insert data into template
  notifyTemplate.append(notifyContent);
  notifyTemplate.append(notifyDate);

  // insert template into chat stream
  notifyTemplate.appendTo(chatStream);

  // scroll the notification into view if it overflows the chat stream
  scrollIntoViewIfNeeded(notifyTemplate[0]);
}

function scrollIntoViewIfNeeded(element) {
  if (element.offsetTop > element.parentNode.offsetHeight) {
    element.scrollIntoView();
  }
}
