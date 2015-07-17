package foam.android.app;

import android.app.ActionBar;
import android.content.Context;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;

import foam.android.core.FOAMFragment;
import foam.android.core.XContext;
import foam.android.view.DetailViewBridge;
import foam.core.FObject;
import foam.core.PropertyChangeEvent;
import foam.core.PubSubListener;
import foam.core.SimpleValue;
import foam.core.Value;
import foam.core.ValueChangeEvent;
import foam.dao.DAO;
import foam.dao.DAOException;
import foam.dao.DAOInternalException;

/**
 * Activity that displays essentially an UpdateDetailView for a given item, which is expected
 * attached to the context, which should be a FOAM {@link XContext}.
 */
public class DetailFragment extends FOAMFragment {
  private static final String LOG_TAG = "DetailFragment";
  private ValueListener valueListener;
  private ObjectListener objectListener;
  private Value<FObject> value;

  @Override
  public void onCreate(Bundle bundle) {
    super.onCreate(bundle);
    ActionBar bar = getActivity().getActionBar();

    if (X().get("dao") != null) {
      Object raw = X().get("data");
      if (! (raw instanceof Value)) {
        Log.e(LOG_TAG, "Expected \"X.data\" to be a Value.");
      }
      value = (Value<FObject>) raw;
      FObject data = value.get();
      valueListener = new ValueListener();
      value.addListener(valueListener);
      objectListener = new ObjectListener();
      data.addPropertyChangeListener(null, objectListener);
    }
  }

  @Override
  public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
    container.removeAllViews();
    // Inflating in code, the file is needlessly simple.
    Context context = container.getContext();

    LinearLayout layout = new LinearLayout(context);
    layout.setOrientation(LinearLayout.VERTICAL);
    layout.setLayoutParams(new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.MATCH_PARENT));

    DetailViewBridge bridge = new DetailViewBridge(context);
    bridge.X(X());

    Object raw = X().get("data");
    Value value = null;
    if (raw instanceof Value) {
      value = (Value) raw;
    } else if (raw instanceof FObject) {
      value = new SimpleValue<FObject>((FObject) raw);
    }
    if (value != null) bridge.setValue(value);

    layout.addView(bridge.getView());
    return layout;
  }

  /**
   * Listener for the whole {@link FObject} being replaced inside the data {@link Value}.
   */
  private class ValueListener implements PubSubListener<ValueChangeEvent<FObject>> {
    @Override
    public void eventOccurred(String[] topic, ValueChangeEvent<FObject> event) {
      FObject old = event.getOldValue();
      FObject nu = event.getNewValue();
      if (old != null) old.removePropertyChangeListener(null, objectListener);
      if (nu != null) nu.addPropertyChangeListener(null, objectListener);
    }
  }

  /**
   * Listener for properties within the {@link FObject} changing.
   *
   * Updates the DAO whenever the contents change.
   */
  private class ObjectListener implements PubSubListener {
    @Override
    public void eventOccurred(String[] topic, Object rawEvent) {
      // TODO(braden): This might be too spammy. Add isMerged support to Android and use it here.
      if (!(rawEvent instanceof PropertyChangeEvent)) return;
      PropertyChangeEvent event = (PropertyChangeEvent) rawEvent;
      DAO dao = (DAO) X().get("dao");
      if (dao != null) {
        try {
          FObject nu = dao.put(X(), event.getTarget());
          value.set(nu.fclone());
        } catch (DAOInternalException e) {
          Log.w(LOG_TAG, "Internal DAO error while trying to save updates: " + e.getMessage());
        } catch (DAOException e) {
          Log.w(LOG_TAG, "DAO error while trying to save updates: " + e.getMessage());
        }
      }
    }
  }
}
