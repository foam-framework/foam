package foam.android.view;

import android.content.Context;
import android.content.res.TypedArray;
import android.graphics.Canvas;
import android.graphics.Rect;
import android.graphics.drawable.Drawable;
import android.support.v7.widget.LinearLayoutManager;
import android.support.v7.widget.RecyclerView;
import android.util.AttributeSet;
import android.util.Log;
import android.view.View;

import foam.android.core.AttributeUtils;
import foam.core.X;
import foam.dao.DAO;

/**
 * FOAM wrapper for presenting a DAO's data in a RecyclerView in list mode.
 *
 * The view to use for the row is specified in XML as foam:row_view and its value can either be a
 * <code>@layout/foobar</code> layout reference or a class name.
 *
 * Set <code>foam:dividers="false"</code> to disable the row separators.
 */
public class DAOListViewBridge extends OneWayViewBridge<RecyclerView, DAO> {
  private DAOAdapter adapter;
  private Context context;
  private String rowView;
  private boolean decorators;

  public DAOListViewBridge(Context context) {
    this(context, null);
  }
  public DAOListViewBridge(Context context, AttributeSet attrs) {
    this.context = context;
    view = attrs == null ? new RecyclerView(context) : new RecyclerView(context, attrs);

    // Look in the attrs for a row_view setting.
    rowView = AttributeUtils.find(attrs, "row_view");
    decorators = AttributeUtils.findBoolean(attrs, "dividers", true);
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

    DAO dao = (DAO) x.get("dao");
    if (dao == null) dao = (DAO) x.get("data");
    if (dao == null) return;

    adapter = new DAOAdapter(x, dao, new DetailViewFactory(rowView, dao.getModel()));
    view.setAdapter(adapter);
    final LinearLayoutManager layoutManager = new LinearLayoutManager(context);
    layoutManager.setOrientation(LinearLayoutManager.VERTICAL);
    view.setLayoutManager(layoutManager);
    if (decorators) view.addItemDecoration(new RowDecoration(context));
  }

  @Override
  protected void updateViewFromValue() {
    // TODO(braden): Implement me. Need to figure out the context and DAO first, though.
  }


  class RowDecoration extends RecyclerView.ItemDecoration {
    private Drawable mDivider;
    public RowDecoration(Context context) {
      final TypedArray a = context.obtainStyledAttributes(new int[] { android.R.attr.listDivider });
      mDivider = a.getDrawable(0);
      a.recycle();
    }

    @Override
    public void onDraw(Canvas c, RecyclerView parent) {
      final int left = parent.getPaddingLeft();
      final int right = parent.getWidth() - parent.getPaddingRight();

      final int childCount = parent.getChildCount();
      for (int i = 0; i < childCount; i++) {
        final View child = parent.getChildAt(i);
        final RecyclerView.LayoutParams params = (RecyclerView.LayoutParams) child.getLayoutParams();
        final int top = child.getBottom() + params.bottomMargin;
        final int bottom = top + mDivider.getIntrinsicHeight();
        mDivider.setBounds(left, top, right, bottom);
        mDivider.draw(c);
      }
    }

    @Override
    public void getItemOffsets(Rect outRect, int itemPosition, RecyclerView parent) {
      outRect.set(0, 0, 0, mDivider.getIntrinsicHeight());
    }
  }
}
