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

import java.util.HashMap;
import java.util.Map;

public abstract class AbstractModel
  implements Model
{
  final Property[]            properties_;
  final Relationship[]        relationships_;
  final Map<String, Property> pMap_ = new HashMap<>();
  final Map<String, Relationship> rMap_ = new HashMap<>();
  final Model parent_;

  public AbstractModel(Property[] properties, Relationship[] relationships) {
    this(null, properties, relationships);
  }

  public AbstractModel(Model parent, Property[] properties, Relationship[] relationships) {
    parent_ = parent;
    properties_ = properties;
    relationships_ = relationships;
    for ( Property p : properties ) {
      pMap_.put(p.getName(), p);
    }
    for (Relationship r : relationships) {
      rMap_.put(r.getName(), r);
    }
  }

  public Model getParent() {
    return parent_;
  }

  public Property[] getProperties()
  {
    return properties_;
  }

  public Property getProperty(String propertyName)
  {
    Property p = pMap_.get(propertyName);
    if (p == null && parent_ != null) p = parent_.getProperty(propertyName);
    return p;
  }

  public Relationship[] getRelationships() {
    return relationships_;
  }

  public Relationship getRelationship(String name) {
    return rMap_.get(name);
  }

  public Feature getFeature(String name) {
    Feature f = pMap_.get(name);
    if (f == null) f = rMap_.get(name);
    return f;
  }
}
