/**
 * User-Based Duplicate Detection Utility for Sabah Road Care
 * Prevents same user from submitting duplicate reports within 72 hours
 * Allows different users to report same location (for severity calculation)
 */

// Configuration constants
const DUPLICATE_DETECTION_CONFIG = {
    // Distance threshold in meters (reports within this distance are considered same location)
    PROXIMITY_THRESHOLD: 50, // 50 meters

    // Time threshold for SAME USER duplicate prevention
    USER_DUPLICATE_THRESHOLD_HOURS: 72, // 72 hours

    // Geohash precision (higher = more precise location)
    GEOHASH_PRECISION: 8,

    // Maximum number of user's recent reports to check
    MAX_USER_REPORTS_TO_CHECK: 50,

    // Maximum number of all reports to check for severity calculation
    MAX_ALL_REPORTS_TO_CHECK: 200
};

/**
 * Generate a location hash for duplicate detection
 * Uses a simplified geohashing algorithm
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @param {number} precision - Hash precision (default: 8)
 * @returns {string} Location hash
 */
export const generateLocationHash = (latitude, longitude, precision = DUPLICATE_DETECTION_CONFIG.GEOHASH_PRECISION) => {
    if (!latitude || !longitude) {
        throw new Error('Invalid coordinates provided');
    }

    // Validate coordinates
    if (latitude < -90 || latitude > 90) {
        throw new Error('Invalid latitude: must be between -90 and 90');
    }
    if (longitude < -180 || longitude > 180) {
        throw new Error('Invalid longitude: must be between -180 and 180');
    }

    // Simple geohash implementation
    const latRange = [-90, 90];
    const lngRange = [-180, 180];
    let hash = '';
    let isEven = true;
    let bit = 0;
    let ch = 0;

    const base32 = '0123456789bcdefghjkmnpqrstuvwxyz';

    while (hash.length < precision) {
        if (isEven) {
            // Longitude
            const mid = (lngRange[0] + lngRange[1]) / 2;
            if (longitude >= mid) {
                ch |= (1 << (4 - bit));
                lngRange[0] = mid;
            } else {
                lngRange[1] = mid;
            }
        } else {
            // Latitude
            const mid = (latRange[0] + latRange[1]) / 2;
            if (latitude >= mid) {
                ch |= (1 << (4 - bit));
                latRange[0] = mid;
            } else {
                latRange[1] = mid;
            }
        }

        isEven = !isEven;
        bit++;

        if (bit === 5) {
            hash += base32[ch];
            bit = 0;
            ch = 0;
        }
    }

    return hash;
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - First latitude
 * @param {number} lng1 - First longitude
 * @param {number} lat2 - Second latitude
 * @param {number} lng2 - Second longitude
 * @returns {number} Distance in meters
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371000; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
};

/**
 * Check if two locations are within proximity threshold
 * @param {Object} location1 - First location {latitude, longitude}
 * @param {Object} location2 - Second location {latitude, longitude}
 * @param {number} threshold - Distance threshold in meters
 * @returns {boolean} True if locations are within threshold
 */
export const isWithinProximity = (location1, location2, threshold = DUPLICATE_DETECTION_CONFIG.PROXIMITY_THRESHOLD) => {
    if (!location1 || !location2) return false;
    if (!location1.latitude || !location1.longitude || !location2.latitude || !location2.longitude) return false;

    const distance = calculateDistance(
        location1.latitude,
        location1.longitude,
        location2.latitude,
        location2.longitude
    );

    return distance <= threshold;
};

/**
 * Check if two timestamps are within time threshold
 * @param {string|Date} timestamp1 - First timestamp
 * @param {string|Date} timestamp2 - Second timestamp
 * @param {number} thresholdHours - Time threshold in hours
 * @returns {boolean} True if timestamps are within threshold
 */
export const isWithinTimeThreshold = (timestamp1, timestamp2, thresholdHours = DUPLICATE_DETECTION_CONFIG.USER_DUPLICATE_THRESHOLD_HOURS) => {
    const date1 = new Date(timestamp1);
    const date2 = new Date(timestamp2);
    const diffMs = Math.abs(date1.getTime() - date2.getTime());
    const diffHours = diffMs / (1000 * 60 * 60);

    return diffHours <= thresholdHours;
};

/**
 * Check for user duplicate submissions (BLOCKING)
 * Only prevents same user from submitting duplicate within 72 hours
 * @param {Object} newReport - New report data with userId
 * @param {Array} userReports - Array of user's existing reports
 * @param {Object} options - Detection options
 * @returns {Object} User duplicate detection result
 */
