package org.flexiblepower.felix.webconsole.plugins;

import java.util.HashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class UiElementData {
    public HashMap<String, HashMap<String, String>> data;

    private static UiElementData instance = null;
    private static final Logger logger = LoggerFactory.getLogger(UiElementData.class);

    public static UiElementData getInstance() {
        if (instance == null) {
            instance = new UiElementData();
        }
        return instance;
    }

    public UiElementData() {
        data = new HashMap<String, HashMap<String, String>>();
    }

    public static void setValue(String id, String key, String value) {

        logger.info("@UiElementData::setValue: Setting element data.");
        logger.info("@UiElementData::setValue: With id: " + id);
        logger.info("@UiElementData::setValue: With key: " + key);
        logger.info("@UiElementData::setValue: With value: " + value);

        HashMap<String, String> internalData = getInstance().getInternalData(id);

        internalData.put(key, value);

        getInstance().data.put(id, internalData);
    }

    public static String getValue(String id, String key) {
        HashMap<String, String> internalData = getInstance().getInternalData(id);
        if (internalData.containsKey(key)) {
            return internalData.get(key);
        } else {
            return null;
        }
    }

    public static HashMap<String, String> getValues(String id) {
        HashMap<String, String> internalData = getInstance().getInternalData(id);
        return internalData;
    }

    private HashMap<String, String> getInternalData(String id) {
        HashMap<String, String> internalData = data.get(id);
        if (internalData == null) {
            internalData = new HashMap<String, String>();
        }

        return internalData;
    }
}
