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
  Property[]            properties_;
  Map<String, Property> pMap_ = new HashMap<String, Property>();

  void setProperties(Property[] properties) {
    properties_ = properties;
    for ( Property p : properties ) pMap_.put(p.getName(), p);
  }

  public Property[] getProperties()
  {
    return properties_;
  }

  public Property getProperty(String propertyName)
  {
    return pMap_.get(propertyName);
  }

}