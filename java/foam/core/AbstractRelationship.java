package foam.core;

import foam.dao.DAO;

/**
 * Abstract base class for {@link Relationship}s.
 *
 * Generally used only in generated code, handwritten code should use the {@link Relationship}
 * interface.
 */
public abstract class AbstractRelationship implements Relationship {
  @Override
  public DAO f(Object o) {
    return get(o);
  }
}
