'use strict';

const Ably = require('ably');
const inspect = require('util').inspect;

exports.handler = (event, context, callback) => {
  console.log("Received the following event from Ably: ", inspect(event));

  // If the message rule uses enveloping, 'event' is an object containing the
  // following keys; 'source', 'appId', 'channel', 'site', 'ruleId', and either 'messages'
  // or 'presence' single-element arrays.
  // If enveloping is off, 'event' is just the data member of the message or presence
  // message, and the next line would just be 'JSON.parse(event)'
  const details = JSON.parse(event.messages[0].data);

  // Note that this uses Ably.Rest, not Realtime. This is because we don't want
  // to start a websocket connection to Ably just to make one publish, that
  // would be inefficient. Ably.Rest makes the publish as a REST request.
  const ably = new Ably.Rest({ key: <...> });

  // Now get an Ably channel and publish something on it. Make sure you don't 
  // publish to a channel that has this reactor rule on it, or you'll get an infinite loop!
  const channel = ably.channels.get(<...>);
  channel.publish('lambdaresponse', 'success', (err) => {
    if(err) {
      console.log("Error publishing back to ably:", inspect(err));
      callback(err);
    } else {
      // Make sure to only call the callback (ending execution) in the callback of
      // the publish(), or the function will stop executing before it has a chance to
      // make the http request
      callback(null, 'success');
    }
  });
};
