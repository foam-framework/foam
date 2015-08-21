/*
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


function test(str, p) {
console.log('parsing: ' + str);
  var val = p.parseString(str);
  console.log(str + ': ', val);
//  var res = p(StringPS.create(str));

//  console.log(str, res && res.value);
}

var p = EmailAddressParser;
test("kgr@foo.com\r", p);
test("<kgr@foo.com>", p);
test("Kevin Greer <kgr@foo.com>", p);
test('"Kevin Greer" <kgr@foo.com>', p);

p.START = p['address list'];
test("kgr@foo.com, kgr@bar.com,", p);
test("kgr@foo.com, kgr@bar.com, Kevin Greer <kgr@foo.com>, \"Kevin Greer\" <kgr@foo.com>", p);

console.log(EmailAddressParser.address(StringPS.create('kgr@foo.com')).value);
console.log(MBOXParser.address(StringPS.create('kgr@foo.com')).value);


var blob = new Blob(["hello, world!"], { type: 'text/plain' });

var att = Attachment.create({
  filename: 'message.txt',
  file: blob,
  type: blob.type,
  size: blob.size
});

var blob2 = new Blob(["foobar"], { type: 'image/jpeg' });

var inlineAtt = Attachment.create({
  id: 12,
  filename: 'image.png',
  file: blob2,
  type: blob2.type,
  size: blob2.size,
  inline: true
})

var msg = EMail.create({
  attachments: [att, inlineAtt],
  from: 'adamvy@google.com',
  to: ['kgr@google.com'],
  subject: 'test msg',
  body: 'hello<b>&nbsp;world!<img id="12" src="asdfasdfasdf"></b>'
});

aseq(
  msg.atoMime.bind(msg),
  function(ret, output) {
    ret();
  })(function(){});
