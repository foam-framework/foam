// todo: add enabled/disabled support
// todo: bind

function SimpleValue(val) {
    this.val_ = val || "";

    return this;
}

SimpleValue.prototype = { __proto__: PropertyChangeSupport };
SimpleValue.prototype.set = function(val) {
   var oldValue = this.get();
   this.val_ = val;
   this.propertyChange(null, oldValue, val);
   return this;
};
SimpleValue.prototype.get = function() {
    return this.val_;
};
SimpleValue.prototype.toString = function() {
    return "SimpleValue(" + this.get() + ")";
};

