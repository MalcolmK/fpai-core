package org.flexiblepower.runtime.ui.server.pages;

import java.io.IOException;
import java.util.Dictionary;
import java.util.HashMap;
import java.util.Hashtable;
import java.util.List;
import java.util.Locale;
import java.util.Map;

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
public class ConfigurationPage implements Widget {
    private static final Logger logger = LoggerFactory.getLogger(ConfigurationPage.class);

    public static final String AD_TYPE_CHECKBOX = "checkbox";
    public static final String AD_TYPE_NUMBER = "number";
    public static final String AD_TYPE_STRING = "text";
    public static final String AD_TYPE_SELECT_BOX = "select";
    public static final String AD_TYPE_RADIO = "radio";
    public static final String AD_TYPE_INTEGER = "integer";
    public static final String AD_TYPE_DOUBLE = "double";

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

        // Bundle[] bundles = FrameworkUtil.getBundle(this.getClass()).getBundleContext().getBundles();

        logger.trace("Leaving activate");
    }

    // Full-size widget functions
    @Override
    public String getTitle(Locale locale) {
        return "Settings";
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

        // Get OCD.
        ObjectClassDefinition ocd = metaTypeInformation.getObjectClassDefinition((String) parameters.get("pid"), null);

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
        information.put("id", parameters.get("pid"));
        information.put("location", parameters.get("location"));

        return new MetaTypeInformationObject(information);
    }

    @SuppressWarnings({ "unused", "rawtypes" })
    public void createConfiguration(List passedParameters) {
        Map parameters = (Map) passedParameters.get(0);
        logger.info("create configuration with parameters: " + parameters.get(0));

        Bundle bundle = getBundleByLocation((String) parameters.get("bundle-location"));
        MetaTypeInformation metaTypeInformation = metaTypeService.getMetaTypeInformation(bundle);
        ObjectClassDefinition objectClassDefinition = metaTypeInformation.getObjectClassDefinition((String) parameters.get("bundle-id"),
                                                                                                   null);

        Dictionary<String, Object> transformedProperties = transformTypes(objectClassDefinition, parameters);

        try {
            Configuration configuration = null;
            // Are multiple configurations possible?
            if ((Boolean) parameters.get("bundle-has-factory")) {
                configuration = configurationAdmin.createFactoryConfiguration((String) parameters.get("bundle-id"));
            } else {
                configuration = configurationAdmin.getConfiguration((String) parameters.get("bundle-id"),
                                                                    (String) parameters.get("bundle-location"));
            }

            Dictionary<String, Object> properties = configuration.getProperties();

            configuration.update(transformedProperties);
            logger.info("Retrieved properties: " + configuration.getProperties());
        } catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
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
            return AD_TYPE_INTEGER;
        case AttributeDefinition.DOUBLE:
            return AD_TYPE_DOUBLE;
        case AttributeDefinition.STRING:
        default:
            return AD_TYPE_STRING;
        }
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

        // Information about this bundle.
        HashMap<String, Object> bundleInformation = new HashMap<String, Object>();
        bundleInformation.put("name", ocd.getName());
        bundleInformation.put("location", bundle.getLocation());
        bundleInformation.put("pid", element);

        return bundleInformation;
    }

    private Dictionary<String, Object> transformTypes(ObjectClassDefinition objectClassDefinition, Map parameters) {
        Dictionary<String, Object> result = new Hashtable<String, Object>();

        for (AttributeDefinition attributeDefinition : objectClassDefinition.getAttributeDefinitions(ObjectClassDefinition.ALL)) {
            String key = attributeDefinition.getID();
            String current = (String) parameters.get(key);

            if (current == null) {
                // TODO fix something to get the default value.
                // current = attributeDefinition.getDefaultValue();
                // if (current == null) {
                // logger.warn("Missing property for key [{}] on {}", key, objectClassDefinition.getName());
                current = new String();
                // }
            }

            Object parsedValue = parse(attributeDefinition.getType(), current);

            result.put(key, parsedValue);
        }

        return result;
    }

    private Object parse(int type, String value) {
        switch (type) {
        case AttributeDefinition.BOOLEAN:
            return Boolean.parseBoolean(value);
        case AttributeDefinition.BYTE:
            return Byte.parseByte(value);
        case AttributeDefinition.CHARACTER:
            return value.isEmpty() ? ' ' : value.charAt(0);
        case AttributeDefinition.DOUBLE:
            return Double.parseDouble(value);
        case AttributeDefinition.FLOAT:
            return Float.parseFloat(value);
        case AttributeDefinition.INTEGER:
            return Integer.parseInt(value);
        case AttributeDefinition.LONG:
            return Long.parseLong(value);
        case AttributeDefinition.SHORT:
            return Short.parseShort(value);
        default:
            return value;
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
}
