/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
