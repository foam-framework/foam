var f1 = amemo(function(ret) { console.log('f1'); ret(1); });
var f2 = function(ret, a) { console.log('f2'); ret(a,2); };
var f3 = function(a, b) { console.log(a,b); };
var f4 = console.log.bind(console);

console.log('test1');
f1.aseq(f2.aseq(f4))();

console.log('test2');
f1.aseq(f2.aseq(f4))();

console.log('test3');
f1.aseq(f4)();

console.log('test4');
ao(f4,f2,f1)();

console.log('test5');
aseq(f1, f4)();

console.log('test6');
aseq(f1,f2,f4)();

console.log('test7');
aseq(
  function(ret) { console.log('fB'); ret(1); },
  function(ret) { console.log('fC'); ret(2); },
  f4
)();

console.log('test8');
apar(
  function(ret, a) { console.log('fB'); ret(1); },
  function(ret, a) { console.log('fC'); ret(2); }
)(f4);

console.log('test9');
arepeatpar(5,
  function(ret, a, b) { console.log(a); ret(1); }
)(f4);

console.log('test10');
aseq(
  function(ret) { console.log('fA'); ret(1); },
  apar(
    function(ret, a) { console.log('fB', a); ret(1); },
    function(ret, a) { console.log('fC', a); ret(2); }
  ),
  f4
)();



var tlock = {};

function atest() {

var f1 = aseq(
   alog('f1 start'),
   asleep(2000),
   alog('f1 end')
);

// atime('test1', alog('foobar'))();
// atime('test1', aseq(alog('step 1'), alog('step 2')))();

// aseq(alog('stepA'), alog('stepB1').aseq(alog('stepB2')), alog('stepC'))();
// aseq(alog('stepA'), aseq(alog('stepB1'), alog('stepB2')), alog('stepC'))();

var f2 = aseq(asynchronized(atime('f2', f1), tlock), alog('END'));

// f1(anop);
// f1(anop);
/*
f2(anop);
f2(anop);
f2(anop);
*/

aseq(
  aseq(
    alog('starting'),
    atimeout(1000, asleep(500), alog('too slow')),
    alog('on time')
  ),
  aseq(
    alog('starting'),
    atimeout(1000, asleep(1500), alog('too slow')),
    alog('on time')
  )
)();

apar(
  arepeat(10, aseq(alog('A'), ayield())),
  arepeat(10, aseq(alog('B'), ayield()))
)();


  var functionFuture = afuture();
  var fn = futurefn(functionFuture);

  fn("hello");
  setTimeout(function() { fn(" world!"); }, 1000);
  setTimeout(function() { functionFuture.set(console.log.bind(console)); }, 100);
}
