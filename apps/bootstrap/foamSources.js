var FOAM_SOURCES = files.filter(function(m) {
  if ( Array.isArray(m) ) return m[1]();
  return true;
}).map(function(m) {
  if ( Array.isArray(m) ) m = m[0];
  return 'core/' + m + '.js';
});
