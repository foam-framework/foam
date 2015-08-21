package foam.core;

/**
 * Base interface for reference properties, with their extra fields.
 */
public interface ReferenceProperty<T> extends Property<T> {
  Model getSubType();
  Property getSubKey();
}