export const checkUserDuplicateSubmission = (newReport, userReports = [], options = {}) => {
    const config = {
        ...DUPLICATE_DETECTION_CONFIG,
        ...options
    };

    if (!newReport || !newReport.location || !newReport.userId) {
        return {
            isUserDuplicate: false,
            canSubmit: true,
            userDuplicates: [],
            message: 'Invalid report data or user not identified'
        };
    }

    const { latitude, longitude } = newReport.location;
    const newTimestamp = newReport.submissionTime || new Date().toISOString();
    const userId = newReport.userId;

    const userDuplicates = [];

    // Check against user's own reports only
    userReports
        .filter(report => report.userId === userId) // Ensure same user
        .slice(0, config.MAX_USER_REPORTS_TO_CHECK)
        .forEach(report => {
            if (!report.location || !report.location.latitude || !report.location.longitude) {
                return;
            }

            const existingLocation = {
                latitude: report.location.latitude,
                longitude: report.location.longitude
            };

            const existingTimestamp = report.submissionTime || report.createdAt;

            // Check if same location and within 72 hours
            const isNearby = isWithinProximity(newReport.location, existingLocation, config.PROXIMITY_THRESHOLD);
            const isWithin72Hours = isWithinTimeThreshold(newTimestamp, existingTimestamp, config.USER_DUPLICATE_THRESHOLD_HOURS);

            if (isNearby && isWithin72Hours) {
                const distance = calculateDistance(
                    latitude,
                    longitude,
                    existingLocation.latitude,
                    existingLocation.longitude
                );

                const timeDiffHours = Math.abs(new Date(newTimestamp) - new Date(existingTimestamp)) / (1000 * 60 * 60);

                userDuplicates.push({
                    report,
                    distance: Math.round(distance),
                    timeDiffHours: Math.round(timeDiffHours * 10) / 10,
                    remainingHours: Math.round((config.USER_DUPLICATE_THRESHOLD_HOURS - timeDiffHours) * 10) / 10
                });
            }
        });

    const isUserDuplicate = userDuplicates.length > 0;
    const canSubmit = !isUserDuplicate;

    return {
        isUserDuplicate,
        canSubmit,
        userDuplicates: userDuplicates.sort((a, b) => a.timeDiffHours - b.timeDiffHours), // Sort by most recent
        message: isUserDuplicate
            ? `You already reported this location ${userDuplicates[0].timeDiffHours}h ago. Please wait ${userDuplicates[0].remainingHours}h before reporting again.`
            : 'No user duplicates found - you can submit this report.'
    };
};

/**
 * Count similar reports from all users (for severity calculation)
 * This DOES NOT block submission - just counts for priority/severity
 * @param {Object} newReport - New report data
 * @param {Array} allReports - Array of all reports from all users
 * @param {Object} options - Detection options
 * @returns {Object} Similar reports count and details
 */
export const countSimilarReports = (newReport, allReports = [], options = {}) => {
    const config = {
        ...DUPLICATE_DETECTION_CONFIG,
        ...options
    };

    if (!newReport || !newReport.location) {
        return {
            similarReportsCount: 0,
            similarReports: [],
            severityMultiplier: 1.0,
            priorityBoost: 0
        };
    }

    const { latitude, longitude } = newReport.location;
    const newTimestamp = newReport.submissionTime || new Date().toISOString();

    const similarReports = [];

    // Check against ALL reports (from all users)
    allReports
        .slice(0, config.MAX_ALL_REPORTS_TO_CHECK)
        .forEach(report => {
            if (!report.location || !report.location.latitude || !report.location.longitude) {
                return;
            }

            const existingLocation = {
                latitude: report.location.latitude,
                longitude: report.location.longitude
            };

            const existingTimestamp = report.submissionTime || report.createdAt;

            // Check if same location (regardless of user or time)
            const isNearby = isWithinProximity(newReport.location, existingLocation, config.PROXIMITY_THRESHOLD);

            if (isNearby) {
                const distance = calculateDistance(
                    latitude,
                    longitude,
                    existingLocation.latitude,
                    existingLocation.longitude
                );

                const timeDiffHours = Math.abs(new Date(newTimestamp) - new Date(existingTimestamp)) / (1000 * 60 * 60);

                similarReports.push({
                    report,
                    distance: Math.round(distance),
                    timeDiffHours: Math.round(timeDiffHours * 10) / 10,
                    userId: report.userId,
                    isFromSameUser: report.userId === newReport.userId
                });
            }
        });

    const similarReportsCount = similarReports.length;

    // Calculate severity multiplier based on number of similar reports
    let severityMultiplier = 1.0;
    if (similarReportsCount >= 10) {
        severityMultiplier = 2.0; // Critical - many reports
    } else if (similarReportsCount >= 5) {
        severityMultiplier = 1.5; // High - several reports
    } else if (similarReportsCount >= 2) {
        severityMultiplier = 1.2; // Medium - few reports
    }

    // Calculate priority boost (0-3 levels)
    let priorityBoost = 0;
    if (similarReportsCount >= 8) {
        priorityBoost = 3; // Boost to Critical
    } else if (similarReportsCount >= 4) {
        priorityBoost = 2; // Boost to High
    } else if (similarReportsCount >= 2) {
        priorityBoost = 1; // Boost to Medium
    }

    return {
        similarReportsCount,
        similarReports: similarReports.sort((a, b) => a.distance - b.distance), // Sort by closest
        severityMultiplier,
        priorityBoost,
        uniqueUsers: [...new Set(similarReports.map(r => r.userId))].length,
        message: similarReportsCount > 0
            ? `Found ${similarReportsCount} similar report${similarReportsCount > 1 ? 's' : ''} from ${[...new Set(similarReports.map(r => r.userId))].length} user${[...new Set(similarReports.map(r => r.userId))].length > 1 ? 's' : ''}`
            : 'No similar reports found'
    };
};

