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

package foam.dao;

import java.util.LinkedList;
import java.util.List;

import foam.core.Expression;
import foam.core.FObject;
import foam.core.Model;
import foam.core.X;

public abstract class AbstractDAO implements DAO {
  protected static final int NOTIFY_PUT = 1;
  protected static final int NOTIFY_REMOVE = 2;

  final Model model_;
  private final List<DAOListener> listeners_ = new LinkedList<>();
  
  public AbstractDAO(Model model) {
    model_ = model;
  }
  
  public Model getModel() {
    return model_;
  }

  @Override
  public FObject find(X x, Object where)
    throws DAOException, DAOInternalException
  {
    FindSink s = new FindSink();

    this.where(MLang.EQ(model_.getID(), where)).limit(1).select(x, s);

    return s.getValue();
  }
  
  public void remove(X x, Object obj)
    throws DAOException, DAOInternalException
  {
    // Note: remove() is implemented using removeAll() and removeAll() is
    // implemented using remove(), so DAO implementers need to implement
    // at least one of the methods to avoid infinite recursion.

    this.where(MLang.EQ(model_.getID(), model_.getID().get(obj))).limit(1).removeAll(x);
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
  

  public void removeAll_(X x, Expression<Boolean> p) throws DAOException, DAOInternalException {
    select_(x, new RemoveSink(this), p, null, 0, -1);
  }
  
  
  /*****************************/
  
  public DAO where(Expression<Boolean> p)
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
  
  public void listen(DAOListener listener) {
    listeners_.add(listener);
  }

  public void unlisten(DAOListener listener) {
    listeners_.remove(listener);
  }

  public void pipe(DAOListener listener) throws DAOException, DAOInternalException {
    // TODO:  Create an EmptyX?  Allow a supplied X?
    // KGR: We'll have to add X as a parameter to pipe() and listen(), but we don't need
    // to do it until we have authentication
    select(null, listener);
    listen(listener);
  }

  protected void notify_(int type, X x, FObject obj) throws DAOException, DAOInternalException {
    if (type == NOTIFY_PUT) {
      for (DAOListener l : listeners_) l.put(x, obj);
    } else if (type == NOTIFY_REMOVE) {
      for (DAOListener l : listeners_) l.remove(x, obj);
    }
  }
}
