/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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

CLASS({
   "package": "foam.lib.email",
   "name": "MBOXLoader",
   "requires": [
      "foam.lib.email.MBOXParser",
      "foam.lib.email.EMail",
      "foam.util.encodings.IncrementalUtf8",
      "foam.util.encodings.QuotedPrintable"
   ],
   "properties": [
      {
         model_: "Property",
         "name": "dao"
      },
      {
         model_: "Property",
         "name": "parser",
         "lazyFactory": function () {
        var self = this;
        return {
          __proto__: this.MBOXParser.create().parser,

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
                var decoder = self.QuotedPrintable;

                if ( this.b.charset && this.b.charset == 'UTF-8' ) {
                  var charset = self.IncrementalUtf8.create();
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
              if ( self.dao ) self.dao.put(this.email);
            }
          }
        }.addActions({
          'start of email': function() {
            this.saveCurrentEmail();

            this.email = self.EMail.create();
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
      }
      }
   ],
   "actions": [],
   "constants": [],
   "messages": [],
   "methods": [
      {
         model_: "Method",
         "name": "load",
         "code": function (data) {
      this.parser.parseString(data);
    },
         "args": []
      }
   ],
   "listeners": [],
   "templates": [],
   "models": [],
   "tests": [],
   "relationships": [],
   "issues": []
});
