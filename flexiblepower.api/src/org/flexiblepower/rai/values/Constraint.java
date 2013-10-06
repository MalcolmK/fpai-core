package org.flexiblepower.rai.values;

import javax.measure.Measurable;
import javax.measure.Measure;
import javax.measure.quantity.Quantity;
import javax.measure.unit.Unit;

/**
 * A PowerConstraint has two (different) power values or a single power value.
 * 
 * The semantics is the following: To represent two modes one specifies a power constraint list a,b with two
 * single-value power constraints a and b. To represent an operational mode with power in a range, one specifies a power
 * constraint list with a single two-value power constraint <a,b> which represents the range [a,b]. One can specify
 * multiple power constraints in a power constraint list.
 * 
 * PMSuite - PM Data Specification - v0.6
 */
public final class Constraint<Q extends Quantity> {
    private final Measurable<Q> lowerBound;
    private final Measurable<Q> upperBound;

    /**
     * Construct power constraint with a lower and upper bound as power values. If both are equal, this constructs a
     * single value power constraint.
     * 
     * @param lowerBound
     *            is the lower bound in Power
     * @param upperBound
     *            is the upper bound in Power
     * @throws NullPointerException
     *             if either the lower or upper bound is null
     * @throws IllegalArgumentException
     *             if the upper bound is lower than the lower bound
     */
    public Constraint(Measurable<Q> lowerBound, Measurable<Q> upperBound) {
        if (lowerBound == null) {
            throw new NullPointerException("lowerBound is null");
        }
        if (upperBound == null) {
            throw new NullPointerException("upperBound is null");
        }
        if (upperBound.compareTo(lowerBound) < 0) {
            throw new IllegalArgumentException("The upperBound is lower than the lowerBound");
        }

        this.lowerBound = lowerBound;
        this.upperBound = upperBound;
    }

    /**
     * Constructs a power constraint with single power value
     * 
     * @param power
     *            is the single power value
     * @throws NullPointerException
     *             if power is null
     */
    public Constraint(Measurable<Q> power) {
        this(power, power);
    }

    /**
     * Construct a power constraint with two (different) power values. If both are equal, this constructs a single value
     * power constraint.
     * 
     * @param lowerBound
     *            is the lower bound
     * @param upperBound
     *            is the upper bound
     * @param unit
     *            is unit in which both the lower and upper bound are expressed
     * @throws NullPointerException
     *             when unit is null
     */
    public Constraint(double lowerBound, double upperBound, Unit<Q> unit) {
        this(Measure.valueOf(lowerBound, unit), Measure.valueOf(upperBound, unit));
    }

    public boolean isSingleValue() {
        return lowerBound.equals(upperBound);
    }

    /**
     * @return The lower bound of the power constraint
     */
    public Measurable<Q> getLowerBound() {
        return lowerBound;
    }

    /**
     * @return The upper bound of the power constraint, which will be equal to the lower bound if this represents a
     *         single value.
     */
    public Measurable<Q> getUpperBound() {
        return upperBound;
    }

    /**
     * @param value
     *            The power value that we want to match
     * @return The value that lies the closest to the bounds that are given. If the value is lower than the lower bound,
     *         than the lower bound is returned. If the value is higher that the upper bound, than the upper bound is
     *         returned. If the value is in between the bounds, the value itself is returned.
     */
    public Measurable<Q> getClosestValue(Measurable<Q> value) {
        if (lowerBound.compareTo(value) > 0) {
            return lowerBound;
        } else if (upperBound.compareTo(value) < 0) {
            return upperBound;
        } else {
            return value;
        }
    }

    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + ((lowerBound == null) ? 0 : lowerBound.hashCode());
        result = prime * result + ((upperBound == null) ? 0 : upperBound.hashCode());
        return result;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null) {
            return false;
        }
        if (getClass() != obj.getClass()) {
            return false;
        }
        Constraint<?> other = (Constraint<?>) obj;
        if (lowerBound == null) {
            if (other.lowerBound != null) {
                return false;
            }
        } else if (!lowerBound.equals(other.lowerBound)) {
            return false;
        }
        if (upperBound == null) {
            if (other.upperBound != null) {
                return false;
            }
        } else if (!upperBound.equals(other.upperBound)) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "[" + lowerBound.toString() + "," + upperBound.toString() + "]";
    }
}