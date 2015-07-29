package foam.core;

import java.util.List;

/**
 * Interface that combines {@link ArrayProperty} and {@link ReferenceProperty}.
 */
public interface ReferenceArrayProperty<T> extends ReferenceProperty<List<T>>, ArrayProperty<T> {
}
