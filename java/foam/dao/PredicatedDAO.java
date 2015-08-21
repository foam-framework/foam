/**
 * @license Copyright 2013 Google Inc. All Rights Reserved.
 * <p/>
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * <p/>
 * http://www.apache.org/licenses/LICENSE-2.0
 * <p/>
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package foam.dao;

import java.util.Comparator;

import foam.core.Expression;
import foam.core.X;

import static foam.dao.MLang.AND;

public class PredicatedDAO extends ProxyDAO {
  protected Expression<Boolean> predicate_;

  public PredicatedDAO(Expression<Boolean> p, DAO delegate) {
    super(delegate);

    setPredicate(p);
  }

  public Expression<Boolean> getPredicate() {
    return predicate_;
  }

  public void setPredicate(Expression<Boolean> predicate) {
    predicate_ = predicate;
  }

  public Sink select_(X x, Sink sink, Expression<Boolean> p, Comparator c, long skip, long limit)
      throws DAOException, DAOInternalException {
    Expression<Boolean> p2 = p == null ?
        getPredicate() :
        AND(getPredicate(), p).partialEval();

    return getDelegate().select_(x, sink, p2, c, skip, limit);
  }
}
