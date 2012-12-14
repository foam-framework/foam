/*
 * Copyright 2012 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var EMail = FOAM.create({
   model_: 'Model',
   name: 'EMail',
   label: 'EMail',
   plural: 'EMail',
   ids:
   [
      'timestamp'
   ],
   tableProperties:
   [
      'from',
      'subject',
      'timestamp'
   ],
   properties:
   [
/*
      {
         model_: 'Property',
         name: 'id',
         label: 'ID',
         type: 'String',
         mode: 'read-write',
         required: true,
         displayWidth: 30,
         displayHeight: 1,
         view: 'TextFieldView'
      },
*/
      {
         model_: 'Property',
         name: 'timestamp',
         label: 'Date',
         type: 'String',
         mode: 'read-write',
         required: true,
         displayWidth: 50,
         displayHeight: 1,
         view: 'TextFieldView',
         valueFactory: function() { return new Date(); }
      },
      {
         model_: 'Property',
         name: 'from',
         label: 'From',
         type: 'String',
         mode: 'read-write',
         required: true,
         displayWidth: 60,
         displayHeight: 1,
         view: 'TextFieldView',
         valueFactory: function() { return GLOBAL.user; }
      },
      {
         model_: 'Property',
         name: 'to',
         label: 'To',
         type: 'String',
         mode: 'read-write',
         required: true,
         displayWidth: 60,
         displayHeight: 1,
         view: 'TextFieldView'
      },
      {
         model_: 'Property',
         name: 'subject',
         label: 'Subject',
         type: 'String',
         mode: 'read-write',
         required: true,
         displayWidth: 70,
         displayHeight: 1,
         view: 'TextFieldView'
      },
      {
         name: 'labels',
	 label: 'Labels',
	 type: 'Array[String]',
	 view: 'StringArrayView',
	 valueFactory: function() { return []; },
	 help: 'Email labels.'
      },
      {
         model_: 'Property',
         name: 'body',
         type: 'String',
         displayWidth: 70,
         displayHeight: 15,
         view: 'TextAreaView',
         help: 'Email message body.'
      }
   ],
   actions:
   [
      {
         model_: 'Action',
         name: 'send',
         label: 'Send',
         help: 'Send the email.',
         action: function () {
           EmailDAO.put(this);
           stack.back();
         }
      },
      {
         model_: 'Action',
         name: 'reply',
         label: 'Reply',
         help: 'Reply to an email.',
         action: function () {
           var replyMail = EMail.create({
             to: this.from,
             from: this.to,
             subject: "Re.: " + this.subject,
             body: this.body.replace(/^|\n/g, '\n>')
           });
           DAOCreateControllerProto.newObj(replyMail, EMailDAO);
         }
      },
      {
         model_: 'Action',
         name: 'forward',
         label: 'Forward',
         help: 'Forward an email.',
         action: function () {
           var forwardedMail = EMail.create({
             from: 'me',
             subject: "Fwd.: " + this.subject,
             body: this.body.replace(/^|\n/g, '\n>')
           });
           DAOCreateControllerProto.newObj(forwardedMail, EMailDAO);
         }
      }
   ]
});


var MBOXParser = {
  __proto__: grammar,

  START: sym('line'),

  'eol': literal('\n'),

  'until eol': repeat(notChar('\n')),

  line: alt(
    sym('start of email'),
    sym('to'),
    sym('from'),
    sym('subject'),
    sym('date'),
    sym('labels'),
    sym('unknown header')
//    sym('body')
  ),

  'start of email': seq('From ', sym('until eol')),

  to: seq('To: ', sym('until eol')),
  from: seq('From: ', sym('until eol')),

  labels: seq('X-Gmail-Labels: ', repeat(sym('label'), ',')),

  label: repeat(alt(range('a','z'), range('A', 'Z'), range('0', '9'))),

  subject: seq('Subject: ', sym('until eol')),

  date: seq('Date: ', sym('until eol')),

  'unknown header': sym('until eol'),

  'email address': alt(
    sym('named email address'),
    sym('raw email address')),

  'named email address': seq(
    repeat(notChar('<')),
    sym('raw email address'),
    '>'),

  'raw email address': seq(repeat(notChar('@')), sym('until eol'))

};

