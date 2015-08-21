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

import java.io.Serializable;

public abstract class AbstractFObject extends PubSubSource implements FObject, Serializable {
  private static final String[] EMPTY_PROPERTY_TOPIC = new String[] { "property", PubSubSource.ANY };

  private boolean frozen = false;

  public int compare(boolean o1, boolean o2) {
    return o1 == o2 ? 0 : o1 ? 1 : 0;
  }

  public int compare(String o1, String o2) {
    return o1 == o2 ? 0 : o1 == null ? -1 : o2 == null ? 1 : o1.compareTo(o2);
  }

  public int compare(short o1, short o2) {
    return o1 == o2 ? 0 : o1 < o2 ? -1 : 1;
  }

  public int compare(int o1, int o2) {
    return o1 == o2 ? 0 : o1 < o2 ? -1 : 1;
  }

  public int compare(long o1, long o2) {
    return o1 == o2 ? 0 : o1 < o2 ? -1 : 1;
  }

  public int compare(float o1, float o2) {
    return o1 == o2 ? 0 : o1 < o2 ? -1 : 1;
  }

  public int compare(double o1, double o2) {
    return o1 == o2 ? 0 : o1 < o2 ? -1 : 1;
  }

  public int compare(Object o1, Object o2) {
    if (o1 instanceof FObject && o2 instanceof FObject) {
      FObject f1 = (FObject) o1;
      FObject f2 = (FObject) o2;
      if (!f1.model().equals(f2.model())) {
        // Hack that gives unstable order  for non-identical models with the same
        // name. Since that shouldn't happen, this shouldn't cause a problem.
        int c = f1.model().getName().compareTo(f2.model().getName());
        return c == 0 ? 1 : c;
      } else {
        // Compare each of the properties, in order.
        Property[] props = f1.model().getProperties();
        for (Property p : props) {
          int c = p.compare(f1, f2);
          if (c != 0) return c;
        }
        return 0;
      }
    } else if (o1 instanceof FObject) {
      return -1;
    } else {
      return 1;
    }
  }


  public int hash(boolean b) {
    return b ? 1 : 0;
  }

  public int hash(String s) {
    return s == null ? 0 : s.hashCode();
  }

  public int hash(short s) {
    return s;
  }

  public int hash(int i) {
    return i;
  }

  public int hash(long l) {
    return (int) (l ^ (l >>> 32));
  }

  public int hash(float f) {
    return hash(Float.floatToIntBits(f));
  }

  public int hash(double d) {
    return hash(Double.doubleToLongBits(d));
  }

  public int hash(Object o) {
    return o == null ? 0 : o.hashCode();
  }


  public int compareTo(Object other) {
    return compare(this, other);
  }

  public boolean equals(Object o) {
    return compareTo(o) == 0;
  }

  @Override
  public abstract int hashCode();

  public abstract StringBuilder append(StringBuilder sb);

  public String toString() {
    StringBuilder sb = new StringBuilder();
    append(sb);
    return sb.toString();
  }

  public StringBuilder appendToJSON(StringBuilder b) {
    b.append("{");
    b.append("model_:\"");
    b.append(model().getName());
    b.append("\"");
    for (Property p : model().getProperties()) {
      // TODO: do not output default values
      if (p.isTransient()) continue;
      b.append(",");
      b.append(p.getName());
      b.append(":");
      b.append(p.get(this)); // TODO: escape propertly, maybe p.toJSON()
    }
    b.append("}");
    return b;
  }

  public String toJSON() {
    StringBuilder sb = new StringBuilder();
    appendToJSON(sb);
    return sb.toString();
  }


  public <T> void addPropertyChangeListener(Property<T> prop, PubSubListener<ValueChangeEvent<T>> listener) {
    if (isFrozen()) return;
    if (prop == null) subscribe(EMPTY_PROPERTY_TOPIC, listener);
    else subscribe(prop.getPropertyTopic(), listener);
  }

  public <T> void removePropertyChangeListener(Property<T> prop, PubSubListener<ValueChangeEvent<T>> listener) {
    if (prop == null) unsubscribe(EMPTY_PROPERTY_TOPIC, listener);
    else unsubscribe(prop.getPropertyTopic(), listener);
  }

  public <T> void firePropertyChange(Property<T> prop, T oldValue, T newValue) {
    publish(prop.getPropertyTopic(), new PropertyChangeEvent<T>(this, prop, oldValue, newValue));
  }


  public void freeze() {
    frozen = true;
    unsubscribeAll();
  }

  public boolean isFrozen() {
    return frozen;
  }
}
