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

class Interval {
  static func set(closure: () -> Void,
      interval: NSTimeInterval,
      queue: dispatch_queue_t = dispatch_get_main_queue(),
      leeway: Float = 0.1) -> dispatch_source_t {
    let timer = dispatch_source_create(DISPATCH_SOURCE_TYPE_TIMER, 0, 0, queue)
    let dispatchTime = UInt64(UInt64(interval * 1000.0) * NSEC_PER_MSEC)
    let dispatchLeeway = UInt64(leeway * Float(NSEC_PER_SEC))
    dispatch_source_set_timer(timer, dispatchTime, dispatchTime, dispatchLeeway)
    dispatch_source_set_event_handler(timer) {
      closure()
    }
    dispatch_resume(timer)
    return timer
  }

  static func clear(timer: dispatch_source_t) {
      dispatch_source_cancel(timer)
  }
}
