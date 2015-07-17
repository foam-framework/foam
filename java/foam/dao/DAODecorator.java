package foam.dao;

import foam.core.FObject;

/**
 * Interface for an object that decorates Objects passing in and out of a DAO.
 *
 * Wrap multiple {@link DAODecorator}s into a {@link DecoratorDAO}.
 */
public interface DAODecorator {
  FObject decorateIn(FObject old, FObject nu);
  FObject decorateOut(FObject old, FObject nu);
}
