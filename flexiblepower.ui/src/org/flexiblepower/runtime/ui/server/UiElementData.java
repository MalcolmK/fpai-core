package org.flexiblepower.runtime.ui.server;

import java.util.HashMap;

public class UiElementData {
    private final static HashMap<String, String> data = new HashMap<String, String>();

    public static void setValue(String key, String value) {
        data.put(key, value);
    }

    public static Object getValue(String key) {
        return data.get(key);
    }
}
