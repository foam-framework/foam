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

import foam.android.core.AttributeUtils;
import foam.android.view.EditIntBridge;
import foam.android.view.IntViewBridge;
import foam.android.view.ViewBridge;

public abstract class AbstractIntProperty extends AbstractProperty<Integer> {
  public int compareValues(Integer i1, Integer i2) {
    return i1 - i2;
  }

  public ViewBridge<Integer> createView(Context context) {
    return new EditIntBridge(context);
  }
  public ViewBridge<Integer> createView(Context context, AttributeSet attrs) {
    return AttributeUtils.findBoolean(attrs, "read_only", false) ?
        new IntViewBridge(context, attrs) : new EditIntBridge(context, attrs);
  }
}