package org.flexiblepower.runtime.ui.server.pages;

import java.util.Map;

import org.flexiblepower.messaging.Endpoint;
import org.flexiblepower.runtime.ui.server.pages.Settings.Config;
import org.flexiblepower.runtime.ui.server.widgets.WidgetRegistry;
import org.flexiblepower.ui.Widget;
import org.osgi.framework.BundleContext;
import org.osgi.framework.ServiceRegistration;

import aQute.bnd.annotation.component.Activate;
import aQute.bnd.annotation.component.Component;
import aQute.bnd.annotation.component.Deactivate;
import aQute.bnd.annotation.metatype.Configurable;
import aQute.bnd.annotation.metatype.Meta;

@Component(designateFactory = Config.class,
           provide = Endpoint.class,
           immediate = true,
           properties = { WidgetRegistry.KEY_TYPE + "=" + WidgetRegistry.VALUE_TYPE_SMALL,
                         WidgetRegistry.KEY_NAME + "=settings",
                         WidgetRegistry.KEY_RANKING + "=1000000",
                         WidgetRegistry.KEY_PAGE_TYPE + "=" + WidgetRegistry.VALUE_PAGE_TYPE_SETTINGS })
public class Settings {

    @Meta.OCD(description = "Configuration of the Settings widget", name = "Settings Widget Configuration")
    interface Config {
        @Meta.AD(deflt = "5", description = "Delay between updates will be send out in seconds")
        int updateDelay();

        @Meta.AD(deflt = "0", description = "Generated Power when inverter is in stand by")
        double powerWhenStandBy();

        @Meta.AD(deflt = "200", description = "Generated Power when cloudy weather")
        int powerWhenCloudy();

        @Meta.AD(deflt = "1500", description = "Generated Power when sunny weather")
        int powerWhenSunny();

        @Meta.AD(deflt = "pvpanel", description = "Resource identifier")
        String resourceId();
    }

    private SettingsWidget widget;
    private ServiceRegistration<Widget> widgetRegistration;
    private Config config;

    @Activate
    public void activate(BundleContext bundleContext, Map<String, Object> properties) {
        try {
            config = Configurable.createConfigurable(Config.class, properties);

            widget = new SettingsWidget(this, bundleContext);
            widgetRegistration = bundleContext.registerService(Widget.class, widget, null);
        } catch (RuntimeException ex) {
            deactivate();
            throw ex;
        }
    }

    @Deactivate
    public void deactivate() {
        if (widgetRegistration != null) {
            widgetRegistration.unregister();
            widgetRegistration = null;
        }
    }

}