/** Sink which loads Emails into a DAO. **/
var MBOXLoader = {
  __proto__: MBOXParser,

  put: function(str) { console.log(str); this.parseString(str); },

  eof: function() { this.saveCurrentEmail(); },

  saveCurrentEmail: function() {
    if ( this.email ) {
      console.log('creating: ', this.email.toJSON());
      if ( this.dao ) this.dao.put(this.email);
    }
  }
}.addActions({
  'start of email': function() {
    this.saveCurrentEmail();

    this.email = EMail.create();
  },

  to: function(v) { this.email.to = v[1].join(''); },

  from: function(v) { this.email.from = v[1].join(''); },

  subject: function(v) { this.email.subject = v[1].join(''); },

  label: function(v) { this.email.labels.push(v.join('')); }

  // TODO: timestamp, message-id, body, attachments
  // TODO: internalize common strings to save memory (or maybe do it at the DAO level)

});
// grep -i -E "To:|From|Date:|Subject:|X-Gmail-Labels:" sample.mbox > sample.small.mbox


// sed "s/'/\\\\'/g" sample.mbox | sed "s/\r/\\\n/g" | sed "s/^/put('/g" | sed "s/$/');/g" > mbox.js
/*
var p = MBOXLoader.put.bind(MBOXLoader);

p('From 1404692113434165298@xxx Wed Jun 13 08:19:51 2012\n');
p('X-Gmail-Labels: Retention5,SuperCool\n');
p('Message-ID: <20cf30563d5b2b446604c2604e64@google.com>\n');
p('Date: Wed, 13 Jun 2012 20:19:50 +0000\n');
p('Subject: New voicemail from (917) 359-5785 at 3:18 PM\n');
p('From: Google Voice <voice-noreply@google.com>\n');
p('To: thafunkypresident@gmail.com\n');

MBOXLoader.eof();
*/



