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

public abstract class AbstractProperty<T> implements Property<T> {
  @Override
  public T f(Object o) { return get(o); }

  @Override
  public Expression<T> partialEval() {
    return this;
  }

  @Override
  public Value<T> createValue(FObject obj) {
    return new PropertyValue<T>(obj, this);
  }

  @Override
  public void addListener(PropertyChangeSupport obj, PubSubListener<ValueChangeEvent<T>> listener) {
    obj.addPropertyChangeListener(this, listener);
  }

  @Override
  public void removeListener(PropertyChangeSupport obj, PubSubListener<ValueChangeEvent<T>> listener) {
    obj.removePropertyChangeListener(this, listener);
  }

  @Override
  public boolean isHidden() {
    return false;
  }

  @Override
  public boolean isTransient() {
    return false;
  }

  @Override
  public String getHelp() {
    return null;
  }

  private String[] topic;

  @Override
  public String[] getPropertyTopic() {
    if (topic == null) topic = new String[] { "property", getName() };
    return topic;
  }

  @Override
  public int getElementType() {
    return getType() & ~(Property.TYPE_ARRAY);
  }

  @Override
  public boolean isArray() {
    return (getType() & Property.TYPE_ARRAY) != 0;
  }

  @Override
  public int compare(Object o1, Object o2) {
    return compareValues(get(o1), get(o2));
  }
}
