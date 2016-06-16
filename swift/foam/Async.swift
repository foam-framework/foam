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

public class Future {
  var set: Bool = false
  var value: AnyObject?
  var waiters: Array<(AnyObject?) -> Void> = []
  public func get(callback: (AnyObject?) -> Void) {
    if set {
      callback(value)
    } else {
      waiters.append(callback)
    }
  }
  public func set(value: AnyObject?) -> Future {
    self.value = value
    set = true
    for callback in waiters {
      callback(value)
    }
    waiters.removeAll(keepCapacity: false)
    return self
  }
}

public typealias AFunc = ((AnyObject?) -> Void, AnyObject?) -> Void

public func Par(funcs: [AFunc]) -> AFunc {
  return { (ret: (AnyObject?) -> Void, args: AnyObject?) in
    var numCompleted = 0
    let returnValues: NSMutableArray = NSMutableArray(capacity: funcs.count)
    for i in 0...funcs.count-1 {
      returnValues.insertObject(0, atIndex: i)
      let f = funcs[i]
      f({ data in
        if let data = data as AnyObject! {
          returnValues.replaceObjectAtIndex(i, withObject: data)
        }
        numCompleted += 1
        if numCompleted == funcs.count {
          ret(returnValues)
        }
      }, args)
    }
  }
}

public func Seq(funcs: [AFunc]) -> AFunc {
  return { (ret: (AnyObject?) -> Void, args: AnyObject?) in
    var i = 0
    var next: ((AnyObject?) -> Void)!
    next = { d in
      let f = funcs[i]
      f({ d2 in
        i += 1
        if i == funcs.count {
          ret(d2)
        } else {
          next(d2)
        }
      }, d)
    }
    next(args)
  }
}

public func While(cond: () -> Bool, afunc: AFunc) -> AFunc {
  return { (ret: (AnyObject?) -> Void, args: AnyObject?) in
    var next: ((AnyObject?) -> Void)!
    next = { d in
      if !cond() {
        ret(args)
        return
      }
      afunc(next, args)
    }
    next(args)
  }
}

public func Delay(delay: NSTimeInterval,
    queue: dispatch_queue_t = dispatch_get_main_queue(),
    afunc: AFunc = { ret, _ in ret(nil) }) -> AFunc {
  return { (ret: (AnyObject?) -> Void, args: AnyObject?) in
    dispatch_after(
        dispatch_time(DISPATCH_TIME_NOW, Int64(UInt64(delay * 1000.0) * NSEC_PER_MSEC)),
        queue,
        { () -> Void in afunc(ret, args) })
  }
}
