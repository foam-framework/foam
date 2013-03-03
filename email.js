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

/* TODO:
     - parse multiple addresses in 'to'
     - needs better end-of-attachment handling so it doesn't detect and parse
       emails embeded as attachments in other emails
*/

var Attachment = FOAM.create({
   model_: 'Model',
   name: 'Attachment',
   label: 'Attachment',
   plural: 'Attachments',
   ids: [ 'filename' ],
   tableProperties:
   [
      'type',
      'filename',
      'size'
   ],
   properties:
   [
      {
         model_: 'Property',
         name: 'filename',
         label: 'File Name',
         type: 'String',
         displayWidth: 50,
         view: 'TextFieldView'
      },
      {
         model_: 'Property',
         name: 'type',
         label: 'Type',
         type: 'String',
         displayWidth: 30,
         view: 'TextFieldView'
      },
      {
         model_: 'Property',
         name: 'size',
         label: 'Size',
         type: 'int',
         displayWidth: 10,
         view: 'TextFieldView'
      },
      {
         model_: 'Property',
         name: 'position',
         label: 'Position',
         type: 'int',
         displayWidth: 10,
         view: 'TextFieldView'
      },
   ],
   actions:
   [
      {
         model_: 'Action',
         name: 'view',
         label: 'View',
         help: 'View an attachment.',
         action: function () {
         }
      }
   ]
});


