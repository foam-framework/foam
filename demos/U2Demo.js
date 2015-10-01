E('b').add('bold', E('br')).write();

E('b').add(
  'color: ',
  E('font').attr('color', 'red').add('red', E('br'))).write();

var e = E('font').add('text', E('br'));
console.log('id: ', e.id);

e.write();

e.attr('color', 'orange');

e.style('fontWeight', 'bold');
e.style('fontSize',   '32pt');

e.on('click', function() { console.log('clicked'); });

var e2 = E('font').add('(click me, important)');
e2.on('click', function() { console.log('clicked, but listener added before.'); });
e2.write();
e2.cls('important');

var e3 = E('div').add('first line');
e3.write();
e3.add(E('br'),'second line');
