/**
 * @license
 * Copyright 2013 Google Inc. All Rights Reserved.
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
*/

function lazyEval(fn) {
   var result;
   return function() {
      if ( ! result ) {
         result = fn.call(this);
      }
      return result;
   };
};

MODEL({
    name: 'EMailLabel',
    label: 'EMailLabel',

    ids: [ 'id' ],

    properties: [
        {
            model_: 'StringProperty',
            name: 'id',
            label: 'Label ID'
        },
        {
            model_: 'StringProperty',
            name: 'displayName',
            label: 'Display Name'
        },
        {
            model_: 'IntProperty',
            name: 'color',
            label: 'color',
            defaultValue: 0
        }
    ],

    methods: {
        // TODO:  Not an exhaustive list
        SystemLabels: {
          ALL:       '^all',
          DRAFT:     '^r',
          IMPORTANT: '^io_im',
          INBOX:     '^i',
          MUTED:     '^g', // 'g' is second letter of 'ignored'
          OPENED:    '^o',
          REPLIED:   '^io_re', // User has replied to this message
          SENT:      '^f',
          SPAM:      '^s',
          STARRED:   '^t', // 't' originall stood for TODO
          TRASH:     '^k',
          UNREAD:    '^u'
        },

        RENDERABLE_SYSTEM_LABELS: lazyEval(function() {
          var result = {};
          var SystemLabels = this.SystemLabels;
          result[SystemLabels.INBOX]     = true;
          result[SystemLabels.STARRED]   = true;
          result[SystemLabels.IMPORTANT] = true;
          result[SystemLabels.SPAM]      = true;
          result[SystemLabels.TRASH]     = true;
          result[SystemLabels.DRAFT]     = true;
          result[SystemLabels.SENT]      = true;
          result[SystemLabels.MUTED]     = true;
          result[SystemLabels.UNREAD]    = true;
          return result;
        }),

        SYSTEM_LABEL_RENDER_NAMES: lazyEval(function() {
          var result = {};
          var SystemLabels = this.SystemLabels;
          result[SystemLabels.ALL]       = 'All Mail';
          result[SystemLabels.INBOX]     = 'Inbox';
          result[SystemLabels.STARRED]   = 'Starred';
          result[SystemLabels.IMPORTANT] = 'Important';
          result[SystemLabels.SPAM]      = 'Spam';
          result[SystemLabels.TRASH]     = 'Trash';
          result[SystemLabels.DRAFT]     = 'Draft';
          result[SystemLabels.SENT]      = 'Sent';
          result[SystemLabels.MUTED]     = 'Muted';
          result[SystemLabels.UNREAD]    = 'Unread';
          result[SystemLabels.REPLIED]   = 'Replied';
          result[SystemLabels.OPENED]    = 'Opened';
          return result;
        }),

        SEARCHABLE_SYSTEM_LABELS: lazyEval(function() {
          var result = {};
          var SystemLabels = this.SystemLabels;
          result[SystemLabels.ALL]       = true;
          result[SystemLabels.INBOX]     = true;
          result[SystemLabels.STARRED]   = true;
          result[SystemLabels.IMPORTANT] = true;
          result[SystemLabels.SPAM]      = true;
          result[SystemLabels.TRASH]     = true;
          result[SystemLabels.DRAFT]     = true;
          result[SystemLabels.SENT]      = true;
          return result;
        }),

        isSystemLabel: function() {
          return this.displayName.charAt(0) == '^';
        },

        isRenderable: function() {
          return !this.isSystemLabel() || this.RENDERABLE_SYSTEM_LABELS()[this.displayName];
        },

        getRenderName: function() {
          var displayName = this.displayName;
          return this.SYSTEM_LABEL_RENDER_NAMES()[displayName] || displayName;
        },

        isSearchable: function() {
          return !this.isSystemLabel() || this.SEARCHABLE_SYSTEM_LABELS()[this.displayName];
        },

        getSearch: function() {
          switch(this.displayName) {
           case this.SystemLabels.ALL:
            return '-label:^r,^s,^k';
           case this.SystemLabels.SENT:
            return 'f:me';
           default:
            return 'label:"' + this.displayName + '"';
          }
        }
    }
});

MODEL({
    name: 'EMailPreference',
    label: 'EMailPreference',

    ids: [ 'name' ],

    properties: [
        {
            model_: 'StringProperty',
            name: 'name',
            label: 'Preference Name'
        },
        {
            model_: 'StringProperty',
            name: 'value',
            label: 'Preference Value'
        }
    ]
});

