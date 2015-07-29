package foam.core;

import java.util.List;

import foam.dao.DAO;

/**
 * Generic interface to Array-valued properties.
 */
public interface ArrayProperty<T> extends Property<List<T>> {
  DAO getAsDAO(Object o);
}
