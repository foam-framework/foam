package foam.dao;

import java.util.Comparator;

import foam.core.Expression;
import foam.core.FObject;
import foam.core.Model;
import foam.core.X;

/**
 * {@link DAO} for use in relationships. Requires a {@link String} key. Looks up that key in the
 * provided {@link X} to find the real DAO, and delegates to it.
 *
 * Emits warnings to Log
 */
public class RelationshipDAO extends AbstractDAO {
  private final String key;
  public RelationshipDAO(Model model, String key) {
    super(model);
    this.key = key;
  }


  private DAO getDelegate(X x) {
    DAO delegate = (DAO) x.get(key);
    // TODO(braden): Log here in some generic way.
    return delegate;
  }

  @Override
  public Sink select_(X x, Sink sink, Expression<Boolean> p, Comparator c, long skip, long limit) throws DAOException, DAOInternalException {
    DAO delegate = getDelegate(x);
    if (delegate == null) return sink;
    return delegate.select_(x, sink, p, c, skip, limit);
  }

  @Override
  public void remove(X x, FObject obj) throws DAOException, DAOInternalException {
    DAO delegate = getDelegate(x);
    if (delegate != null) delegate.remove(x, obj);
  }

  @Override
  public FObject put(X x, FObject obj) throws DAOException, DAOInternalException {
    DAO delegate = getDelegate(x);
    if (delegate == null) return obj;
    return delegate.put(x, obj);
  }
}
