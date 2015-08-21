package foam.util;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.io.UnsupportedEncodingException;

/**
 * Reads the entire contents of an {@link InputStream} into a {@link String}.
 *
 * Make sure the file isn't too big!
 */
public class WholeStreamReader {
  private String contents;
  public WholeStreamReader(InputStream is) {
    char[] buffer = new char[1024];
    StringBuilder sb = new StringBuilder();
    try {
      Reader in = new InputStreamReader(is, "UTF-8");
      while (true) {
        int rsz = in.read(buffer, 0, buffer.length);
        if (rsz < 0) break;
        sb.append(buffer, 0, rsz);
      }

      contents = sb.toString();
    } catch(UnsupportedEncodingException e) {
      contents = null;
    } catch(IOException e) {
      contents = null;
    }
  }

  public String toString() {
    return contents;
  }
}
