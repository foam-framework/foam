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

import java.util.Comparator;

import foam.dao.Index;

/**
 * Fundamental interface for a FOAM Property.
 *
 * NB: A Property is a {@link Comparator} by which {@link Object}s with that Property can be
 * compared. {@link #compareValues(T,T)} can be used to compare two values of this Property from
 * different objects. Use a {@link PropertyComparator} to compare property values, eg. in an
 * {@link Index}.
 *
 * @param <T> The type of values contained in this property.
 */
public interface Property<T> extends Feature<T>, Comparator<Object>, Expression<T> {
  public void    set(Object obj, T value);
  public int     compareValues(T o1, T o2);
  public void    addListener(PropertyChangeSupport obj, PubSubListener<ValueChangeEvent<T>> listener);
  public void    removeListener(PropertyChangeSupport obj, PubSubListener<ValueChangeEvent<T>> listener);
  public Value<T> createValue(FObject obj);
  public boolean isTransient();
  public boolean isHidden();
  public String getHelp();
  public String[] getPropertyTopic();

  // Enum of the inner field type for this property. This is the fundamental element type; the type
  // number for an array is the union of the element type and the array type. Therefore arrays can
  // be checked by masking.
  int TYPE_STRING = 1;
  int TYPE_INTEGER = 2;
  int TYPE_DOUBLE = 3;
  int TYPE_FLOAT = 4;
  int TYPE_OBJECT = 5;
  int TYPE_BOOLEAN = 6;
  int TYPE_LONG = 7;
  int TYPE_ENUM = 8;
  int TYPE_ARRAY = 16384;

  int getType();
  int getElementType();
  boolean isArray();
  // public boolean hasDefaultValue();
  //  public Object  createDefaultValue);
}
