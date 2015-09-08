E('b').c('bold', E('br')).write();

E('b').c(
  'color: ',
  E('font').attr('color', 'red').c('red', E('br'))).write();

var e = E('font').c('text', E('br'));
console.log('id: ', e.id);

e.write();

e.attr('color', 'orange');

e.style('fontWeight', 'bold');
e.style('fontSize',   '32pt');

e.on('click', function() { console.log('clicked'); });

var e2 = E('font').c('(click me, important)');
e2.on('click', function() { console.log('clicked, but listener added before.'); });
e2.write();
e2.cls('important');

var e3 = E('div').c('first line');
e3.write();
e3.c(E('br'),'second line');
