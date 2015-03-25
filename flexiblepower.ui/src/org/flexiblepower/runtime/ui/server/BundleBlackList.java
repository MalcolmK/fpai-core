package org.flexiblepower.runtime.ui.server;

import java.util.ArrayList;

public class BundleBlackList {
    private static final ArrayList<String> blackList = new ArrayList<String>() {
        {
            add("org.apache.felix.http");
            add("org.apache.felix.scr.ScrService");
            add("org.apache.felix.webconsole.internal.servlet.OsgiManager");
            add("org.flexiblepower.runtime.ui.user.UserSessionHttpContext");
        }
    };

    public ArrayList<String> getBlackList() {
        return blackList;
    }

    public Boolean isOnBlackList(String bundleID) {
        return blackList.contains(bundleID);
    }
}
