package org.flexiblepower.efi.timeshifter;

import java.util.Date;
import java.util.Set;

import javax.measure.Measurable;
import javax.measure.quantity.Duration;

import org.flexiblepower.rai.comm.ControlSpaceRegistration;
import org.flexiblepower.rai.values.Commodity;

public class TimeShifterRegistration extends ControlSpaceRegistration {

    private static final long serialVersionUID = 2453887214286161182L;

    private final Set<Commodity> supportedCommodities;

    public TimeShifterRegistration(String resourceId,
                                   Date timestamp,
                                   Measurable<Duration> allocationDelay,
                                   Set<Commodity> supportedCommodities) {
        super(resourceId, timestamp, allocationDelay);
        this.supportedCommodities = supportedCommodities;
    }

}
