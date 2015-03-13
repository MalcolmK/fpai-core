package org.flexiblepower.runtime.ui.server.pages;

import java.util.Locale;

import org.flexiblepower.ui.Widget;

public class SettingsWidget implements Widget {
    private final Settings settings;

    public SettingsWidget(Settings settings) {
        this.settings = settings;
    }

    @Override
    public String getTitle(Locale locale) {
        return "Settings";
    }

    public String update() {
        return "Settings widget updated.";
    }
}
