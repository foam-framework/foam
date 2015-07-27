/**
 * @license Copyright 2013 Google Inc. All Rights Reserved.
 * <p/>
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * <p/>
 * http://www.apache.org/licenses/LICENSE-2.0
 * <p/>
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package foam.core;

// TODO: make this a function tree rather than a linked list. (for performance)

import android.util.Log;

abstract class AbstractX implements X {
  private static final String LOG_TAG = "FOAM X Context";
  public Object get(String name) {
    return get(this, name);
  }

  public X put(String name, Object value) {
    return new XI(this, name, value);
  }

  public X putFactory(String name, XFactory factory) {
    return new FactoryXI(this, name, factory);
  }

  public Object newInstance(String className) {
    try {
      Class c = Class.forName(className);
      Object obj = c.newInstance();
      return obj;
    } catch(ClassNotFoundException e) {
      Log.e(LOG_TAG, "Class not found: " + className);
    } catch(InstantiationException e) {
      Log.e(LOG_TAG, "Error initializing a new " + className, e);
    } catch(IllegalAccessException e) {
      Log.e(LOG_TAG, "Could not access default constructor for " + className);
    }
    return null;
  }
}


class XI
    extends AbstractX {
  final X parent_;
  final String name_;
  final Object value_;

  XI(X parent, String name, Object value) {
    parent_ = parent;
    name_ = name;
    value_ = value;
  }

  X parent() {
    return parent_;
  }

  public Object get(X x, String name) {
    return name.equals(name_) ? value_ : parent().get(name);
  }

}


class FactoryXI extends AbstractX {
  final X parent_;
  final String name_;
  final XFactory factory_;

  FactoryXI(X parent, String name, XFactory factory) {
    parent_ = parent;
    name_ = name;
    factory_ = factory;
  }

  X parent() {
    return parent_;
  }

  public Object get(X x, String name) {
    return name.equals(name_) ?
        factory_.create(x) :
        parent().get(x, name);
  }

}


public class EmptyX extends AbstractX {
  private static X x_ = new EmptyX();

  private EmptyX() {
  }

  public static X instance() {
    return x_;
  }

  public Object get(X x, String name) {
    return null;
  }
}
