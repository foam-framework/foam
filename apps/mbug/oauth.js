var state = location.hash.match(/state=([^&]*)/);
var token = location.hash.match(/token=([^&]*)/);

if ( state ) {
  window.opener.__JSONP_CALLBACKS__[state[1]](token ? token[1] : '');
}