MODEL({
   name: 'Attachment',
   plural: 'Attachments',
   tableProperties:
   [
      'type',
      'filename',
      'position',
      'size'
   ],
   properties:
   [
      {
         model_: 'StringProperty',
         name: 'id',
         label: 'Identifier',
         displayWidth: 50,
         factory: function() {
           return this.$UID;
         }
      },
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
         type: 'String',
         displayWidth: 30,
         view: 'TextFieldView'
      },
      {
         model_: 'Property',
         name: 'size',
         type: 'int',
         displayWidth: 10,
         view: 'TextFieldView'
      },
      /**
       * Used in the MBOX reader to point to the position in the MBOX, but
       * for other uses, this doesn't make sense.
       **/
      {
         model_: 'Property',
         name: 'position',
         type: 'int',
         displayWidth: 10,
         view: 'TextFieldView'
      },
      {
        name: 'file',
        type: 'File',
        hidden: true
      },
      {
        model_: 'BooleanProperty',
        name: 'inline',
        defaultValue: false
      }
   ],
   methods: {
     atoMime: function(ret) {
       if ( !this.file ) {
         ret();
         return;
       }

       var self = this;

       var reader = new FileReader();
       reader.onloadend = function() {
         var data = Base64Encoder.encode(new Uint8Array(reader.result), 78);

         if ( data[data.length-1] !== '\n' ) data += '\r\n';

         var sanitizedName = self.filename
           .replace(/[\x00-\x1f]/g, '')
           .replace(/"/g, '');

         // TODO: Content disposition
         ret(
           "Content-Type: " + self.type + "; name=\"" + sanitizedName + '"\r\n' +
             (self.inline ? '' : 'Content-Disposition: attachment; filename=\"' + sanitizedName + '\"\r\n') +
             "Content-Transfer-Encoding: base64\r\n" +
             "Content-ID: <" + self.id + ">\r\n" +
             "X-Attachment-Id: " + self.id + "\r\n\r\n" +
             data);
       };
       reader.readAsArrayBuffer(this.file);
     }
   },
   actions:
   [
      {
         model_: 'Action',
         name: 'view',
         help: 'View an attachment.',
         action: function () {
         }
      }
   ]
});

var openComposeView = function(email) {
  DAOCreateController.getPrototype().newObj(email, EMailDAO);
}

var EmailAddressParser = {
  __proto__: grammar,

  START: sym('address'),

  'until eol': repeat(notChar('\r')),

  'address list': repeat(sym('address'), seq(',', repeat(' '))),

  'address': alt(
    sym('labelled address'),
    sym('simple address')),

  'labelled address': seq(
    repeat(notChars('<,')),
    '<', sym('simple address'), '>'),

  'simple address': seq(repeat(notChar('@')), '@', repeat(notChars('\r>,')))
}.addActions({
  'labelled address': function(v) { return v[0].join('') + v[1] + v[2] + v[3]; },
  'simple address': function(v) { return v[0].join('') + v[1] + v[2].join(''); }
});


var MBOXParser = {
  __proto__: grammar,

  START: sym('line'),

  'eol': literal('\n'),

  'until eol': repeat(notChar('\r')),

  line: alt(
    sym('start of email'),
    sym('id'),
    sym('conversation id'),
    sym('to'),
    sym('cc'),
    sym('bcc'),
    sym('from'),
    sym('subject'),
    sym('date'),
    sym('labels'),
    sym('block separator'),
    sym('content type'),
    sym('transfer encoding'),
    sym('empty line'),
    sym('start of attachment')
  ),

  'empty line': literal('\r\n'),

  'start of email': seq('From ', sym('until eol')),

  id: seq('Message-ID: ', sym('until eol')),

  'conversation id': seq('X-GM-THRID: ', sym('until eol')),

  address: EmailAddressParser.export('address'),

  'address list': EmailAddressParser.export('address list'),

  to: seq('To: ', sym('until eol')),
  cc: seq('Cc: ', sym('until eol')),
  bcc: seq('Bcc: ', sym('until eol')),
  from: seq('From: ', sym('until eol')),

  labels: seq('X-Gmail-Labels: ', repeat(sym('label'), ',')),

  label: repeat(alt(range('a','z'), range('A', 'Z'), range('0', '9'))),

  subject: seq('Subject: ', sym('until eol')),

  date: seq('Date: ', sym('until eol')),

  'other': sym('until eol'),

  'block separator': seq(
    '--', repeat(notChars('-\r\n')), optional('--')),

  'token': repeat(notChars(' ()<>@,;:\\"/[]?=')),

  'type': alt(
    sym('multipart type'),
    sym('text/plain'),
    sym('text/html'),
    sym('unknown content type')),

  'unknown content type': seq(sym('token'), '/', sym('token')),

  'multipart type': seq(literal('multipart/'), sym('token')),

  'text/plain': literal('text/plain'),
  'text/html': literal('text/html'),

  'content type': seq(
    'Content-Type: ',
    sym('type'),
    optional(seq('; ', sym('params')))),

  'params': repeat(alt(
    sym('boundary declaration'),
    sym('charset declaration'),
    seq(sym('token'), '=', sym('token')))),

  'boundary declaration': seq('boundary=', sym('token')),

  'charset declaration': seq('charset=', alt(
    sym('utf-8'),
    sym('iso-8859-1'),
    sym('token'))),


  'utf-8': literal('UTF-8'),
  'iso-8859-1': literal('ISO-8859-1'),

  'transfer encoding': seq(
    'Content-Transfer-Encoding: ',
    alt(sym('quoted printable'),
        sym('base64'),
        sym('until eol'))),

  'quoted printable': literal_ic('quoted-printable'),
  'base64': literal_ic('base64'),

  'start of attachment': seq(
    'Content-Type: ', repeat(notChar(';')), '; name="', sym("filename"), '"', sym('until eol')
//    'Content-Disposition: attachment; filename="', sym("filename"), '"', sym('until eol')
    ),

  filename: repeat(notChar('"'))

};

