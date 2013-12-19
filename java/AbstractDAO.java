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

import java.lang.Iterable;
import java.util.Collections;
import java.util.Comparator;
import java.util.Iterator;
import java.util.NoSuchElementException;


public abstract class AbstractDAO
  implements DAO
{
  final Model model_;
  
  public AbstractDAO(Model model)
  {
    model_ = model;
  }
  
  public Model getModel()
  {
    return model_;
  }

  public Object find(X x, Object where)
    throws DAOException, DAOInternalException
  {
    FindSink s = new FindSink();

    this.limit(1).select(x, s);

    return s.getValue();
  }
  
  public void remove(X x, Object obj)
    throws DAOException, DAOInternalException
  {
    // Note: remove() is implemented using removeAll() and removeAll() is
    // implemented using remove(), so DAO implementers need to implement
    // at least one of the methods to avoid infinite recursion.

    // TODO: uncomment when EQ available
    // this.limit(1).removeAll(EQ(model_.getID(), model_.getID().get(obj)));
  }

  public Sink select(X x, Sink sink)
    throws DAOException, DAOInternalException
  {
    return select_(x, sink, null, null, 0, -1);
  }
  
  
  public void removeAll(X x)
    throws DAOException, DAOInternalException
  {
    removeAll_(x, null);
  }
  

  public void removeAll_(X x, Predicate p)
    throws DAOException, DAOInternalException
  {
    select_(x, new RemoveSink(this), p, null, 0, -1); 
  }
  
  
  /*****************************/
  
  public DAO where(Predicate p)
  {
    return new PredicatedDAO(p, this);
  }
  
  
  public DAO limit(long i)
  {
    return new LimitedDAO(i, this);
  }
  
  
  public DAO skip(long i)
  {
    return new SkipDAO(i, this);
  }
  
  
  /*****************************/
  
  public void listen(DAOListener listener)
  {
    throw new UnsupportedOperationException("listen");
  }
  
  
  public void unlisten(DAOListener listener)
  {
    throw new UnsupportedOperationException("unlisten");
  }
  
  
  public void pipe(DAOListener listener)
    throws DAOException, DAOInternalException
  {
    // TODO:  Create an EmptyX?  Allow a supplied X?
    // KGR: We'll have to add X as a parameter to pipe() and listen(), but we don't need
    // to do it until we have authentication
    select(null, listener);
    listen(listener);
  }
  
}
