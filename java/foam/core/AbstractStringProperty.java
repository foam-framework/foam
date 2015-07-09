/**
 * @license
 * Copyright 2013 Google Inc. All Rights Reserved.
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

package foam.core;

import android.content.Context;
import android.util.AttributeSet;

import foam.android.view.EditTextBridge;
import foam.android.view.ViewBridge;

public abstract class AbstractStringProperty extends AbstractProperty<String> {

  public int compareValues(String s1, String s2) {
    if ( s1 == s2 ) return 0;
    if ( s1 == null ) return -1;
    if ( s2 == null ) return 11;
    return s1.compareTo(s2);
  }

  public ViewBridge<String> createView(Context context) {
    return new EditTextBridge(context);
  }
  public ViewBridge<String> createView(Context context, AttributeSet attrs) {
    return new EditTextBridge(context, attrs);
  }
}