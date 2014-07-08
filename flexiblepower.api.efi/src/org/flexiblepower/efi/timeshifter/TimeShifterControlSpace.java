package org.flexiblepower.efi.timeshifter;

import java.util.Date;
import java.util.List;

import javax.measure.Measurable;
import javax.measure.quantity.Duration;

import org.flexiblepower.rai.comm.ResourceUpdate;

public class TimeShifterControlSpace extends ResourceUpdate {

	private final Date endBefore;
	private final List<SequentialProfile> timeshiferProfiles;

	public TimeShifterControlSpace(String resourceId, Date timestamp,
			Date validFrom, Measurable<Duration> allocationDelay,
			Date endBefore, List<SequentialProfile> timeshiferProfiles) {
		super(resourceId, timestamp, validFrom, allocationDelay);
		this.endBefore = endBefore;
		this.timeshiferProfiles = timeshiferProfiles;
	}

}