/** Sink which loads Emails into a DAO. **/
var MBOXLoader = {
  __proto__: MBOXParser,

  ps: StringPS.create(""),

  state: function(str) {
    this.states[0].call(this, str);
  },

  PARSE_HEADERS_STATE: function HEADERS(str) {
    this.parseString(str);
  },

  IGNORE_SECTION_STATE: function IGNORE_SECTION(str) {
    if ( str.slice(0, 5) === 'From ' ) {
      this.states.shift();
      this.state(str);
    } else if ( str.indexOf(this.blockIds[0]) == 2) {
      this.states.shift();
      if ( str.slice(-4, -2) == '--' ) {
        this.blockIds.shift();
      }
    }
  },

  PLAIN_BODY_STATE: function PLAIN_BODY(str) {
    if ( str.slice(0, 5) === 'From ' ) {
      this.states.shift();
      this.state(str);
      return;
    }

    if ( str.indexOf(this.blockIds[0]) == 2) {
      this.states.shift();
      if ( str.slice(-4, -2) == '--' ) {
        this.blockIds.shift();
      }
      return;
    }

    if ( ! this.hasHtml ) {
      this.b.push(str.trimRight());
    }
  },

  HTML_BODY_STATE: function HTML_BODY(str) {
    if ( str.slice(0, 5) === 'From ' ) {
      this.states.shift();
      this.state(str);
      return;
    }

    if ( str.indexOf(this.blockIds[0]) == 2) {
      this.states.shift();
      if ( str.slice(-4, -2) == '--' ) {
        this.blockIds.shift();
      }
      return;
    }

    this.b.push(str.trimRight());
  },

  SKIP_ATTACHMENT_STATE: function ATTACHMENT(str) {
    var att = this.email.attachments[this.email.attachments.length-1];
    if ( str.slice(0, 5) === 'From ' ) {
      att.size = att.pos - att.position;
      this.states.shift();
      this.state(str);
      return;
    }

    if ( str.indexOf(this.blockIds[0]) == 2) {
      this.states.shift();
      if ( str.slice(-4, -2) == '--' ) {
        this.blockIds.shift();
      }
      return;
    }
  },

  created: 0, // No of Emails created

  lineNo: 0,  // Current Line Number in mbox file

  pos: 0,     // Current byte position in mbox file

  segPos: 0,

  put: function(str) {
    if ( this.lineNo == 0 ) {
      this.segStartTime = this.startTime = Date.now();
      this.states = [this.PARSE_HEADERS_STATE];
    }

    this.lineNo++;
    this.pos += str.length;

    if ( ! ( this.lineNo % 100000 ) ) {
      var lps = Math.floor(this.lineNo / (Date.now() - this.startTime));
      var bps = Math.floor(this.pos / (Date.now() - this.startTime));
      var slps = Math.floor(100000 / (Date.now() - this.segStartTime));
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
        'state: ' + this.states[0].name);

      this.segStartTime = Date.now();
      this.segPos = this.pos;
    }

    this.state(str);
  },

  eof: function() { this.saveCurrentEmail(); },

  saveCurrentEmail: function() {
    if ( this.email ) {
      // TODO: Standardize encoding and charset interfaces.
      // Make them fetched from the context on demand.
      if ( this.b.encoding && this.b.encoding == 'quoted-printable' ) {
        var decoder = QuotedPrintable;

        if ( this.b.charset && this.b.charset == 'UTF-8' ) {
          var charset = IncrementalUtf8.create();
        } else {
          charset = {
            string: "",
            remaining: 0,
            put: function(s) {
              this.string += String.fromCharCode(s);
            },
            reset: function() {
              this.string = "";
            }
          };
        }

        var b = decoder.decode(this.b.join('\n'), charset);
      } else {
        b = this.b.join('\n');
      }



      this.email.body = b;

      this.charset = "";
      this.encoding = "";
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
    this.blockIds = [];
    this.states = [this.PARSE_HEADERS_STATE];
  },

//  id: function(v) { this.email.id = v[1].join('').trim(); },
  id: function(v) { this.email.id = Math.floor(Math.random()*100000000); },

  'conversation id': function(v) { this.email.convId = v[1].join('').trim(); },

  to: function(v) {
    this.email.to = v[1].join('').trim();
    var i = this.email.to.indexOf(',');
    if ( i != -1 ) this.email.to = this.email.to.substring(0, i);
},

  cc: function(v) {
    var cc = v[1].join('').split(',');
    for ( var i = 0; i < cc.length; i++ ) {
      cc[i] = cc[i].trim();
    }
    this.email.cc = cc;
  },

  bcc: function(v) {
    var bcc = v[1].join('').split(',');
    for ( var i = 0; i < bcc.length; i++ ) {
      bcc[i] = bcc[i].trim();
    }
    this.email.bcc = bcc;
  },

  from: function(v) { this.email.from = v[1].join('').trim(); },

  subject: function(v) { this.email.subject = v[1].join('').trim(); },

  date: function(v) { this.email.timestamp = new Date(v[1].join('').trim()); },

  label: function(v) { this.email.labels.push(v.join('')); },

  'text/plain': function(v) {
    this.nextState = this.PLAIN_BODY_STATE;
  },

  'text/html': function(v) {
    this.b = [];
    this.nextState = this.HTML_BODY_STATE;
  },

  'unknown content type': function() {
    this.nextState = this.IGNORE_SECTION_STATE;
  },

  'multipart type': function(v) {
    this.nextState = this.PARSE_HEADERS_STATE;
  },

  'empty line': function(v) {
    if ( this.nextState === this.PLAIN_BODY_STATE ||
         this.nextState === this.HTML_BODY_STATE ) {
      this.b.encoding = this.encoding;
      this.b.charset = this.charset;
    }
    this.states.unshift(this.nextState);
  },

  'boundary declaration': function(v) {
    this.blockIds.unshift(v[1].join('').trimRight());
  },

  'quoted printable': function() {
    this.encoding = 'quoted-printable';
  },

  'base64': function() {
    this.encoding = 'base64';
  },

  'utf-8': function() {
    this.charset = 'UTF-8';
  },

  'iso-8859-1': function() {
    this.charset = 'ISO-8859-1';
  },

  'block separator': function(v) {
    this.nextState = this.IGNORE_SECTION_STATE
    if ( v[2] ) {
      this.nextState = this.PARSE_HEADERS_STATE;
      this.blockIds.shift();
    }
  },

  'start of attachment': function(v, unused, pos) {
    this.nextState = this.SKIP_ATTACHMENT_STATE;

    var attachment = Attachment.create({
      type: v[1].join(''),
      filename: v[3].join(''),
      position: this.pos
    });

    this.email.attachments.push(attachment);
  }

  // TODO: timestamp, message-id, body, attachments
  // TODO: internalize common strings to save memory (or maybe do it at the DAO level)

});


