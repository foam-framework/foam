E('b').add('bold', E('br')).write();

E('b').add(
  'color: ',
  E('font').attrs({color: 'red'}).add('red', E('br'))).write();

var e = E('font').add('text', E('br'));
console.log('id: ', e.id);

e.write();

e.attrs({color: 'orange'});

e.style({
  fontWeight: 'bold',
  fontSize:  '32pt'
});

e.on('click', function() { console.log('clicked'); });


var e2 = E('font').add('on click, before', E('br')).on('click', function() { console.log('clicked, before'); });
e2.write();

var e2b = E('font').add('on click, after');
e2b.write();
e2b.on('click', function() { console.log('clicked, after'); });


var e3 = E('div').add('first line, added before');
e3.write();
e3.add(E('br'),'second line, added after');


var e4 = E('div').add('add style before').style({color: 'blue'});
e4.write();

var e5 = E('div').add('add style after');
e5.write();
e5.style({color: 'blue'});


var e6 = E('div').add('add class before').cls(['important']);
e6.write();

var e7 = E('div').add('add class after');
e7.write();
e7.cls(['important']);

var e8 = E('input');
e8.write();
var v8 = e8.attrValue();
v8.set('foobar');
v8.addListener(function() { console.log('**change: ', arguments); });