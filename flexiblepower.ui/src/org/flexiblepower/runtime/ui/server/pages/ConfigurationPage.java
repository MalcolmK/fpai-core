package org.flexiblepower.runtime.ui.server.pages;

import java.io.IOException;
import java.util.Arrays;
import java.util.Dictionary;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.SortedMap;
import java.util.TreeMap;

import javax.servlet.http.HttpServlet;

import org.flexiblepower.runtime.ui.server.widgets.AbstractWidgetManager;
import org.flexiblepower.runtime.ui.server.widgets.WidgetRegistration;
import org.flexiblepower.runtime.ui.server.widgets.WidgetRegistry;
import org.flexiblepower.ui.Widget;
import org.osgi.framework.Bundle;
import org.osgi.framework.FrameworkUtil;
import org.osgi.framework.ServiceReference;
import org.osgi.service.cm.Configuration;
import org.osgi.service.cm.ConfigurationAdmin;
import org.osgi.service.metatype.MetaTypeInformation;
import org.osgi.service.metatype.MetaTypeService;
import org.osgi.service.metatype.ObjectClassDefinition;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import aQute.bnd.annotation.component.Activate;
import aQute.bnd.annotation.component.Component;
import aQute.bnd.annotation.component.ConfigurationPolicy;
import aQute.bnd.annotation.component.Reference;
import aQute.bnd.annotation.metatype.Configurable;
import aQute.bnd.annotation.metatype.Meta.AD;
import aQute.bnd.annotation.metatype.Meta.OCD;

@Component(designate = ConfigurationPage.Config.class,
           configurationPolicy = ConfigurationPolicy.optional,
           immediate = true,
           provide = { Widget.class },
           properties = { "widget.type=full", "widget.name=settings", "widget.ranking=1000000" })
public class ConfigurationPage extends AbstractWidgetManager implements Widget {
    private static final Logger logger = LoggerFactory.getLogger(ConfigurationPage.class);

    @OCD(description = "Configuration of the Settings Servlet", name = "Settings Configuration Page")
    public interface Config {
        @AD(deflt = "31536000",
            description = "Expiration time of static content (in seconds)",
            name = "Expiration time",
            optionLabels = { "No caching", "A minute", "An hour", "A day", "A year" },
            optionValues = { "0", "60", "3600", "86400", "31536000" },
            required = false)
        long expireTime();
    }

    private ConfigurationAdmin configurationAdmin;
    private MetaTypeService metaTypeService;

    @Reference
    public void setConfigurationAdmin(ConfigurationAdmin configurationAdmin) {
        this.configurationAdmin = configurationAdmin;
    }

    @Reference
    public void setMetaTypeService(MetaTypeService metaTypeService) {
        this.metaTypeService = metaTypeService;
    }

    private long expirationTime = 31536000000L;

    @Activate
    public void activate(Map<String, Object> properties) {
        logger.trace("Entering activate, properties = " + properties);
        Config config = Configurable.createConfigurable(Config.class, properties);
        expirationTime = config.expireTime() * 1000;

        // widget = new SettingsPageWidget(this);
        // widgetRegistration = FrameworkUtil.getBundle(this.getClass())
        // .getBundleContext()
        // .registerService(Widget.class, widget, null);

        // Bundle[] bundles = FrameworkUtil.getBundle(this.getClass()).getBundleContext().getBundles();

        // MetaTypeServiceImpl metaTypeService = new MetaTypeServiceImpl();
        // metaTypeService.start(FrameworkUtil.getBundle(this.getClass()).getBundleContext());

        logger.trace("Leaving activate");
    }

    @Override
    @Reference(dynamic = true,
               multiple = true,
               optional = true,
               target = "(&"
                        + "(!(" + WidgetRegistry.KEY_TYPE + "=" + WidgetRegistry.VALUE_TYPE_FULL + "))"
                        + "(!(" + WidgetRegistry.KEY_PAGE_TYPE + "=" + WidgetRegistry.VALUE_PAGE_TYPE_SETTINGS + "))"
                        + ")")
    public synchronized void addWidget(Widget widget, Map<String, Object> properties) {
        super.addWidget(widget, properties);
        notifyAll();
    }

    @Override
    public synchronized void removeWidget(Widget widget) {
        super.removeWidget(widget);
        notifyAll();
    }

    @Override
    public String createPath(WidgetRegistration registration) {
        return "/widget/" + registration.getId();
    }

    @Override
    public HttpServlet createServlet(WidgetRegistration registration) {
        return new ConfigurationWidgetServlet(registration, expirationTime);
    }

    // Full-size widget functions

    @Override
    public String getTitle(Locale locale) {
        return "Settings";
    }

    public synchronized SortedMap<Integer, String> getWidgets(Locale locale, Integer[] currentWidgets) {
        logger.trace("Entering getWidgets, locale = {}, currentWidgets = {}", locale, currentWidgets);
        SortedMap<Integer, String> widgetInfo = getWidgetInfo(locale);

        if (Arrays.equals(widgetInfo.keySet().toArray(new Integer[widgetInfo.size()]), currentWidgets)) {
            logger.trace("No change, waiting...");
            try {
                wait(30000);
            } catch (InterruptedException ex) {
                // Expected
            }

            widgetInfo = getWidgetInfo(locale);
        }

        logger.trace("Leaving getWidgets, result = {}", widgetInfo);
        return widgetInfo;
    }