var EMail = FOAM.create({
   model_: 'Model',
   name: 'EMail',
   label: 'EMail',
   plural: 'EMail',
   ids: [ 'timestamp' ],
   tableProperties:
   [
      'attachments',
      'from',
      'to',
      'subject',
      'timestamp'
   ],
   properties:
   [
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
         tableWidth: '100',
         preSet: function (d) {
           return typeof d === 'string' ? new Date(d) : d;
	 },
         tableFormatter: function(d) {
           return d.toDateString();
         },
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
         tableFormatter: function(t) {
           return t.replace(/"/g, '').replace(/<.*/, '');
         },
         valueFactory: function() { return GLOBAL.user || ""; }
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
         view: 'TextFieldView',
         tableFormatter: function(t) {
           return t.replace(/"/g, '').replace(/<.*/, '');
         }
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
         tableWidth: '45%',
         view: 'TextFieldView'
      },
      {
         model_: 'Property',
         name: 'labels',
	 label: 'Labels',
	 type: 'Array[String]',
	 view: 'StringArrayView',
	 valueFactory: function() { return []; },
         postSet: function(a) {
	   for ( var i = 0 ; i < a.length ; i++ ) a[i] = a[i].intern();
         },
	 help: 'Email labels.'
      },
      {
         model_: 'Property',
	 name: 'attachments',
	 label: 'Attachments', // TODO: switch to paperclip icon
	 type: 'Array[Attachment]',
         subType: 'Attachment',
	 view: 'ArrayView',
	 valueFactory: function() { return []; },
         tableWidth: '20',
         tableFormatter: function(a) {
           return a.length ? a.length : "";
         },
	 help: 'Email attachments.'
      },
      {
         model_: 'Property',
         name: 'body',
         label: '',
         type: 'String',
         displayWidth: 70,
         displayHeight: 15,
         view: 'TextAreaView',
         help: 'Email message body.',
         summaryFormatter: function(t) {
           return '<div class="messageBody">' + t.replace(/\n/g,'<br/>') + '</div>';
         }
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

  'until eol': repeat(notChar('\r')),

  line: alt(
    sym('start of email'),
    sym('to'),
    sym('from'),
    sym('subject'),
    sym('date'),
    sym('labels'),
    sym('start of block'),
    sym('start of body'),
    sym('start of attachment')
  ),

  'start of email': seq('From ', sym('until eol')),

//  to: seq('To: ', repeat(not(alt(',', '\r'))) /*sym('until eol')*/),
  to: seq('To: ', sym('until eol')),
  from: seq('From: ', sym('until eol')),

  labels: seq('X-Gmail-Labels: ', repeat(sym('label'), ',')),

  label: repeat(alt(range('a','z'), range('A', 'Z'), range('0', '9'))),

  subject: seq('Subject: ', sym('until eol')),

  date: seq('Date: ', sym('until eol')),

  'other': sym('until eol'),

  'email address': alt(
    sym('named email address'),
    sym('raw email address')),

  'named email address': seq(
    repeat(notChar('<')),
    sym('raw email address'),
    '>'),

  'start of block': seq(
    '--', sym('until eol')),

  'start of body': seq(
    'Content-Type: text/plain; ',
    sym('until eol')
    ),

  'end of body': alt(
    seq('Content-Transfer-Encoding:', sym('until eol')),
    '--',
    '\n--'), // TODO: remove this line when reader fixed!

  'start of attachment': seq(
    'Content-Type: ', repeat(notChar(';')), '; name="', sym("filename"), '"', sym('until eol')
//    'Content-Disposition: attachment; filename="', sym("filename"), '"', sym('until eol')
    ),

  filename: repeat(notChar('"')),

  'raw email address': seq(repeat(notChar('@')), sym('until eol'))

};

/** Sink which loads Emails into a DAO. **/
var MBOXLoader = {
  __proto__: MBOXParser,

  PARSE_HEADERS_STATE: function HEADERS(str) {
    this.parseString(str);
  },

  READ_BODY_STATE: function BODY(str) {
    if ( str.slice(0, 5) === 'From ' ) {
      this.state = this.PARSE_HEADERS_STATE;
      this.state(str);
      return;
    }

    if ( str.indexOf(this.blockId) == 2 && str.slice(-3, -1) == '--' ) {
      this.state = this.PARSE_HEADERS_STATE;
      this.blockId = undefined;
    }

    this.b.push(str.trimRight());
  },

  SKIP_ATTACHMENT_STATE: function ATTACHMENT(str) {
    if ( str.slice(0, 5) === 'From ' ) {
      this.state = this.PARSE_HEADERS_STATE;
      this.state(str);
      return;
    }

    if ( str.indexOf(this.blockId) == 2 && str.slice(-3, -1) == '--' ) {
      this.state = this.PARSE_HEADERS_STATE;
      this.blockId   = undefined;
    }
  },

  created: 0, // No of Emails created
 
  lineNo: 0,  // Current Line Number in mbox file

  pos: 0,     // Current byte position in mbox file

  segPos: 0,

  put: function(str) {
    if ( this.lineNo == 0 ) {
      this.segStartTime = this.startTime = Date.now();
      this.state = this.PARSE_HEADERS_STATE;
    }

    this.lineNo++;
    this.pos += str.length;

    if ( ! ( this.lineNo % 10000 ) ) {
      var lps = Math.floor(this.lineNo / (Date.now() - this.startTime));
      var bps = Math.floor(this.pos / (Date.now() - this.startTime));
      var slps = Math.floor(10000 / (Date.now() - this.segStartTime));
      var sbps = Math.floor((this.pos-this.segPos) / (Date.now() - this.segStartTime));

      console.log(
        'line: ' + Math.floor(this.lineNo/1000) +
        'k  time: ' + Math.floor((Date.now() - this.startTime)) +
        'ms  bytes: ' + Math.floor(this.pos/1000) +
        'k  created: ' + this.created +
        '    SEGMENT:',
        ' lps: ' + slps +
        'k bps: ' + sbps + 'k' +
        '    TOTAL:',
        ' lps: ' + lps +
        'k bps: ' + bps + 'k ' +
        'state: ' + this.state.name);

      this.segStartTime = Date.now();
      this.segPos = this.pos;
    } 

    this.state(str);
  },

  eof: function() { this.saveCurrentEmail(); },

  saveCurrentEmail: function() {
    if ( this.email ) {
      this.email.body = this.b.join('\n');

      var i = this.email.body.indexOf("Content-Type:");
      if ( i != -1 ) this.email.body = this.email.body.slice(0,i);

      i = this.email.body.indexOf("Content-Transfer-Encoding: base64");
      if ( i != -1 ) this.email.body = this.email.body.slice(0,i);

      this.email.timestamp = new Date(Date.now() + Math.random()*360000); // tmp
      this.b = [];
      if ( this.email.to.length == 0 ) return;
      if ( this.email.to.indexOf('<<') != -1 ) return;
      if ( this.email.from.indexOf('<<') != -1 ) return;
      if ( this.email.to.indexOf('3D') != -1 ) return;
      if ( this.email.from.indexOf('3D') != -1 ) return;
      if ( this.email.from.indexOf('=') != -1 ) return;
      if ( this.email.from.indexOf('<') == 0 ) return;
      if ( this.email.from.indexOf(' ') == 0 ) return;

      this.created++;

      // console.log('creating: ', this.created);
      // console.log('creating: ', this.email.toJSON());
      if ( this.dao ) this.dao.put(this.email);

    }
  }
}.addActions({
  'start of email': function() {
    this.saveCurrentEmail();

    this.email = EMail.create();
    this.b = [];
  },

  to: function(v) { 
    this.email.to = v[1].join('').trim(); 
    var i = this.email.to.indexOf(',');
    if ( i != -1 ) this.email.to = this.email.to.substring(0, i);
},

  from: function(v) { this.email.from = v[1].join('').trim(); },

  subject: function(v) { this.email.subject = v[1].join('').trim(); },

  label: function(v) { this.email.labels.push(v.join('')); },

  'start of block': function(v) {
     var blockId = v[1].join('');
     if ( blockId.slice(-2) == '--' ) return;
     this.blockId = blockId;
   },

  'start of body': function(v) {
    this.state = this.READ_BODY_STATE;
  },

  'start of attachment': function(v) {
    var attachment = Attachment.create();

    attachment.type = v[1].join('');
    attachment.filename = v[3].join('');

    this.email.attachments.push(attachment);
    this.state = this.SKIP_ATTACHMENT_STATE;
  },

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



var EMailBody = FOAM.create({
    model_: 'Model',
    label: 'EMailBody',
    name: 'EMailBody',

    ids: [
        'offset',
        'size'
    ],

    properties: [
        {
            name: 'offset',
            label: 'Offset',
            type: 'Integer',
            required: true
        },
        {
            name: 'size',
            label: 'Size',
            type: 'Integer',
            required: true
        },
        {
            name: 'value',
            label: 'Value',
            type: 'String',
            defaultValue: ''
        }
    ],

    methods: {
    }
});
