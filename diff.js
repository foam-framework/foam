defineProperties(Array.prototype, {
    diff: function(other) {
        var added = other.slice(0);
        var removed = [];
        for (var i = 0; i < this.length; i++) {
            for (var j = 0; j < added.length; j++) {
                if (this[i].compareTo(added[j]) == 0) {
                    added.splice(j, 1);
                    j--;
                    break;
                }
            }
            if (j == added.length) removed.push(this[i]);
        }
        return { added: added, removed: removed };
    }
});
