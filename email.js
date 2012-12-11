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
         label: 'Time',
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

  put: function(str) { this.parseString(str); },

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