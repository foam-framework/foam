package foam.dao;

import java.util.Comparator;

import foam.core.Expression;
import foam.core.FObject;
import foam.core.X;

/**
 * Basic eager caching DAO: selects all from the delegate for storing in the cache.
 *
 * Updates are written through to the delegate, and the cache is updated if they succeed.
 */
public class CachingDAO extends AbstractDAO {
  protected DAO delegate;
  protected DAO cache;
  private boolean populated = false;

  /**
   * Defaults to caching in a newly created MDAO.
   * @param delegate The underlying {@link DAO} we're caching.
   */
  public CachingDAO(DAO delegate) {
    this(delegate, new MDAO(delegate.getModel()));
  }

  public CachingDAO(DAO delegate, DAO cache) {
    super(delegate.getModel());
    this.delegate = delegate;
    this.cache = cache;
  }

  private void setup(X x) throws DAOException, DAOInternalException {
    populated = true;
    delegate.select(x, cache);
    delegate.listen(cache);
  }

  @Override
  public Sink select_(X x, Sink sink, Expression<Boolean> p, Comparator c, long skip, long limit) throws DAOException, DAOInternalException {
    if (!populated) setup(x);
    return cache.select_(x, sink, p, c, skip, limit);
  }

  @Override
  public void removeAll_(X x, Expression<Boolean> p) throws DAOException, DAOInternalException {
    delegate.removeAll_(x, p);
  }

  @Override
  public void remove(X x, FObject obj) throws DAOException, DAOInternalException {
    if (!populated) setup(x);
    delegate.remove(x, obj);
  }

  @Override
  public FObject put(X x, FObject obj) throws DAOException, DAOInternalException {
    if (!populated) setup(x);
    return delegate.put(x, obj);
  }
}
