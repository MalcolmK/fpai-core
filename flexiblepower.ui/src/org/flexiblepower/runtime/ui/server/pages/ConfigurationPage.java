package org.flexiblepower.runtime.ui.server.pages;

import java.io.IOException;
import java.util.Arrays;
import java.util.Dictionary;
import java.util.HashMap;
import java.util.List;
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
import org.osgi.framework.InvalidSyntaxException;
import org.osgi.service.cm.Configuration;
import org.osgi.service.cm.ConfigurationAdmin;
import org.osgi.service.metatype.AttributeDefinition;
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
import aQute.bnd.annotation.metatype.Meta;
import aQute.bnd.annotation.metatype.Meta.AD;
import aQute.bnd.annotation.metatype.Meta.OCD;

@Component(designate = ConfigurationPage.Config.class,
           configurationPolicy = ConfigurationPolicy.optional,
           immediate = true,
           provide = { Widget.class },
           properties = { "widget.type=full", "widget.name=settings", "widget.ranking=1000000" })
public class ConfigurationPage extends AbstractWidgetManager implements Widget {
    private static final Logger logger = LoggerFactory.getLogger(ConfigurationPage.class);

    public static final String AD_TYPE_CHECKBOX = "checkbox";
    public static final String AD_TYPE_NUMBER = "number";
    public static final String AD_TYPE_STRING = "text";
    public static final String AD_TYPE_SELECT_BOX = "select";
    public static final String AD_TYPE_RADIO = "radio";

    @OCD(description = "Configuration of the Settings Servlet", name = "Settings Configuration Page")
    public interface Config {
        @AD(deflt = "31536000",
            description = "Expiration time of static content (in seconds)",
            name = "Expiration time",
            optionLabels = { "No caching", "A minute", "An hour", "A day", "A year" },
            optionValues = { "0", "60", "3600", "86400", "31536000" },
            required = false)
        long expireTime();

        @Meta.AD(deflt = "false", required = false)
        boolean isDisabled();

        @Meta.AD(deflt = "5", description = "Delay between updates will be send out in seconds")
        int updateDelay();
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
        for (int i = 0; i < countBundles; i++) {
            Bundle bundle = bundles[i];
            bundleMap = (HashMap<String, Object>) getBundleInformation(bundleMap, bundle);
        }

        if (bundleMap.size() > 0) {
            return new BundleList(bundleMap);
        }

        return null;
    }

    private Map<String, Object> getBundleInformation(Map<String, Object> bundleMap, Bundle bundle) {
        try {
            MetaTypeInformation bundleMetaInformation = getBundleMetaTypeInformation(bundle);

            String[] factoryPIDS = bundleMetaInformation.getFactoryPids();
            String[] normalPIDS = bundleMetaInformation.getPids();

            // For normal PIDS.
            if (normalPIDS != null) {
                for (String element : normalPIDS) {
                    // Get the bundle information.
                    Map<String, Object> bundleInformation = getBundleGeneralInformation(bundle, element);

                    // This is a normal PID, so no factory.
                    bundleInformation.put("hasFactory", false);

                    // Check or there are configurations available.
                    bundleInformation.put("hasConfigurations", hasConfiguration(false, element, bundle.getLocation()));

                    // Save the bundle information in the returned map.
                    bundleMap.put(element, bundleInformation);
                }
            }

            // For factory PIDS.
            if (factoryPIDS != null) {
                for (String element : factoryPIDS) {
                    // Get the bundle information.
                    Map<String, Object> bundleInformation = getBundleGeneralInformation(bundle, element);

                    // This is a normal PID, so no factory.
                    bundleInformation.put("hasFactory", true);

                    // Check or there are configurations available.
                    bundleInformation.put("hasConfigurations", hasConfiguration(true, element, bundle.getLocation()));

                    // Save the bundle information in the returned map.
                    bundleMap.put(element, bundleInformation);
                }
            }
        } catch (NullPointerException npe) {
            // Do nothing with le exceptione.
        }

        return bundleMap;
    }

