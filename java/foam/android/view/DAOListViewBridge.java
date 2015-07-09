package foam.android.view;

import android.content.Context;
import android.support.v7.widget.LinearLayoutManager;
import android.support.v7.widget.RecyclerView;
import android.util.AttributeSet;
import android.util.Log;
import android.view.View;

import foam.android.core.AttributeUtils;
import foam.core.DAO;
import foam.core.X;

/**
 * FOAM wrapper for presenting a DAO's data in a RecyclerView in list mode.
 *
 * The view to use for the row is specified in XML as foam:rowView and its value can either be a
 * <code>@layout/foobar</code> layout reference or a class name.
 */
public class DAOListViewBridge extends OneWayViewBridge<RecyclerView, DAO> {
  private DAOAdapter adapter;
  private Context context;
  private String rowView;

  public DAOListViewBridge(Context context) {
    this(context, null);
  }
  public DAOListViewBridge(Context context, AttributeSet attrs) {
    this.context = context;
    view = attrs == null ? new RecyclerView(context) : new RecyclerView(context, attrs);

    // Look in the attrs for a rowView setting.
    rowView = AttributeUtils.find(attrs, "rowView");
    tryToBuildView();
  }

  public void X(X x) {
    super.X(x);
    tryToBuildView();
  }

  public View getView() {
    if (view == null) {
      tryToBuildView();
      if (view == null) {
        Log.e("DAOListView", "Tried to build DAOListView before its X is set.");
        return null;
      }
    }
    return super.getView();
  }

  private void tryToBuildView() {
    X x = X();
    if (x == null) return;

    DAO dao = (DAO) X().get("dao");
    if (dao == null) dao = (DAO) X().get("data");
    if (dao == null) return;
    adapter = new DAOAdapter(X(), dao, new DetailViewFactory(rowView));
    view.setAdapter(adapter);
    final LinearLayoutManager layoutManager = new LinearLayoutManager(context);
    layoutManager.setOrientation(LinearLayoutManager.VERTICAL);
    view.setLayoutManager(layoutManager);
  }

  @Override
  protected void updateViewFromValue() {
    // TODO(braden): Implement me. Need to figure out the context and DAO first, though.
  }
}
