package org.flexiblepower.runtime.context;

import java.util.Date;

import org.flexiblepower.context.FlexiblePowerContext;
import org.flexiblepower.scheduling.AbstractScheduler;
import org.osgi.framework.Bundle;
import org.osgi.service.component.ComponentContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import aQute.bnd.annotation.component.Activate;
import aQute.bnd.annotation.component.Component;
import aQute.bnd.annotation.component.Deactivate;

@Component(servicefactory = true, provide = FlexiblePowerContext.class)
public class RuntimeContext extends AbstractScheduler {
    private static final Logger logger = LoggerFactory.getLogger(RuntimeContext.class);

    private Bundle bundle;

    @Activate
    public void activate(ComponentContext context) {
        bundle = context.getUsingBundle();
        start(bundle.getSymbolicName());
        logger.info("Created RuntimeContext for bundle: {}", bundle.getSymbolicName());
    }

    @Deactivate
    public void deactivate() {
        logger.info("Stopping RuntimeContext for bundle: {}", bundle.getSymbolicName());
        stop();
        logger.debug("Stopped RuntimeContext for bundle: {}", bundle.getSymbolicName());
    }

    @Override
    public long currentTimeMillis() {
        return System.currentTimeMillis();
    }

    @Override
    public Date currentTime() {
        return new Date(currentTimeMillis());
    }
}