    private Map<String, Object> getBundleGeneralInformation(Bundle bundle, String element) {
        // Get the meta information of the bundle.
        MetaTypeInformation bundleMetaInformation = getBundleMetaTypeInformation(bundle);

        // Get OCD.
        ObjectClassDefinition ocd = bundleMetaInformation.getObjectClassDefinition(element, null);

        // Debug.
        System.out.println("OCD Name [" + element + "] = " + ocd.getName());

        // Information about this bundle.
        HashMap<String, Object> bundleInformation = new HashMap<String, Object>();
        bundleInformation.put("name", ocd.getName());
        bundleInformation.put("location", bundle.getLocation());
        bundleInformation.put("pid", element);

        return bundleInformation;
    }

    public Boolean hasConfiguration(Boolean hasFactory, String pid, String location) {
        try {
            // Todo: Try to use .listConfigurations with filter on pid/location.
            // Configuration configuration;
            // if (hasFactory) {
            Configuration configuration;
            configuration = configurationAdmin.getConfiguration(pid, location);
            logger.info("Configuration" + configuration);
            // } else {
            // configuration = configurationAdmin.createFactoryConfiguration(pid, location);
            // }
            // logger.debug("Configuration", configuration);
            // return configuration.getProperties() != null;
            Configuration[] configurations = configurationAdmin.listConfigurations("(service.bundleLocation=" + location
                                                                                   + ")");
            logger.info("Configurations" + configurations);
            if (configurations == null) {
                return false;
            }
            return configurations.length > 0;
        } catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        } catch (InvalidSyntaxException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }

        return false;
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

    public class MetaTypeInformationObject {
        private final HashMap<String, Object> information;

        public MetaTypeInformationObject(HashMap<String, Object> information) {
            this.information = information;
        }

    }

    public MetaTypeInformationObject getConfigurationOptions(Map<String, Object> parameters) {
        logger.info("Passed parameters", parameters);

        Bundle bundle = getBundleByLocation((String) parameters.get("location"));

        MetaTypeInformation metaTypeInformation = metaTypeService.getMetaTypeInformation(bundle);
        logger.info("metaTypeInformation: " + metaTypeInformation);

        String[] normalPIDS = metaTypeInformation.getPids();

        // For normal PIDS.
        // Get OCD's and AD's.
        if (normalPIDS != null) {
            for (String element : normalPIDS) {
                // Get OCD.
                ObjectClassDefinition ocd = metaTypeInformation.getObjectClassDefinition(element, null);

                // Information HashMap.
                HashMap<String, Object> information = new HashMap<String, Object>();

                // Strip OCD.
                HashMap<String, Object> ocdInformation = new HashMap<String, Object>();
                ocdInformation.put("Name", ocd.getName());
                ocdInformation.put("Description", ocd.getDescription());
                ocdInformation.put("ID", ocd.getID());

                // Get all AD's.
                AttributeDefinition[] ads = ocd.getAttributeDefinitions(ObjectClassDefinition.ALL);

                // Attributes.
                HashMap<String, Object> attributes = new HashMap<String, Object>();

                // Print OCD's and AD's.
                int adIndex = 0;
                for (AttributeDefinition ad : ads) {
                    HashMap<String, Object> adInformation = new HashMap<String, Object>();
                    adInformation.put("adType", getAttributeType(ad));
                    adInformation.put("attribute", ad);

                    attributes.put(Integer.toString(adIndex), adInformation);

                    adIndex++;
                }

                // Bring it all together.
                information.put("OCD", ocdInformation);
                information.put("ADs", attributes);

                return new MetaTypeInformationObject(information);
            }
        }

        return null;
    }

    public void createConfiguration(List parameters) {
        logger.info("create configuration with parameters: " + parameters);
        // Configuration configuration = configurationAdmin.getConfiguration(pid, location);
        // Dictionary<String, Object> properties = configuration.getProperties();
    }

    private String getAttributeType(AttributeDefinition ad) {
        if (ad.getOptionLabels().length > 0) {
            return AD_TYPE_SELECT_BOX;
        }

        switch (ad.getType()) {
        case AttributeDefinition.BOOLEAN:
            return AD_TYPE_RADIO;
        case AttributeDefinition.BYTE:
        case AttributeDefinition.INTEGER:
        case AttributeDefinition.LONG:
            return AD_TYPE_NUMBER;
        case AttributeDefinition.STRING:
        default:
            return AD_TYPE_STRING;
        }
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
        MetaTypeInformation metaTypeInformation = metaTypeService.getMetaTypeInformation(bundle);
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
