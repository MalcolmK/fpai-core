package org.flexiblepower.runtime.ui.server.pages;

import java.util.HashMap;
import java.util.Locale;

import org.flexiblepower.ui.Widget;
import org.osgi.framework.Bundle;
import org.osgi.framework.BundleContext;
import org.osgi.service.metatype.AttributeDefinition;
import org.osgi.service.metatype.MetaTypeInformation;
import org.osgi.service.metatype.ObjectClassDefinition;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class SettingsWidget implements Widget {
    private final Settings settings;
    private final BundleContext bundleContext;
    private static final Logger logger = LoggerFactory.getLogger(SettingsWidget.class);

    public SettingsWidget(Settings settings, BundleContext bundleContext) {
        this.settings = settings;
        this.bundleContext = bundleContext;
    }

    public class MetaTypeInformationObject {
        private final HashMap<String, Object> information;

        public MetaTypeInformationObject(HashMap<String, Object> information) {
            this.information = information;
        }

    }

    @Override
    public String getTitle(Locale locale) {
        return "Settings";
    }

    public String update() {
        return "Settings widget updated.";
    }

    public void getMetaTypeInformation() {
        MetaTypeServiceImpl metaTypeService = new MetaTypeServiceImpl(bundleContext);
        metaTypeService.getBundleInformation(bundleContext.getBundle());
    }

    public class BundleList {
        private final HashMap<Integer, Object> bundleList;

        public BundleList(HashMap<Integer, Object> bundleList) {
            this.bundleList = bundleList;
        }

    }

    public BundleList getBundleList() {
        logger.info("Getting bundles.");
        Bundle[] bundles = bundleContext.getBundles();

        HashMap<Integer, Object> bundleMap = new HashMap<Integer, Object>();
        int countBundles = bundles.length;
        logger.debug("Number of bundles found:", countBundles);
        for (int i = 0; i < countBundles; i++) {
            Bundle bundle = bundles[i];
            logger.info("Bundle location: " + bundle.getLocation());
            MetaTypeServiceImpl metaTypeService = new MetaTypeServiceImpl(bundleContext);
            metaTypeService.getBundleInformation(bundle);
            bundleMap.put(i, bundles[i].getLocation());
        }

        if (bundleMap.size() > 0) {
            logger.info("Bundle Map has size.");
            return new BundleList(bundleMap);
        }
        return null;
    }

    public MetaTypeInformationObject getBundleMetaTypeInformation() {
        MetaTypeServiceImpl metaTypeService = new MetaTypeServiceImpl(bundleContext);
        MetaTypeInformation bundleMetaTypeInformation = metaTypeService.getBundleMetaTypeInformation(bundleContext.getBundle());

        String[] normalPIDS = bundleMetaTypeInformation.getPids();

        // For normal PIDS.
        // Get OCD's and AD's.
        if (normalPIDS != null) {
            for (String element : normalPIDS) {
                // Get OCD.
                ObjectClassDefinition ocd = bundleMetaTypeInformation.getObjectClassDefinition(element, null);

                // Information HashMap.
                HashMap<String, Object> information = new HashMap<String, Object>();

                // Strip OCD.
                HashMap<String, Object> ocdInformation = new HashMap<String, Object>();
                ocdInformation.put("Name", ocd.getName());
                ocdInformation.put("Description", ocd.getDescription());
                ocdInformation.put("ID", ocd.getID());

                // Get all AD's.
                AttributeDefinition[] ads = ocd.getAttributeDefinitions(ObjectClassDefinition.ALL);

                // Attribute definitions.
                HashMap<String, Object> adInformation = new HashMap<String, Object>();

                // Print OCD's and AD's.
                for (AttributeDefinition ad : ads) {
                    adInformation.put(ad.getName(), ad);
                }

                // Bring it all together.
                information.put("OCD", ocdInformation);
                information.put("ADs", adInformation);

                return new MetaTypeInformationObject(information);
            }
        }

        return null;

        // bundleMetaTypeInformation.getObjectClassDefinition(null, locale)
    }
}
