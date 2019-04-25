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
    (_ obj: PropertyChangeSupport, _ prop: String, _ oldValue: AnyObject?, _ newValue: AnyObject?) -> Void
open class PropertyChangeListener {
  var callback: ListenerCallback
  public init(callback: @escaping ListenerCallback) {
    self.callback = callback
  }
  open func fire(_ obj: PropertyChangeSupport, prop: String, oldValue: AnyObject?, newValue: AnyObject?) {
    callback(obj, prop, oldValue, newValue)
  }
}

open class PropertyChangeSupport: NSObject {
  var listeners: [String: [PropertyChangeListener]] = [:]
  var globalListeners: [PropertyChangeListener] = []

  open func addListener(_ l: PropertyChangeListener?) {
    if l != nil { globalListeners.append(l!) }
  }

  open func removeListener(_ l: PropertyChangeListener?) {
    globalListeners = globalListeners.filter{ $0 !== l }
  }

  open func addPropertyListener(_ prop: String, l: PropertyChangeListener) {
    if var list = self.listeners[prop] {
      list.append(l)
      self.listeners[prop] = list
    } else {
      self.listeners[prop] = [l]
    }
  }

  open func removePropertyListener(_ prop: String, l: PropertyChangeListener) {
    if let list = self.listeners[prop] {
      self.listeners[prop] = list.filter { $0 !== l }
    }
  }

  open func firePropertyChangeEvent(_ prop: String, oldValue: AnyObject?, newValue: AnyObject?) {
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

open class Model {
  var properties: [Property]
  var name: String
  var factory: () -> FObject
  public init(name: String, properties: [Property], factory: @escaping () -> FObject) {
    self.name = name
    self.properties = properties
    self.factory = factory
  }
  open func createInstance() -> FObject {
    return factory()
  }
}

open class FObject: PropertyChangeSupport, NSCoding {
  static var nextId = 1
  lazy var UID: Int = {
    var id: Int?
    DispatchQueue(label: "FObjectUIDLock", attributes: []).sync {
      id = FObject.nextId
      FObject.nextId += 1
    }
    return id!
  }()
  public convenience override init() {
    self.init(args: [:])
  }
  public init(args: [String:AnyObject?] = [:]) {
    super.init()
    for key in args.keys.sorted() {
      _ = set(key, value: args[key]!)
    }
    _foamInit_()
  }
  func _foamInit_() { }
  open func getModel() -> Model {
    fatalError("Called getModel on FObject directly")
  }
  open func get(_ key: String) -> AnyObject? { return nil }
  @discardableResult
  open func set(_ key: String, value: AnyObject?) -> FObject { return self }
  open func getProperty(_ key: String) -> Property? { return nil }
  open func getPropertyValue(_ key: String) -> PropertyValue? { return nil }
  open func hasOwnProperty(_ key: String) -> Bool { return false }
  @discardableResult
  open func clearProperty(_ key: String) -> FObject { return self }
  open func copyFrom(_ data: AnyObject?, deep: Bool = false) {
    if let fobj = data as? FObject {
      for fobjProp in fobj.getModel().properties {
        if !fobj.hasOwnProperty(fobjProp.name) { continue }
        let v: AnyObject? = fobj.get(fobjProp.name)
        if let fv = v as? FObject, deep {
          _ = self.set(fobjProp.name, value: fv.deepClone())
        } else if (v is [FObject]) && deep {
          var clonedArray: [FObject] = []
          for fobjArrayValue in v as! [FObject] {
            clonedArray.append(fobjArrayValue.deepClone())
          }
          _ = self.set(fobjProp.name, value: clonedArray as AnyObject?)
        } else {
          _ = self.set(fobjProp.name, value: v)
        }
      }
    }
  }
  // Returns nil if no errors occurred. Otherwise, returns an array of error messages.
  open func validateObject() -> [String]? {
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
  open func compareTo(_ data: FObject?) -> Int {
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
  override open func isEqual(_ object: Any?) -> Bool {
    if let fdata = object as? FObject {
      return self.compareTo(fdata) == 0
    }
    return false
  }
  open func clone() -> FObject {
    let obj = getModel().createInstance()
    obj.copyFrom(self)
    return obj
  }
  open func deepClone() -> FObject {
    let obj = getModel().createInstance()
    obj.copyFrom(self, deep: true)
    return obj
  }
  // MARK: NSCoding
  // Subclasses should override these.
  open func encode(with aCoder: NSCoder) { }
  required public init(coder aDecoder: NSCoder) { }
}

public protocol Value : class {
  func get() -> AnyObject?
  func set(_ value: AnyObject?)
  func addListener(_ l: PropertyChangeListener?)
  func removeListener(_ l: PropertyChangeListener?)
}

open class PropertyValue: Value {
  var obj: FObject
  var prop: String

  public init(obj: FObject, prop: String) {
    self.obj = obj
    self.prop = prop
  }

  open func get() -> AnyObject? {
    return obj.get(prop)
  }

  open func set(_ value: AnyObject?) {
    _ = obj.set(prop, value: value)
  }

  open func addListener(_ l: PropertyChangeListener?) {
    if l != nil { obj.addPropertyListener(prop, l: l!) }
  }

  open func removeListener(_ l: PropertyChangeListener?) {
    if l != nil { obj.removePropertyListener(prop, l: l!) }
  }
}

public func equals(_ a: AnyObject?, b: AnyObject?) -> Bool {
  if a === b { return true }
  if a != nil { return a!.isEqual(b) }
  return false
}
