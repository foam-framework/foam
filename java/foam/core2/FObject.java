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

package foam.core2;

import foam.core.Property;
import java.util.ArrayList;
import java.util.List;

public abstract class FObject implements Cloneable {
  public void set(String key, Object value) {}
  public Object get(String key) { return null; }
  public Property getProperty(String key) { return null; }
  public abstract foam.core.Model getModel();
  public List<String> validateObject() {
    List<String> errors = new ArrayList<String>();
    for (Property p : getModel().getProperties()) {
      if (p.getValidate() != null) {
        String error = p.getValidate().call(this);
        if (error != null) {
          errors.add(error);
        }
      }
    }
    return errors.size() == 0 ? null : errors;
  }
}
