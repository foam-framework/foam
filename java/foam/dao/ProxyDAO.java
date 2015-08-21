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

import java.util.Comparator;

import foam.core.Expression;
import foam.core.FObject;
import foam.core.X;

public class ProxyDAO
  extends AbstractDAO
{
  protected DAO delegate_;

  public ProxyDAO(DAO delegate) {
    super(delegate.getModel());

    setDelegate(delegate);
  }

  public DAO getDelegate() {
    return delegate_;
  }

  public void setDelegate(DAO delegate) {
    delegate_ = delegate;
  }

  public FObject find(X x, Object where)
    throws DAOException, DAOInternalException
  {
    return getDelegate().find(x, where);
  }

  public FObject put(X x, FObject obj)
    throws DAOException, DAOInternalException
  {
    return getDelegate().put(x, obj);
  }

  public void remove(X x, FObject obj)
    throws DAOException, DAOInternalException
  {
    getDelegate().remove(x, obj);
  }

  public Sink select_(X x, Sink sink, Expression<Boolean> p, Comparator c, long skip, long limit)
    throws DAOException, DAOInternalException
  {
    return getDelegate().select_(x, sink, p, c, skip, limit);
  }

  public void removeAll_(X x, Expression<Boolean> p)
    throws DAOException, DAOInternalException
  {
    getDelegate().removeAll_(x, p);
  }

}
