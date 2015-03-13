package org.flexiblepower.runtime.ui.server.pages;

import java.util.HashMap;
import java.util.Locale;

import org.flexiblepower.ui.Widget;
import org.osgi.framework.BundleContext;
import org.osgi.service.metatype.AttributeDefinition;
import org.osgi.service.metatype.MetaTypeInformation;
import org.osgi.service.metatype.ObjectClassDefinition;

public class SettingsWidget implements Widget {
    private final Settings settings;
    private final BundleContext bundleContext;

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
