var timer = foam.util.Timer.create();
timer.start();

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


var e13 = E('div').add(
  E('br'),
  'dynamic function * ',
  function() { return timer.second % 2 ? 'PING' : E().add('PONG').style({color: 'orange'}); },
  ' *    dynamic value: ',
  timer.i$,
  '  ',
  function(i) { return i%10; }.on$(X, timer.i$));
e13.write();

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
// Will update on submit
v8.addListener(function() { console.log('**change: ', arguments); });
// Will update on the keystroke
e8.attrValue(null, 'input').addListener(function() { console.log('**input: ', arguments); });

var e9 = E('input');
e9.write();
timer.i$ = e9.attrValue();

var e10 = E('font').add(E('br'), 'set attr before').attrs({color: 'red'});
e10.write();

var e11 = E('font').add(E('br'), 'set attr after',E('br'));
e11.write();
e11.attrs({color: 'red'});

var e12 = E('div').add('dynamic style');
e12.write();
e12.style({
  background: '#ccc',
  width: 200,
  visibility: function() { return Math.floor(timer.i/30) % 2 ? 'hidden' : 'visible'; },
  color: function() { return Math.floor(timer.i/20) % 2 ? 'black' : 'yellow'; }
});

var e14 = E('font').style({height: '80px', display: 'block'}).add('dynamic attribute');
e14.write();
e14.attrs({
  size: function() { return Math.floor(timer.i/20) % 9; },
  color: 'black'
});

E('div').style({height: '30px'}).write();

MODEL({name: 'Person', properties: ['firstName', 'lastName', 'age']});
var dd = Person.create({firstName: 'Donald', lastName: 'Duck', age: 83});

foam.u2.DetailView.create({data:dd}).write();

var dv = foam.u2.DetailView.create().write();



setTimeout(function() { dv.data = dd; }, 2000);
// setTimeout(function() { dv.properties = [dv.model_.PROPERTIES, dv.model_.MODEL, dv.model_.DATA]; }, 5000);
setTimeout(function() { dv.title = 'New Title'; }, 7000);

var e15 = foam.u2.Input.create().write();
e15.data$ = timer.i$;

E('div').style({height: '30px'}).write();

foam.u2.Input.create().write().data$ = foam.u2.Input.create().write().data$;

foam.u2.OnKeyInput.create().write().data$ = foam.u2.OnKeyInput.create().write().data$;

E('div').style({height: '30px'}).write();

foam.u2.TextArea.create().write().data$ = foam.u2.TextArea.create().write().data$;
foam.u2.OnKeyTextArea.create().write().data$ = foam.u2.OnKeyTextArea.create().write().data$;

E('div').style({height: '30px'}).write();
var e16 = foam.u2.Select.create({placeholder: 'Pick a Colour:', options: [['r', 'Red'],['g', 'Green'], ['b', 'Blue'], 'Pink']}).write();
var e17 = foam.u2.Select.create({options: [['r', 'Red'],['g', 'Green'], ['b', 'Blue'], 'Pink']}).write();

e16.data$ = e17.data$;

setTimeout(function() {
  e17.options = [['b', 'Bert'], ['e', 'Ernie']];
}, 5000);

//timer.stop();


MODEL({
  name: 'AllViews',
  properties: [
    {
      name: 'default'
    },
    {
      model_: 'StringProperty',
      name: 'string'
    },
    {
      model_: 'BooleanProperty',
      name: 'boolean'
    },
    {
      model_: 'DateProperty',
      name: 'date'
    },
    {
      model_: 'DateTimeProperty',
      name: 'dateTime'
    },
    {
      model_: 'IntProperty',
      name: 'int'
    },
    {
      model_: 'LongProperty',
      name: 'long'
    },
    {
      model_: 'FloatProperty',
      name: 'float'
    },
    {
      model_: 'FunctionProperty',
      name: 'function'
    },
    {
      model_: 'TemplateProperty',
      name: 'template'
    },
    {
      model_: 'ArrayProperty',
      name: 'array'
    },
    // ReferenceProperty
    {
      model_: 'StringArrayProperty',
      name: 'stringArray'
    },
    {
      model_: 'EMailProperty',
      name: 'email'
    },
    {
      model_: 'ImageProperty',
      name: 'image'
    },
    {
      model_: 'URLProperty',
      name: 'string'
    },
    {
      model_: 'ColorProperty',
      name: 'color'
    },
    {
      model_: 'PasswordProperty',
      name: 'password'
    },
    {
      model_: 'PhoneNumberProperty',
      name: 'phoneNumber'
    }
  ]
});

E('div').style({height: '30px'}).write();

var dv2 = foam.u2.DetailView.create({data: AllViews.create()}).write();
var dv3 = foam.u2.DetailView.create({data: dv2.data}).write();