var emails = JSONUtil.mapToObj([
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:07 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Reminder: Dinner! @ Mon Nov 19 7pm - 9pm'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:07 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Reminder: Croissants! @ Sun Nov 18, 2012'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:07 GMT-0500 (EST)'),
      from: '"Google+ team" <noreply-475ba29f@plus.google.com>',
      to: 'thafunkypresident@gmail.com',
      subject: '6 people you might know on Google+'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:07 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Reminder: Dinner! @ Mon Nov 12 7pm - 9pm'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:07 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Reminder: Dinner! @ Mon Nov 12 7pm - 9pm'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:07 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Reminder: Croissants! @ Sun Nov 11, 2012'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:07 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Reminder: Croissants! @ Sun Nov 11, 2012'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:07 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Reminder: Dinner! @ Mon Nov 5 7pm - 9pm'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:07 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Reminder: Dinner! @ Mon Nov 5 7pm - 9pm'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:07 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Reminder: Croissants! @ Sun Nov 4, 2012'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:07 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Reminder: Croissants! @ Sun Nov 4, 2012'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:07 GMT-0500 (EST)'),
      from: '"Google+ team" <noreply-475ba29f@plus.google.com>',
      to: 'thafunkypresident@gmail.com',
      subject: '6 people you might know on Google+'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:07 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Reminder: Dinner! @ Mon Oct 29 7pm - 9pm'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:07 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Reminder: Dinner! @ Mon Oct 29 7pm - 9pm'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:07 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Reminder: Croissants! @ Sun Oct 28, 2012'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:07 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Reminder: Croissants! @ Sun Oct 28, 2012'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:07 GMT-0500 (EST)'),
      from: 'John Doe<no-reply@google.com>',
      to: 'thafunkypresident@gmail.com',
      subject: 'You have been invited to contribute to Blah lah la Blog'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:07 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Reminder: Dinner! @ Mon Oct 22 7pm - 9pm'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:07 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Reminder: Dinner! @ Mon Oct 22 7pm - 9pm'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:07 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Reminder: Croissants! @ Sun Oct 21, 2012'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:07 GMT-0500 (EST)'),
      from: '"Google+ team" <noreply-475ba29f@plus.google.com>',
      to: 'thafunkypresident@gmail.com',
      subject: 'Top 3 posts for you on Google+ this week'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:07 GMT-0500 (EST)'),
      from: 'wmt-noreply@google.com',
      to: 'thafunkypresident@gmail.com',
      subject: 'Email notifications from Google Webmaster Tools'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:07 GMT-0500 (EST)'),
      from: '"Brian Willard (Google+)" <replyto-7b45ec87@plus.google.com>',
      to: 'thafunkypresident@gmail.com',
      subject: 'July 10, 2012 (5 photos)'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:07 GMT-0500 (EST)'),
      from: '"Google+" <noreply-1670dad1@plus.google.com>',
      to: 'thafunkypresident@gmail.com',
      subject: 'Brian Willard added you on Google+'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:07 GMT-0500 (EST)'),
      from: '"Google+ team" <noreply-475ba29f@plus.google.com>',
      to: 'thafunkypresident@gmail.com',
      subject: 'Brian_Fitzpatrick',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:07 GMT-0500 (EST)'),
      from: '"Google+ team" <noreply-475ba29f@plus.google.com>',
      to: 'thafunkypresident@gmail.com',
      subject: 'Someone you might know on Google+',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:07 GMT-0500 (EST)'),
      from: 'noreply@google.com',
      to: 'thafunkypresident@gmail.com',
      subject: 'Ihr Google Datenexport-Archiv ist fertig.',
      labels:
      [
         'Personal',
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:07 GMT-0500 (EST)'),
      from: 'Google Voice <voice-noreply@google.com>',
      to: 'thafunkypresident@gmail.com',
      subject: 'Change to your Google Voice account',
      labels:
      [
         'Personal',
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:07 GMT-0500 (EST)'),
      from: 'Google Voice <voice-noreply@google.com>',
      to: 'thafunkypresident@gmail.com',
      subject: 'New voicemail from (917) 359-5785 at 3:18 PM',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:07 GMT-0500 (EST)'),
      from: '"(917) 359-5785" <17736093865.19173595785.Tjz-mdw7-7@txt.voice.google.com>',
      to: 'thafunkypresident@gmail.com',
      subject: 'SMS from (917) 359-5785',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:07 GMT-0500 (EST)'),
      from: '"(917) 359-5785" <17736093865.19173595785.Tjz-mdw7-7@txt.voice.google.com>',
      to: 'thafunkypresident@gmail.com',
      subject: 'SMS from (917) 359-5785',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:07 GMT-0500 (EST)'),
      from: 'Google Voice <voice-noreply@google.com>',
      to: 'thafunkypresident@gmail.com',
      subject: 'Welcome to Google Voice',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:07 GMT-0500 (EST)'),
      from: 'Google Voice <voice-noreply@google.com>',
      to: 'thafunkypresident@gmail.com',
      subject: 'Welcome to Google Voice',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:07 GMT-0500 (EST)'),
      from: 'JJ Lueck <jlueck@google.com>',
      to: 'JJ Lueck <jlueck@google.com>, thafunkypresident@gmail.com',
      subject: 'Sample video',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:07 GMT-0500 (EST)'),
      from: '<noreply-3467b12d@plus.google.com>',
      to: 'thafunkypresident@gmail.com',
      subject: 'Re: One beautiful user experience',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:07 GMT-0500 (EST)'),
      from: '"Google+" <noreply-3467b12d@plus.google.com>',
      to: 'thafunkypresident@gmail.com',
      subject: 'E1ri_Ragnarsson_is_now_a_manager_of_the_Funky_presi',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:07 GMT-0500 (EST)'),
      from: '"Google+" <noreply-3467b12d@plus.google.com>',
      to: 'thafunkypresident@gmail.com',
      subject: 'Testing',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:07 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Reminder: Noogler Takes Day off for Moving @ Fri Apr 27 9am - 10am',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:07 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Reminder: Bring Your Keds to Work @ Thu Apr 26 9am - 10am',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:07 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Reminder: Stand-Up Comedy @ Wed Apr 25 11am - 12pm',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:07 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Reminder: Q1 2012 Board of NerfWarriors All Hands @ Tue Apr 24 2pm -',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:07 GMT-0500 (EST)'),
      from: '"Google+ team" <noreply-475ba29f@plus.google.com>',
      to: 'thafunkypresident@gmail.com',
      subject: '6 people you might know on Google+',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:07 GMT-0500 (EST)'),
      from: 'Google Wallet <wallet-noreply@google.com>',
      to: 'thafunkypresident@gmail.com',
      subject: '=?utf-8?q?Google_Wallet_special_offer_today=3A_=245_for_=2410_at_Starbuck?=',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:07 GMT-0500 (EST)'),
      from: '"Google+" <noreply-1670dad1@plus.google.com>',
      to: 'thafunkypresident@gmail.com',
      subject: 'Testing',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:07 GMT-0500 (EST)'),
      from: '"Google+" <noreply-1670dad1@plus.google.com>',
      to: 'thafunkypresident@gmail.com',
      subject: 'Testing',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:07 GMT-0500 (EST)'),
      from: '<noreply-3467b12d@plus.google.com>',
      to: 'thafunkypresident@gmail.com',
      subject: 'Re: I could really use a generously crafter bologna...',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:07 GMT-0500 (EST)'),
      from: '"Chuck Finley (Google+)" <noreply-138cdc6f@plus.google.com>',
      to: 'thafunkypresident@gmail.com',
      subject: 'Re: I could really use a generously crafter bologna...',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:08 GMT-0500 (EST)'),
      from: '<noreply-3467b12d@plus.google.com>',
      to: 'thafunkypresident@gmail.com',
      subject: 'Re: If anyone is reading this, please bring me...',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:08 GMT-0500 (EST)'),
      from: '"Chuck Finley (Google+)" <noreply-138cdc6f@plus.google.com>',
      to: 'thafunkypresident@gmail.com',
      subject: 'Re: If anyone is reading this, please bring me...',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:08 GMT-0500 (EST)'),
      from: '"Google+ team" <noreply-daa26fef@plus.google.com>',
      to: 'thafunkypresident@gmail.com',
      subject: 'Getting started on Google+',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:08 GMT-0500 (EST)'),
      from: 'Google Checkout <noreply@checkout.google.com>',
      to: 'thafunkypresident@gmail.com',
      subject: 'Rate your shopping experience with Google using Google Checkout',
      labels:
      [
         'Personal',
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:08 GMT-0500 (EST)'),
      from: 'Google Voice <voice-noreply@google.com>',
      to: 'thafunkypresident@gmail.com',
      subject: 'Welcome to Google Voice',
      labels:
      [
         'Personal',
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:08 GMT-0500 (EST)'),
      from: 'Google <privacy-noreply@google.com>',
      to: 'thafunkypresident@gmail.com',
      subject: 'Changes to Google Privacy Policy and Terms of Service',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:08 GMT-0500 (EST)'),
      from: 'no-reply@google.com',
      to: 'thafunkypresident@gmail.com',
      subject: 'Upgrade to Google Paid Storage',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:08 GMT-0500 (EST)'),
      from: 'Google Checkout <noreply@checkout.google.com>',
      to: 'thafunkypresident@gmail.com',
      subject: 'Order receipt from Google ($5.00)',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:08 GMT-0500 (EST)'),
      from: 'noreply@google.com',
      to: 'thafunkypresident@gmail.com',
      subject: 'Ihr Google Datenexport-Archiv ist fertig.',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:08 GMT-0500 (EST)'),
      from: 'Google Kalender <calendar-notification@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Erinnerung: Lunch break @ Di 20. Dez. 11:00 - 13:00',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:08 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Reminder: Lunch break @ Mon Dec 19 11am - 1pm',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:08 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Reminder: Lunch break @ Sun Dec 18 11am - 1pm',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:08 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Reminder: Lunch break @ Sat Dec 17 11am - 1pm',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:08 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Reminder: Lunch break @ Fri Dec 16 11am - 1pm',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:08 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Reminder: Breakfast at Macy\'s @ Tue Dec 13 6:30am - 7:50am (Takeout',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:08 GMT-0500 (EST)'),
      from: 'noreply@google.com',
      to: 'thafunkypresident@gmail.com',
      subject: 'Your Google Takeout archive is ready',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:08 GMT-0500 (EST)'),
      from: 'nobody@google.com',
      to: 'thafunkypresident@gmail.com',
      subject: 'Your Google Takeout archive is ready',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:08 GMT-0500 (EST)'),
      from: 'noreply@google.com',
      to: 'thafunkypresident@gmail.com',
      subject: 'Your Google Takeout archive is ready',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:08 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Reminder: Breakfast at Macy\'s @ Tue Dec 6 6:30am - 7:50am (Takeout',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:08 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Reminder: Breakfast at Macy\'s @ Tue Dec 6 6:30am - 7:50am (Test calendar)',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:08 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Reminder: Breakfast at Macy\'s @ Tue Nov 29 6:30am - 7:50am (Test calendar)',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:08 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Reminder: Breakfast at Macy\'s @ Tue Nov 29 6:30am - 7:50am (Takeout',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:08 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Reminder: Breakfast at Macy\'s @ Tue Nov 22 6:30am - 7:50am (Test calendar)',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:08 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Reminder: Breakfast at Macy\'s @ Tue Nov 22 6:30am - 7:50am (Takeout',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:08 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Reminder: Hair of the dog @ Fri Nov 11 9:30am - 10:30am',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:08 GMT-0500 (EST)'),
      from: 'JJ Lueck <jlueck@google.com>',
      to: '"thafunkypresident@gmail.com" <thafunkypresident@gmail.com>',
      subject: 'Accepted: Test an event with organizers, attendees @ Thu Nov 10',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:08 GMT-0500 (EST)'),
      from: 'Nick Piepmeier <pieps@google.com>',
      to: '"thafunkypresident@gmail.com" <thafunkypresident@gmail.com>',
      subject: 'Accepted: Test an event with organizers, attendees @ Thu Nov 10',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:08 GMT-0500 (EST)'),
      from: 'Kari Ragnarsson <karir@google.com>',
      to: '"thafunkypresident@gmail.com" <thafunkypresident@gmail.com>',
      subject: 'Accepted: Test an event with organizers, attendees @ Thu Nov 10',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:08 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Reminder: Liberate calendars @ Fri Nov 4 12pm - 1:50pm (Test calendar)',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:08 GMT-0500 (EST)'),
      from: 'YouTube <no_reply@youtube.com>',
      to: 'thafunkypresident <thafunkypresident@gmail.com>',
      subject: '=?iso-8859-1?q?Invitation_to_earn_revenue_from_your_YouTube_videos_?=',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 11 2012 10:57:08 GMT-0500 (EST)'),
      from: 'Nick Piepmeier <pieps@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Hey Chuck, can you help me out?',
      labels:
      [
         'Retention5'
      ]
   }
]);



if (window.location) {
  var mails = WorkerDAO2.create({ model: "EMail" });
  mails.put(EMail.create({ from: "a", to: "kgr", subject: "email1", timestamp: new Date(Date.now)}));
  mails.put(EMail.create({ from: "r", to: "fredjk", subject: "email8", timestamp: new Date(Date.now - 10000)}));
  mails.put(EMail.create({ from: "z", to: "fredjk", subject: "email9", timestamp: new Date(Date.now - 20000)}));
  mails.put(EMail.create({ from: "f", to: "fredjk", subject: "email10", timestamp: new Date(Date.now - 30000)}));
}

mails.orderBy(EMail.FROM).select(console.log.json);
