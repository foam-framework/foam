/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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

import UIKit

class ViewController: UIViewController {

  lazy var timer = StandingDeskTimer()
  lazy var detailView: StandingDeskTimerDetailView = {
    let v = StandingDeskTimerDetailView()
    v.data = self.timer
    return v
  }()

  override func viewDidLoad() {
    super.viewDidLoad()
    view.backgroundColor = UIColor.whiteColor()

    let customView = NSBundle.mainBundle().loadNibNamed("CustomTimerView",
        owner: self,
        options: nil)![0] as! StandingDeskTimerDetailView
    customView.data = timer

    detailView.addAutoConstraints()

    let views: [String:UIView] = [
      "detailView": detailView,
      "customView": customView,
    ]

    for (_, v) in views {
      view.addSubview(v)
      v.translatesAutoresizingMaskIntoConstraints = false
    }

    view.addConstraints(NSLayoutConstraint.constraintsWithVisualFormat(
        "H:|-[detailView]-|",
        options: NSLayoutFormatOptions.init(rawValue: 0),
        metrics: nil,
        views: views))
    view.addConstraints(NSLayoutConstraint.constraintsWithVisualFormat(
        "H:|-[customView]-|",
        options: NSLayoutFormatOptions.init(rawValue: 0),
        metrics: nil,
        views: views))
    view.addConstraint(NSLayoutConstraint(
        item: detailView,
        attribute: .Top,
        relatedBy: .Equal,
        toItem: topLayoutGuide,
        attribute: .Bottom,
        multiplier: 1,
        constant: 0))
    view.addConstraints(NSLayoutConstraint.constraintsWithVisualFormat(
        "V:[detailView]-[customView]-|",
        options: NSLayoutFormatOptions.init(rawValue: 0),
        metrics: nil,
        views: views))
    view.addConstraint(NSLayoutConstraint(
        item: detailView,
        attribute: .Height,
        relatedBy: .Equal,
        toItem: customView,
        attribute: .Height,
        multiplier: 1,
        constant: 0))

    customView.setContentHuggingPriority(UILayoutPriorityDefaultHigh, forAxis: .Vertical)
    detailView.setContentCompressionResistancePriority(
        UILayoutPriorityDefaultHigh, forAxis: .Vertical)
  }
}
