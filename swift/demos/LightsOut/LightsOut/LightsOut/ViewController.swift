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

  @IBOutlet var detailView: LightsOutDetailView! {
    didSet {
      if self.detailView != nil {
        self.detailView!.data = self.lightsOut
        self.detailView?.addAutoConstraints()
      }
    }
  }

  @IBOutlet weak var scrollView: UIScrollView!

  lazy var lightsOut = Game()

  override func viewDidLoad() {
    super.viewDidLoad()

    NotificationCenter.default.addObserver(
        self,
        selector: #selector(ViewController.keyboardWillShow(_:)),
        name: UIResponder.keyboardWillShowNotification,
        object: nil)

    NotificationCenter.default.addObserver(
        self,
        selector: #selector(ViewController.keyboardWillHide(_:)),
        name: UIResponder.keyboardWillHideNotification,
        object: nil)

    scrollView.keyboardDismissMode = .onDrag
  }
    
  @objc func keyboardWillShow(_ notification: Notification) {
    let userInfo = notification.userInfo!
    let keyboardSize = (userInfo[UIResponder.keyboardFrameEndUserInfoKey] as! NSValue).cgRectValue
    let contentInsets = UIEdgeInsets(top: 0.0, left: 0.0, bottom: keyboardSize.height, right: 0.0)
    scrollView.contentInset = contentInsets
    scrollView.scrollIndicatorInsets = contentInsets
  }
    
  @objc func keyboardWillHide(_ notification: Notification) {
    let contentInsets = UIEdgeInsets.zero
    scrollView.contentInset = contentInsets
    scrollView.scrollIndicatorInsets = contentInsets
  }
}

