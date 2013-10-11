String.prototype.hashCode = function() {
  var hash = 0;
  if ( this.length == 0 ) return hash;

  for (i = 0; i < this.length; i++) {
    var code = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + code;
    hash &= hash;
  }

  return hash;
};
