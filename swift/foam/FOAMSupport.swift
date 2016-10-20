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

public typealias ListenerCallback =
    (obj: PropertyChangeSupport, prop: String, oldValue: AnyObject?, newValue: AnyObject?) -> Void
public class PropertyChangeListener {
  var callback: ListenerCallback
  public init(callback: ListenerCallback) {
    self.callback = callback
  }
  public func fire(obj: PropertyChangeSupport, prop: String, oldValue: AnyObject?, newValue: AnyObject?) {
    callback(obj: obj, prop: prop, oldValue: oldValue, newValue: newValue)
  }
}

public class PropertyChangeSupport: NSObject {
  var listeners: [String: [PropertyChangeListener]] = [:]
  var globalListeners: [PropertyChangeListener] = []

  public func addListener(l: PropertyChangeListener?) {
    if l != nil { globalListeners.append(l!) }
  }

  public func removeListener(l: PropertyChangeListener?) {
    globalListeners = globalListeners.filter{ $0 !== l }
  }

  public func addPropertyListener(prop: String, l: PropertyChangeListener) {
    if var list = self.listeners[prop] {
      list.append(l)
      self.listeners[prop] = list
    } else {
      self.listeners[prop] = [l]
    }
  }

  public func removePropertyListener(prop: String, l: PropertyChangeListener) {
    if let list = self.listeners[prop] {
      self.listeners[prop] = list.filter { $0 !== l }
    }
  }

  public func firePropertyChangeEvent(prop: String, oldValue: AnyObject?, newValue: AnyObject?) {
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

public class Model {
  var properties: [Property]
  var name: String
  var factory: () -> FObject
  public init(name: String, properties: [Property], factory: () -> FObject) {
    self.name = name
    self.properties = properties
    self.factory = factory
  }
  public func createInstance() -> FObject {
    return factory()
  }
}

public class FObject: PropertyChangeSupport, NSCoding {
  static var nextId = 1
  lazy var UID: Int = {
    var id: Int?
    dispatch_sync(dispatch_queue_create("FObjectUIDLock", nil)) {
      id = nextId
      nextId += 1
    }
    return id!
  }()
  public init(args: [String:AnyObject?] = [:]) {
    super.init()
    for key in args.keys {
      set(key, value: args[key]!)
    }
    _foamInit_()
  }
  func _foamInit_() { }
  public func getModel() -> Model {
    fatalError("Called getModel on FObject directly")
  }
  public func get(key: String) -> AnyObject? { return nil }
  public func set(key: String, value: AnyObject?) -> FObject { return self }
  public func getProperty(key: String) -> Property? { return nil }
  public func getPropertyValue(key: String) -> PropertyValue? { return nil }
  public func hasOwnProperty(key: String) -> Bool { return false }
  public func clearProperty(key: String) -> FObject { return self }
  public func copyFrom(data: AnyObject?, deep: Bool = false) {
    if let fobj = data as? FObject {
      for fobjProp in fobj.getModel().properties {
        if !fobj.hasOwnProperty(fobjProp.name) { continue }
        let v: AnyObject? = fobj.get(fobjProp.name)
        if (v is FObject) && deep {
          self.set(fobjProp.name, value: v!.deepClone())
        } else if (v is [FObject]) && deep {
          var clonedArray: [FObject] = []
          for fobjArrayValue in v as! [FObject] {
            clonedArray.append(fobjArrayValue.deepClone())
          }
          self.set(fobjProp.name, value: clonedArray)
        } else {
          self.set(fobjProp.name, value: v)
        }
      }
    }
  }
  // Returns nil if no errors occurred. Otherwise, returns an array of error messages.
  public func validateObject() -> [String]? {
    var ret: [String]? = nil
    for p in getModel().properties {
      let err = getProperty(p.name)?.validate?.call(self) as? String
      if err != nil {
        if ret == nil { ret = [] }
        ret!.append(err!)
      }
    }
    return ret
  }
  public func compareTo(data: FObject?) -> Int {
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
  override public func isEqual(object: AnyObject?) -> Bool {
    if let fdata = object as? FObject {
      return self.compareTo(fdata) == 0
    }
    return false
  }
  public func clone() -> FObject {
    let obj = getModel().createInstance()
    obj.copyFrom(self)
    return obj
  }
  public func deepClone() -> FObject {
    let obj = getModel().createInstance()
    obj.copyFrom(self, deep: true)
    return obj
  }
  // MARK: NSCoding
  // Subclasses should override these.
  public func encodeWithCoder(aCoder: NSCoder) { }
  required public init(coder aDecoder: NSCoder) { }
}

public protocol Value : class {
  func get() -> AnyObject?
  func set(value: AnyObject?)
  func addListener(l: PropertyChangeListener?)
  func removeListener(l: PropertyChangeListener?)
}

public class PropertyValue: Value {
  var obj: FObject
  var prop: String

  public init(obj: FObject, prop: String) {
    self.obj = obj
    self.prop = prop
  }

  public func get() -> AnyObject? {
    return obj.get(prop)
  }

  public func set(value: AnyObject?) {
    obj.set(prop, value: value)
  }

  public func addListener(l: PropertyChangeListener?) {
    if l != nil { obj.addPropertyListener(prop, l: l!) }
  }

  public func removeListener(l: PropertyChangeListener?) {
    if l != nil { obj.removePropertyListener(prop, l: l!) }
  }
}

public func equals(a: AnyObject?, b: AnyObject?) -> Bool {
  if a === b { return true }
  if a != nil { return a!.isEqual(b) }
  return false
}
