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
import java.util.Map;
import java.util.TreeMap;

public class TreeIndex
  implements Index
{
  final Property prop_;
  
  public TreeIndex(Property p) 
  {
    prop_ = p;
  }


  public Object put(Object state, Object value)
  {
    if ( state == null ) state = new TreeMap(prop_);

    ((Map) state).put(prop_.get(value), value);

    return state;
  }

  public Object remove(Object state, Object value)
  {
    if ( state != null ) {
      ((Map) state).remove(prop_.get(value));

      if ( size(state) == 0 ) state = null;
    }

    return state;
  }
  
  public Plan plan(Object state, Sink sink, Predicate p, Comparator c, long skip, long limit)
  {
    return new Plan() {
      public long cost() { return 1; }
      public String toString() { return "Tree Plan"; }
      public void execute(X x, Object state, Sink sink, Predicate p, Comparator c, long skip, long limit)
        throws DAOException, DAOInternalException
      {
        if ( state == null ) return;

        Map map = (Map) state;

        Iterable i = IterableSelectHelper.decorate((Iterable<Object>) map, p, (Comparator<Object>)c, skip, limit);
        for ( Object o : i ) {
          sink.put(null, o);
        }
      }
    };
  }

  public long size(Object state)
  {
    return state != null ? ((Map) state).size() : 0l;
  }

}
