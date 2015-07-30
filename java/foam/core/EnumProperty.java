package foam.core;

import java.util.List;

/**
 * Generic interface for enum-valued properties. These are properties whose value is a single
 * object, where that object is chosen from a list of {@link Object}-{@link String} pairs.
 */
public interface EnumProperty<T> extends Property<T> {
  List<LabeledItem<T>> getChoices();
}
