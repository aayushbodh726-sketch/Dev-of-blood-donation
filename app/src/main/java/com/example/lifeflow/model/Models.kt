package com.example.lifeflow.model

enum class BloodGroup(val label: String) {
    A_POSITIVE("A+"),
    A_NEGATIVE("A-"),
    B_POSITIVE("B+"),
    B_NEGATIVE("B-"),
    AB_POSITIVE("AB+"),
    AB_NEGATIVE("AB-"),
    O_POSITIVE("O+"),
    O_NEGATIVE("O-");

    companion object {
        fun fromLabel(label: String): BloodGroup? = entries.find { it.label.equals(label, ignoreCase = true) }
    }
}

enum class UrgencyLevel(val label: String) {
    CRITICAL("Critical (Within 2 hrs)"),
    URGENT("Urgent (Within 24 hrs)"),
    NORMAL("Normal (Within 2-3 days)")
}

enum class RequestStatus {
    OPEN,
    FULFILLED
}

data class Donor(
    val id: String,
    val name: String,
    val bloodGroup: BloodGroup,
    val city: String,
    val state: String,
    val phone: String,
    val email: String = "",
    val isAvailable: Boolean = true,
    val totalDonations: Int = 1,
    val lastDonationDate: String = "2024-08-15"
)

data class BloodRequest(
    val id: String,
    val patientName: String,
    val bloodGroup: BloodGroup,
    val unitsRequired: Int,
    val hospital: String,
    val hospitalAddress: String = "",
    val city: String,
    val state: String,
    val contactName: String,
    val contactPhone: String,
    val urgency: UrgencyLevel,
    val note: String = "",
    val requestedDonorName: String? = null,
    val status: RequestStatus = RequestStatus.OPEN,
    val createdAt: String = "Today"
)

data class DonationStats(
    val totalDonors: Int,
    val livesSaved: Int,
    val activeRequests: Int,
    val unitsDonated: Int
)

data class CompatibilityInfo(
    val bloodGroup: BloodGroup,
    val canGiveTo: List<BloodGroup>,
    val canReceiveFrom: List<BloodGroup>,
    val isUniversalDonor: Boolean = false,
    val isUniversalRecipient: Boolean = false,
    val description: String = ""
)

data class DonationRecord(
    val id: String,
    val donorId: String,
    val date: String,
    val donationCenter: String,
    val city: String,
    val type: String = "Whole Blood",
    val units: Int = 1,
    val volumeMl: Int = 450,
    val impact: String = "Transfused to emergency pediatric trauma patient",
    val isVerified: Boolean = true
)

data class DonationAppointment(
    val id: String,
    val donorId: String,
    val date: String,
    val time: String,
    val donationCenter: String,
    val address: String,
    val type: String = "Whole Blood",
    val status: String = "CONFIRMED",
    val notes: String = ""
)

enum class NotificationType {
    EXACT_CITY_MATCH,
    DIRECT_REQUEST,
    COMPATIBLE_MATCH
}

data class DonorNotification(
    val id: String,
    val donorId: String,
    val requestId: String,
    val bloodGroup: BloodGroup,
    val city: String,
    val state: String,
    val patientName: String,
    val hospital: String,
    val unitsNeeded: Int,
    val urgency: UrgencyLevel,
    val type: NotificationType,
    val title: String,
    val message: String,
    val contactName: String = "",
    val contactPhone: String = "",
    val isRead: Boolean = false,
    val status: String = "PENDING", // PENDING, ACCEPTED, DECLINED
    val createdAt: String = "Just now"
)

