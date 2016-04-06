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

import Foundation

func labelize(value: String) -> String {
  // TODO
  return value
}

typealias ListenerCallback =
    (obj: PropertyChangeSupport, prop: String, oldValue: AnyObject?, newValue: AnyObject?) -> Void
class PropertyChangeListener {
  var callback: ListenerCallback
  init(callback: ListenerCallback) {
    self.callback = callback
  }
  func fire(obj: PropertyChangeSupport, prop: String, oldValue: AnyObject?, newValue: AnyObject?) {
    callback(obj: obj, prop: prop, oldValue: oldValue, newValue: newValue)
  }
}

class PropertyChangeSupport: NSObject {
  var listeners: [String: [PropertyChangeListener]] = [:]
  var globalListeners: [PropertyChangeListener] = []

  func addListener(l: PropertyChangeListener?) {
    if l != nil { globalListeners.append(l!) }
  }

  func removeListener(l: PropertyChangeListener?) {
    globalListeners = globalListeners.filter{ $0 !== l }
  }

  func addPropertyListener(prop: String, l: PropertyChangeListener) {
    if var list = self.listeners[prop] {
      list.append(l)
      self.listeners[prop] = list
    } else {
      self.listeners[prop] = [l]
    }
  }

  func removePropertyListener(prop: String, l: PropertyChangeListener) {
    if let list = self.listeners[prop] {
      self.listeners[prop] = list.filter { $0 !== l }
    }
  }

  func firePropertyChangeEvent(prop: String, oldValue: AnyObject?, newValue: AnyObject?) {
    for listener in globalListeners {
      listener.fire(self, prop: prop, oldValue: oldValue, newValue: newValue)
    }
    if let list = listeners[prop] {
      for listener in list {
        listener.fire(self, prop: prop, oldValue: oldValue, newValue: newValue)
      }
    }
  }
}

class Model {
  var properties: [Property]
  var name: String
  var factory: () -> FObject
  init(name: String, properties: [Property], factory: () -> FObject) {
    self.name = name
    self.properties = properties
    self.factory = factory
  }
  func createInstance() -> FObject {
    return factory()
  }
}

class FObject: PropertyChangeSupport, NSCoding {
  init(args: [String:AnyObject?] = [:]) {
    super.init()
    for key in args.keys {
      set(key, value: args[key]!)
    }
    _foamInit_()
  }
  func _foamInit_() { }
  override init() { }
  func getModel() -> Model {
    fatalError("Called getModel on FObject directly")
  }
  func get(key: String) -> AnyObject? { return nil }
  func set(key: String, value: AnyObject?) -> FObject { return self }
  func getProperty(key: String) -> Property? { return nil }
  func getPropertyValue(key: String) -> PropertyValue? { return nil }
  func clearProperty(key: String) -> FObject { return self }
  func copyFrom(data: AnyObject?, deep: Bool = false) {
    if let fobj = data as? FObject {
      for fobjProp in fobj.getModel().properties {
        let v: AnyObject? = fobj.get(fobjProp.name)
        if v is FObject && deep {
          self.set(fobjProp.name, value: v!.deepClone())
        } else {
          self.set(fobjProp.name, value: v)
        }
      }
    }
  }
  // Returns nil if no errors occurred. Otherwise, returns an array of error messages.
  func validateObject() -> [String]? {
    var ret: [String]? = nil
    for p in getModel().properties {
      let err = getProperty(p.name)?.swiftValidate?.call(self) as? String
      if err != nil {
        if ret == nil { ret = [] }
        ret!.append(err!)
      }
    }
    return ret
  }
  func compareTo(data: FObject?) -> Int {
    if self === data { return 0 }
    if data == nil { return 1 }
    if self.getModel() !== data!.getModel() {
      return self.getModel().name > data!.getModel().name ? 1 : -1
    }
    for props in self.getModel().properties {
      let diff = props.compare(self, o2: data)
      if diff != 0 { return diff }
    }
    return 0
  }
  override func isEqual(object: AnyObject?) -> Bool {
    if let fdata = object as? FObject {
      return self.compareTo(fdata) == 0
    }
    return false
  }
  func clone() -> FObject {
    let obj = getModel().createInstance()
    obj.copyFrom(self)
    return obj
  }
  func deepClone() -> FObject {
    let obj = getModel().createInstance()
    obj.copyFrom(self, deep: true)
    return obj
  }
  // MARK: NSCoding
  // Subclasses should override these.
  func encodeWithCoder(aCoder: NSCoder) { }
  required init(coder aDecoder: NSCoder) { }
}

protocol Value : class {
  func get() -> AnyObject?
  func set(value: AnyObject?)
  func addListener(l: PropertyChangeListener?)
  func removeListener(l: PropertyChangeListener?)
}

class PropertyValue: Value {
  var obj: FObject
  var prop: String

  init(obj: FObject, prop: String) {
    self.obj = obj
    self.prop = prop
  }

  func get() -> AnyObject? {
    return obj.get(prop)
  }

  func set(value: AnyObject?) {
    obj.set(prop, value: value)
  }

  func addListener(l: PropertyChangeListener?) {
    if l != nil { obj.addPropertyListener(prop, l: l!) }
  }

  func removeListener(l: PropertyChangeListener?) {
    if l != nil { obj.removePropertyListener(prop, l: l!) }
  }
}

func equals(a: AnyObject?, b: AnyObject?) -> Bool {
  if a === b { return true }
  if a != nil { return a!.isEqual(b) }
  return false
}
