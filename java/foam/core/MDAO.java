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


// TODO:  Abstract for now, so the code will compile.
// Need to finish the implementation of MDAO.
public class MDAO
  extends AbstractDAO
{
  protected Index  index_;
  protected Object root_ = null;

  public MDAO(Model model) {
    super(model);

    index_ = new TreeIndex(model.getID());
  }

  // TODO: addIndex()

  public Object put(X x, Object obj)
    throws DAOException, DAOInternalException
  {
    Object oldValue = find(x, obj);

    if ( oldValue != null ) {
      root_ = index_.put(index_.remove(root_, oldValue), obj);
    } else {
      root_ = index_.put(root_, obj);
    }

    return obj;
  }


  public void remove(X x, Object obj)
    throws DAOException, DAOInternalException
  {
    if ( obj instanceof FObject ) {
      root_ = index_.remove(root_, obj);
    } else {
      // TODO: uncomment when we have EQ
      // limit(1).removeAll(x, EQ(model_.getID(), model_.getID().get(obj)));
    }
  }


  public Sink select_(X x, Sink sink, Predicate p, Comparator c, long skip, long limit)
    throws DAOException, DAOInternalException
  {
    Plan plan = index_.plan(root_, sink, p, c, skip, limit);

    plan.execute(x, root_, sink, p, c, skip, limit);

    return sink;
  }

}