    public class BundleList {
        private final HashMap<String, Object> bundleList;

        public BundleList(HashMap<String, Object> bundleList) {
            this.bundleList = bundleList;
        }

    }

    public BundleList loadConfigurableComponents() {
        logger.info("Getting bundles.");

        Bundle[] bundles = FrameworkUtil.getBundle(this.getClass()).getBundleContext().getBundles();

        HashMap<String, Object> bundleMap = new HashMap<String, Object>();
        int countBundles = bundles.length;
        logger.debug("Number of bundles found:", countBundles);
        for (int i = 0; i < countBundles; i++) {
            Bundle bundle = bundles[i];

            try {
                MetaTypeInformation bundleMetaInformation = getBundleMetaTypeInformation(bundle);

                String[] factoryPIDS = bundleMetaInformation.getFactoryPids();
                String[] normalPIDS = bundleMetaInformation.getPids();

                // For normal PIDS.
                if (normalPIDS != null) {
                    for (String element : normalPIDS) {
                        // Get OCD.
                        ObjectClassDefinition ocd = bundleMetaInformation.getObjectClassDefinition(element, null);

                        // Debug.
                        System.out.println("OCD Name [" + element + "] = " + ocd.getName());

                        // Information about this bundle.
                        HashMap<String, Object> bundleInformation = new HashMap<String, Object>();
                        bundleInformation.put("name", ocd.getName());
                        bundleInformation.put("location", bundle.getLocation());
                        bundleInformation.put("pid", element);
                        bundleInformation.put("hasFactory", false);

                        // Store the bundle information in the bundle map.
                        bundleMap.put(element, bundleInformation);
                    }
                }

                // For factory PIDS.
                if (factoryPIDS != null) {
                    for (String element : factoryPIDS) {
                        // Get OCD.
                        ObjectClassDefinition ocd = bundleMetaInformation.getObjectClassDefinition(element, null);

                        // Debug.
                        System.out.println("OCD Name [" + element + "] = " + ocd.getName());

                        // Information about this bundle.
                        HashMap<String, Object> bundleInformation = new HashMap<String, Object>();
                        bundleInformation.put("name", ocd.getName());
                        bundleInformation.put("location", bundle.getLocation());
                        bundleInformation.put("pid", element);
                        bundleInformation.put("hasFactory", true);

                        // Store the bundle information in the bundle map.
                        bundleMap.put(element, bundleInformation);
                    }
                }
            } catch (NullPointerException npe) {
                // Do nothing with le exceptione.
            }
        }

        if (bundleMap.size() > 0) {
            logger.info("Bundle Map has size.");
            return new BundleList(bundleMap);
        }
        return null;
    }

    public HashMap<String, Object> getConfiguration(Map<String, Object> parameters) {
        String pid = (String) parameters.get("pid");
        String location = (String) parameters.get("location");
        Boolean hasFactory = (Boolean) parameters.get("hasFactory");

        HashMap<String, Object> componentConfiguration = new HashMap<String, Object>();
        HashMap<String, Object> existingConfiguration = new HashMap<String, Object>();
        MetaTypeInformation metaInformation = getBundleMetaInformation(parameters);

        logger.info("Getting the configuration of pid: " + parameters.get("pid"));
        try {
            Configuration configuration = configurationAdmin.getConfiguration(pid, location);
            Dictionary<String, Object> properties = configuration.getProperties();

            logger.info("Configuration properties" + properties);

            componentConfiguration.put("exitingConfiguration", properties);
            componentConfiguration.put("metaInformation", metaInformation);

        } catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        return componentConfiguration;
    }

    private MetaTypeInformation getBundleMetaInformation(Map<String, Object> parameters) {
        Bundle bundle = getBundleByLocation((String) parameters.get("location"));
        return metaTypeService.getMetaTypeInformation(bundle);
    }

    private Bundle getBundleByLocation(String location) {
        Bundle bundle = FrameworkUtil.getBundle(this.getClass()).getBundleContext().getBundle(location);
        return bundle;
    }

    private MetaTypeInformation getBundleMetaTypeInformation(Bundle bundle) {
        ServiceReference metaTypeReference = bundle.getBundleContext()
                                                   .getServiceReference(MetaTypeService.class.getName());
        MetaTypeService metaTypeService = (MetaTypeService) bundle.getBundleContext().getService(metaTypeReference);

        MetaTypeInformation metaTypeInformation = metaTypeService.getMetaTypeInformation(bundle);

        // !!!!!!!!!!!!!!!!!!!ZIE SETTINGSWIDGET!!!!!!!!!!!!!!!

        return metaTypeInformation;
    }

    private SortedMap<Integer, String> getWidgetInfo(Locale locale) {
        SortedMap<Integer, String> widgetInfo = new TreeMap<Integer, String>();
        for (WidgetRegistration reg : getRegistrations()) {
            widgetInfo.put(reg.getId(), reg.getWidget().getTitle(locale));
        }
        return widgetInfo;
    }
}
