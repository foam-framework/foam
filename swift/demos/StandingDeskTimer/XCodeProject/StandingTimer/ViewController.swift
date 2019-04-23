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
    view.backgroundColor = UIColor.white

    let customView = Bundle.main.loadNibNamed("CustomTimerView",
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

    view.addConstraints(NSLayoutConstraint.constraints(
        withVisualFormat: "H:|-[detailView]-|",
        options: NSLayoutConstraint.FormatOptions.init(rawValue: 0),
        metrics: nil,
        views: views))
    view.addConstraints(NSLayoutConstraint.constraints(
        withVisualFormat: "H:|-[customView]-|",
        options: NSLayoutConstraint.FormatOptions.init(rawValue: 0),
        metrics: nil,
        views: views))
    view.addConstraint(NSLayoutConstraint(
        item: detailView,
        attribute: .top,
        relatedBy: .equal,
        toItem: topLayoutGuide,
        attribute: .bottom,
        multiplier: 1,
        constant: 0))
    view.addConstraints(NSLayoutConstraint.constraints(
        withVisualFormat: "V:[detailView]-[customView]-|",
        options: NSLayoutConstraint.FormatOptions.init(rawValue: 0),
        metrics: nil,
        views: views))
    view.addConstraint(NSLayoutConstraint(
        item: detailView,
        attribute: .height,
        relatedBy: .equal,
        toItem: customView,
        attribute: .height,
        multiplier: 1,
        constant: 0))

    customView.setContentHuggingPriority(UILayoutPriority.defaultHigh, for: .vertical)
    detailView.setContentCompressionResistancePriority(
        UILayoutPriority.defaultHigh, for: .vertical)
  }
}
