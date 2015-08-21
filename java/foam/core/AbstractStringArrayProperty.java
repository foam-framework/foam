package foam.core;

import foam.dao.DAO;

/**
 * Specialized {@link Property} for arrays of strings.
 */
public abstract class AbstractStringArrayProperty extends AbstractArrayProperty<String> {
  @Override
  public DAO getAsDAO(Object o) {
    // Can't get a DAO of non-modeled objects like Strings.
    return null;
  }

  @Override
  public int getType() {
    return Property.TYPE_ARRAY | Property.TYPE_STRING;
  }
}