/**
 * Complete duplicate detection check (combines user duplicate and similar reports)
 * @param {Object} newReport - New report data with userId
 * @param {Array} userReports - User's existing reports
 * @param {Array} allReports - All reports from all users
 * @param {Object} options - Detection options
 * @returns {Object} Complete duplicate detection result
 */
export const checkDuplicateSubmission = (newReport, userReports = [], allReports = [], options = {}) => {
    // Check if user can submit (72-hour rule)
    const userDuplicateCheck = checkUserDuplicateSubmission(newReport, userReports, options);

    // Count similar reports for severity calculation
    const similarReportsCheck = countSimilarReports(newReport, allReports, options);

    const locationHash = newReport.location ? generateLocationHash(
        newReport.location.latitude,
        newReport.location.longitude
    ) : null;

    return {
        // User duplicate prevention (BLOCKING)
        isUserDuplicate: userDuplicateCheck.isUserDuplicate,
        canSubmit: userDuplicateCheck.canSubmit,
        userDuplicates: userDuplicateCheck.userDuplicates,

        // Similar reports counting (NON-BLOCKING)
        similarReportsCount: similarReportsCheck.similarReportsCount,
        similarReports: similarReportsCheck.similarReports,
        severityMultiplier: similarReportsCheck.severityMultiplier,
        priorityBoost: similarReportsCheck.priorityBoost,
        uniqueUsers: similarReportsCheck.uniqueUsers,

        // Metadata
        locationHash,

        // Messages
        blockingMessage: userDuplicateCheck.message,
        infoMessage: similarReportsCheck.message
    };
};

/**
 * Get user-friendly duplicate detection summary
 * @param {Object} detectionResult - Result from checkDuplicateSubmission
 * @returns {Object} Summary for UI display
 */
export const getDuplicateDetectionSummary = (detectionResult) => {
    if (!detectionResult) {
        return {
            canSubmit: true,
            status: 'clean',
            title: 'Ready to Submit',
            message: 'No issues detected.',
            action: null
        };
    }

    const {
        isUserDuplicate,
        canSubmit,
        userDuplicates,
        similarReportsCount,
        uniqueUsers,
        blockingMessage,
        infoMessage
    } = detectionResult;

    // BLOCKING: User duplicate within 72 hours
    if (isUserDuplicate) {
        const remainingHours = userDuplicates[0]?.remainingHours || 0;
        return {
            canSubmit: false,
            status: 'blocked',
            title: 'Duplicate Report Detected',
            message: `You already reported this location. Please wait ${remainingHours} hours before reporting again.`,
            action: 'wait_or_review',
            details: {
                type: 'user_duplicate',
                remainingHours,
                lastReportTime: userDuplicates[0]?.timeDiffHours
            }
        };
    }

    // NON-BLOCKING: Similar reports from other users (good for severity)
    if (similarReportsCount > 0) {
        return {
            canSubmit: true,
            status: 'similar_found',
            title: 'Similar Reports Found',
            message: `${similarReportsCount} similar report${similarReportsCount > 1 ? 's' : ''} from ${uniqueUsers} user${uniqueUsers > 1 ? 's' : ''} found. This will help prioritize the repair.`,
            action: 'inform_user',
            details: {
                type: 'similar_reports',
                count: similarReportsCount,
                uniqueUsers,
                severityBoost: similarReportsCount >= 5 ? 'high' : similarReportsCount >= 2 ? 'medium' : 'low'
            }
        };
    }

    // Clean - no issues
    return {
        canSubmit: true,
        status: 'clean',
        title: 'Ready to Submit',
        message: 'No similar reports found. This appears to be a new issue.',
        action: null,
        details: {
            type: 'new_report'
        }
    };
};

