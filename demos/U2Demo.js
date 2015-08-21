E('b').c('bold', E('br')).write(document);

E('b').c(
  'color: ',
  E('font').attr('color', 'red').c('red', E('br'))).write(document);

var e = E('font').c('text', E('br'));
console.log('id: ', e.id);

e.write(document);

e.attr('color', 'orange');

e.style('fontWeight', 'bold');
e.style('fontSize',   '32pt');

e.on('click', function() { console.log('clicked'); });

var e2 = E('font').c('important text');
e2.write(document);
e2.cls('important');

var e3 = E('div').c('first line');
e3.write(document);
e3.c(E('br'),'second line');