MODEL({
    name: 'EMailBody',
    label: 'EMailBody',

    ids: [
        'offset',
        'size'
    ],

    properties: [
        {
            name: 'offset',
            type: 'Int',
            required: true
        },
        {
            name: 'size',
            type: 'Int',
            required: true
        },
        {
            name: 'value',
            type: 'String',
            defaultValue: ''
        }
    ],

    methods: {
    }
});

MODEL({
   name:  'EMailsView',

   extendsModel: 'DetailView',

   properties: [
      {
         name:  'value',
         type:  'Value',
         postSet: function(oldValue, newValue) {
            oldValue && oldValue.removeListener(this.updateHTML);
            newValue.addListener(this.updateHTML);
            this.updateHTML();
         },
         factory: function() { return SimpleValue.create(); }
      }
   ],

   listeners:
   [
     {
       model_: 'Method',
       name: 'updateHTML',
       code: function() {
         var c = this.value.get();
         if (!c) return;

         var html = "";
         this.children = [];

         var self = this;
         c.forEach(function(m) {
           var v = MessageView.create({});
           self.addChild(v);

           // This is done to actually get the email bodies.
           EMailDAO.find(m.id, {
             put: function(m2) {
               v.value.set(m2);
             }
           });

           html += v.toHTML();
         });

        this.el.innerHTML = html;

        this.initChildren();
       }
     }
  ],

   methods: {
     toHTML: function() {
       return '<div id="' + this.id + '"></div>';
     },
   }
});