/**
 * Calculate priority level based on similar reports
 * @param {number} similarReportsCount - Number of similar reports
 * @param {number} uniqueUsers - Number of unique users reporting
 * @param {string} basePriority - Base priority from other factors
 * @returns {string} Calculated priority level
 */
export const calculatePriorityFromDuplicates = (similarReportsCount, uniqueUsers, basePriority = 'Low') => {
    const priorityLevels = ['Low', 'Medium', 'High', 'Critical'];
    let basePriorityIndex = priorityLevels.indexOf(basePriority);

    if (basePriorityIndex === -1) basePriorityIndex = 0;

    let boost = 0;

    // Boost based on total reports
    if (similarReportsCount >= 10) {
        boost = 3; // Critical
    } else if (similarReportsCount >= 5) {
        boost = 2; // High
    } else if (similarReportsCount >= 2) {
        boost = 1; // Medium
    }

    // Additional boost for multiple unique users
    if (uniqueUsers >= 5) {
        boost += 1;
    } else if (uniqueUsers >= 3) {
        boost += 0.5;
    }

    const finalPriorityIndex = Math.min(
        priorityLevels.length - 1,
        Math.max(0, basePriorityIndex + Math.floor(boost))
    );

    return priorityLevels[finalPriorityIndex];
};

/**
 * Validate location data for duplicate detection
 * @param {Object} location - Location object
 * @returns {boolean} True if location is valid
 */
export const validateLocationForDuplicateDetection = (location) => {
    if (!location) return false;

    const { latitude, longitude } = location;

    return (
        typeof latitude === 'number' &&
        typeof longitude === 'number' &&
        latitude >= -90 && latitude <= 90 &&
        longitude >= -180 && longitude <= 180 &&
        !isNaN(latitude) && !isNaN(longitude)
    );
};

/**
 * Format time remaining for user duplicate
 * @param {number} hours - Hours remaining
 * @returns {string} Formatted time string
 */
export const formatTimeRemaining = (hours) => {
    if (hours <= 0) return 'You can now submit';

    if (hours >= 24) {
        const days = Math.floor(hours / 24);
        const remainingHours = Math.floor(hours % 24);
        return `${days} day${days > 1 ? 's' : ''}${remainingHours > 0 ? ` ${remainingHours}h` : ''}`;
    }

    if (hours >= 1) {
        const wholeHours = Math.floor(hours);
        const minutes = Math.floor((hours % 1) * 60);
        return `${wholeHours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
    }

    const minutes = Math.floor(hours * 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
};

// Export configuration for external use
export const DUPLICATE_DETECTION_CONSTANTS = DUPLICATE_DETECTION_CONFIG;

export default {
    generateLocationHash,
    calculateDistance,
    isWithinProximity,
    isWithinTimeThreshold,
    checkUserDuplicateSubmission,
    countSimilarReports,
    checkDuplicateSubmission,
    getDuplicateDetectionSummary,
    calculatePriorityFromDuplicates,
    validateLocationForDuplicateDetection,
    formatTimeRemaining,
    DUPLICATE_DETECTION_CONSTANTS
};

export const safeDuplicateCheck = (newReport, userReports, allReports, options) => {
    try {
        return checkDuplicateSubmission(newReport, userReports, allReports, options);
    } catch (error) {
        console.error('Duplicate detection error:', error);
        // Fallback to allow submission
        return {
            isUserDuplicate: false,
            canSubmit: true,
            similarReportsCount: 0,
            similarReports: [],
            severityMultiplier: 1.0,
            priorityBoost: 0,
            uniqueUsers: 0,
            locationHash: null,
            blockingMessage: 'Duplicate detection unavailable - proceeding with submission',
            infoMessage: 'Unable to check for similar reports'
        };
    }
};