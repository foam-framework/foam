package foam.core;

/**
 * Generic class for some member object paired with a {@link String} label.
 */
public class LabeledItem<T> {
  private T object;
  private String label;

  public LabeledItem(String label, T object) {
    this.label = label;
    this.object = object;
  }

  public String getLabel() {
    return label;
  }

  public T getObject() {
    return object;
  }
}
