/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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

class Events {
  static var listeners:
      [(from: PropertyValue, to: PropertyValue, listener: PropertyChangeListener)] = []
  class func link(a: PropertyValue, b: PropertyValue) {
    Events.follow(a, to: b)
    Events.follow(b, to: a)
  }
  class func unlink(a: PropertyValue, b: PropertyValue) {
    Events.unfollow(a, to: b)
    Events.unfollow(b, to: a)
  }
  class func follow(from: PropertyValue, to: PropertyValue) {
    let listener = PropertyChangeListener(callback: { (obj, prop, oldValue, newValue) -> Void in
      if !equals(to.get(), b: newValue) {
        to.set(newValue)
      }
    })
    listeners.append((from: from, to: to, listener: listener))
    from.addListener(listener)
    listener.callback(obj: from.obj, prop: from.prop, oldValue: nil, newValue: from.get())
  }
  class func unfollow(from: PropertyValue, to: PropertyValue) {
    for i in 0 ..< listeners.count {
      let listener = listeners[i]
      if equals(listener.from, b: from) && equals(listener.to, b: to) {
        from.removeListener(listener.listener)
        listeners.removeAtIndex(i)
        return
      }
    }
  }
}
