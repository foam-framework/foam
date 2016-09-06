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

public abstract class FObject implements Cloneable, Comparable, java.io.Serializable {
  public void set(String key, Object value) {}
  public void clearProperty(String key) {}
  public Object get(String key) { return null; }
  public Property getProperty(String key) { return null; }
  public boolean hasOwnProperty(String key) { return false; }
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
  public void copyFrom(Object data, boolean deep) {
    if (data instanceof FObject) {
      FObject fobj = (FObject) data;
      for (Property fobjProp : fobj.getModel().getProperties()) {
        if (!fobj.hasOwnProperty(fobjProp.getName())) continue;
        Object v = fobj.get(fobjProp.getName());
        if ((v instanceof FObject) && deep) {
          set(fobjProp.getName(), ((FObject) v).deepClone());
        } else if ((v instanceof List) && deep) {
          List clonedArray = new java.util.ArrayList();
          for (Object obj : (List) v) {
            if (obj instanceof FObject) {
              clonedArray.add(((FObject) obj).deepClone());
            } else {
              clonedArray.add(obj);
            }
          }
          set(fobjProp.getName(), clonedArray);
        } else {
          set(fobjProp.getName(), v);
        }
      }
    }
  }
  public void copyFrom(Object data) {
    copyFrom(data, false);
  }
  public FObject deepClone() {
    return clone(true);
  }
  public FObject clone() {
    return clone(false);
  }
  public FObject clone(boolean deep) {
    FObject fobj = getModel().createInstance();
    fobj.copyFrom(this, deep);
    return fobj;
  }
  public boolean equals(Object data) {
    return compareTo(data) == 0;
  }
  public int compareTo(Object data) {
    if (this == data) return 0;
    if (data == null) return 1;
    if (!(data instanceof FObject)) return 1;
    FObject fdata = (FObject) data;
    if (getModel() != fdata.getModel()) {
      return getModel().getName().compareTo(fdata.getModel().getName());
    }
    for (Property prop : getModel().getProperties()) {
      int diff = prop.compare(this, fdata);
      if (diff != 0) {
        return diff;
      }
    }
    return 0;
  }
}
