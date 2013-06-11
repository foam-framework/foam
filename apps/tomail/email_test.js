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
