package foam.android.view;

import android.view.View;

import foam.core.Value;

/**
 * Abstract base adapter for one-way binding, {@link Value} to {@link View}.
 *
 * Subclasses must implement {@link #updateViewFromValue()}, and construct {@link #view}.
 */
public abstract class OneWayViewBridge<V extends View, T> extends BaseViewBridge<V, T> {
}
