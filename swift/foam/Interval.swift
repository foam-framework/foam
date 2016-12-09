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
  static func set(_ closure: @escaping () -> Void,
      interval: TimeInterval,
      queue: DispatchQueue = DispatchQueue.main) -> DispatchSource {
    let timer = DispatchSource.makeTimerSource(flags: DispatchSource.TimerFlags(rawValue: 0), queue: queue)
    let dispatchTime = UInt64(UInt64(interval * 1000.0) * NSEC_PER_MSEC)
    timer.scheduleRepeating(deadline: DispatchTime(uptimeNanoseconds: dispatchTime),
        interval: interval)
    timer.setEventHandler {
      closure()
    }
    timer.resume()
    return timer as! DispatchSource
  }

  static func clear(_ timer: DispatchSource) {
      timer.cancel()
  }
}
