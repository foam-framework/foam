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
import foam.core.Model;
import foam.core.X;


// TODO:  Abstract for now, so the code will compile.
// Need to finish the implementation of MDAO.
public class MDAO extends AbstractDAO {
  protected Index  index_;
  protected Object root_ = null;

  public MDAO(Model model) {
    super(model);

    index_ = new TreeIndex(model.getID());
  }

  // TODO: addIndex()

  public FObject put(X x, FObject obj) throws DAOException, DAOInternalException {
    FObject oldValue = find_(x, obj.model().getID().get(obj));

    FObject cloned = obj.fclone();
    cloned.freeze();

    if ( oldValue != null ) {
      root_ = index_.put(index_.remove(root_, oldValue), cloned);
    } else {
      root_ = index_.put(root_, cloned);
    }

    return cloned;
  }

  public void remove(X x, FObject obj) throws DAOException, DAOInternalException {
    root_ = index_.remove(root_, obj);
  }

  public FObject find(X x, Object where) throws DAOException, DAOInternalException {
    FObject ret = find_(x, where);
    return ret.fclone();
  }

  public FObject find_(X x, Object where) throws DAOException, DAOInternalException {
    return super.find(x, where);
  }

  public Sink select_(X x, Sink sink, Expression<Boolean> p, Comparator c, long skip, long limit)
      throws DAOException, DAOInternalException {
    Plan plan = index_.plan(root_, sink, p, c, skip, limit);
    plan.execute(x, root_, sink, p, c, skip, limit);
    return sink;
  }
}
