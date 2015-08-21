package foam.core;

import java.util.List;

import foam.dao.DAO;

/**
 * Generic interface to Array-valued properties.
 *
 * TODO(braden): Is there a way to capture changes to the contents of the array and fire listeners?
 */
public interface ArrayProperty<T> extends Property<List<T>> {
  DAO getAsDAO(Object o);
}
