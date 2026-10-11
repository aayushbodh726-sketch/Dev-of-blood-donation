package com.example.lifeflow.data

import com.example.lifeflow.model.BloodGroup
import com.example.lifeflow.model.BloodRequest
import com.example.lifeflow.model.CompatibilityInfo
import com.example.lifeflow.model.DonationAppointment
import com.example.lifeflow.model.DonationRecord
import com.example.lifeflow.model.DonationStats
import com.example.lifeflow.model.Donor
import com.example.lifeflow.model.DonorNotification
import com.example.lifeflow.model.NotificationType
import com.example.lifeflow.model.RequestStatus
import com.example.lifeflow.model.UrgencyLevel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import java.util.UUID

class LifeFlowRepository {

    private val initialDonors = listOf(
        Donor(
            id = "d1",
            name = "Sarah Jenkins",
            bloodGroup = BloodGroup.O_NEGATIVE,
            city = "New York",
            state = "NY",
            phone = "+1 (555) 234-5678",
            email = "sarah.j@example.com",
            isAvailable = true,
            totalDonations = 8,
            lastDonationDate = "2024-05-10"
        ),
        Donor(
            id = "d2",
            name = "David Chen",
            bloodGroup = BloodGroup.A_POSITIVE,
            city = "San Francisco",
            state = "CA",
            phone = "+1 (555) 876-5432",
            email = "david.chen@example.com",
            isAvailable = true,
            totalDonations = 4,
            lastDonationDate = "2024-06-20"
        ),
        Donor(
            id = "d3",
            name = "Elena Rodriguez",
            bloodGroup = BloodGroup.B_POSITIVE,
            city = "Chicago",
            state = "IL",
            phone = "+1 (555) 345-6789",
            email = "elena.r@example.com",
            isAvailable = true,
            totalDonations = 12,
            lastDonationDate = "2024-04-12"
        ),
        Donor(
            id = "d4",
            name = "Marcus Washington",
            bloodGroup = BloodGroup.AB_POSITIVE,
            city = "Houston",
            state = "TX",
            phone = "+1 (555) 987-6543",
            email = "marcus.w@example.com",
            isAvailable = false,
            totalDonations = 5,
            lastDonationDate = "2024-08-01"
        ),
        Donor(
            id = "d5",
            name = "Amina Patel",
            bloodGroup = BloodGroup.O_POSITIVE,
            city = "Seattle",
            state = "WA",
            phone = "+1 (555) 456-7890",
            email = "amina.p@example.com",
            isAvailable = true,
            totalDonations = 3,
            lastDonationDate = "2024-07-14"
        ),
        Donor(
            id = "d6",
            name = "Liam O'Connor",
            bloodGroup = BloodGroup.A_NEGATIVE,
            city = "Boston",
            state = "MA",
            phone = "+1 (555) 678-1234",
            email = "liam.oc@example.com",
            isAvailable = true,
            totalDonations = 6,
            lastDonationDate = "2024-06-05"
        ),
        Donor(
            id = "d7",
            name = "Priya Sharma",
            bloodGroup = BloodGroup.B_NEGATIVE,
            city = "Austin",
            state = "TX",
            phone = "+1 (555) 789-0123",
            email = "priya.s@example.com",
            isAvailable = true,
            totalDonations = 7,
            lastDonationDate = "2024-05-28"
        ),
        Donor(
            id = "d8",
            name = "Lucas Martinez",
            bloodGroup = BloodGroup.AB_NEGATIVE,
            city = "Miami",
            state = "FL",
            phone = "+1 (555) 890-1234",
            email = "lucas.m@example.com",
            isAvailable = true,
            totalDonations = 2,
            lastDonationDate = "2024-07-22"
        )
    )

    private val initialRequests = listOf(
        BloodRequest(
            id = "r1",
            patientName = "Michael Brown",
            bloodGroup = BloodGroup.O_NEGATIVE,
            unitsRequired = 3,
            hospital = "Metropolitan General Hospital",
            city = "New York",
            state = "NY",
            contactName = "Emily Brown (Sister)",
            contactPhone = "+1 (555) 111-2233",
            urgency = UrgencyLevel.CRITICAL,
            note = "Emergency cardiac surgery scheduled in 3 hours.",
            status = RequestStatus.OPEN,
            createdAt = "10 mins ago"
        ),
        BloodRequest(
            id = "r2",
            patientName = "Sophia Ramirez",
            bloodGroup = BloodGroup.B_POSITIVE,
            unitsRequired = 2,
            hospital = "St. Jude Medical Center",
            city = "Chicago",
            state = "IL",
            contactName = "Carlos Ramirez",
            contactPhone = "+1 (555) 222-3344",
            urgency = UrgencyLevel.URGENT,
            note = "Severe anemia post-trauma recovery.",
            status = RequestStatus.OPEN,
            createdAt = "1 hour ago"
        ),
        BloodRequest(
            id = "r3",
            patientName = "James Wilson",
            bloodGroup = BloodGroup.A_POSITIVE,
            unitsRequired = 1,
            hospital = "Bay Area Health Pavilion",
            city = "San Francisco",
            state = "CA",
            contactName = "Clara Wilson",
            contactPhone = "+1 (555) 333-4455",
            urgency = UrgencyLevel.NORMAL,
            note = "Scheduled elective orthopedic replacement.",
            status = RequestStatus.OPEN,
            createdAt = "Yesterday"
        ),
        BloodRequest(
            id = "r4",
            patientName = "Harper Lee",
            bloodGroup = BloodGroup.AB_NEGATIVE,
            unitsRequired = 2,
            hospital = "Cedar Sinai Regional",
            city = "Austin",
            state = "TX",
            contactName = "Robert Lee",
            contactPhone = "+1 (555) 444-5566",
            urgency = UrgencyLevel.CRITICAL,
            note = "Rare blood group emergency pediatric care.",
            status = RequestStatus.OPEN,
            createdAt = "3 hours ago"
        )
    )

    private val initialDonationHistory = listOf(
        DonationRecord(
            id = "hist_1",
            donorId = "d1",
            date = "2024-05-10",
            donationCenter = "Metropolitan Blood Services",
            city = "New York, NY",
            type = "Whole Blood",
            units = 1,
            volumeMl = 450,
            impact = "Transfused to emergency pediatric trauma patient",
            isVerified = true
        ),
        DonationRecord(
            id = "hist_2",
            donorId = "d1",
            date = "2024-01-18",
            donationCenter = "Downtown Community Blood Drive",
            city = "New York, NY",
            type = "Whole Blood",
            units = 1,
            volumeMl = 450,
            impact = "Utilized during complex orthopedic reconstructive surgery",
            isVerified = true
        ),
        DonationRecord(
            id = "hist_3",
            donorId = "d1",
            date = "2023-09-05",
            donationCenter = "St. Jude Regional Blood Center",
            city = "New York, NY",
            type = "Double Red Cells",
            units = 2,
            volumeMl = 500,
            impact = "Supplied to critical ICU thalassemia emergency ward",
            isVerified = true
        )
    )

    private val initialAppointments = listOf(
        DonationAppointment(
            id = "apt_1",
            donorId = "d1",
            date = "2026-10-18",
            time = "10:30 AM",
            donationCenter = "Metropolitan Blood Services - Main Center",
            address = "420 Lexington Ave, Suite 300, New York, NY 10017",
            type = "Whole Blood",
            status = "CONFIRMED",
            notes = "Please hydrate well with water and bring your photo ID."
        ),
        DonationAppointment(
            id = "apt_2",
            donorId = "d1",
            date = "2026-11-25",
            time = "02:15 PM",
            donationCenter = "Midtown Mobile Donation Bus",
            address = "Rockefeller Center Plaza, New York, NY 10020",
            type = "Whole Blood",
            status = "CONFIRMED",
            notes = "Mobile unit located at West 49th entrance."
        )
    )

    private val initialNotifications = listOf(
        DonorNotification(
            id = "notif_1",
            donorId = "d1",
            requestId = "r1",
            bloodGroup = BloodGroup.O_NEGATIVE,
            city = "New York",
            state = "NY",
            patientName = "Michael Brown",
            hospital = "Metropolitan General Hospital",
            unitsNeeded = 3,
            urgency = UrgencyLevel.CRITICAL,
            type = NotificationType.EXACT_CITY_MATCH,
            title = "🚨 Emergency O- Blood Request in New York!",
            message = "Michael Brown urgently requires 3 units of O- blood at Metropolitan General Hospital in New York. You match both blood group and city!",
            contactName = "Emily Brown (Sister)",
            contactPhone = "+1 (555) 111-2233",
            isRead = false,
            status = "PENDING",
            createdAt = "10 mins ago"
        ),
        DonorNotification(
            id = "notif_2",
            donorId = "d3",
            requestId = "r2",
            bloodGroup = BloodGroup.B_POSITIVE,
            city = "Chicago",
            state = "IL",
            patientName = "Sophia Ramirez",
            hospital = "St. Jude Medical Center",
            unitsNeeded = 2,
            urgency = UrgencyLevel.URGENT,
            type = NotificationType.EXACT_CITY_MATCH,
            title = "🚨 Urgent B+ Blood Request in Chicago!",
            message = "Sophia Ramirez requires 2 units of B+ blood at St. Jude Medical Center in Chicago. Your location and blood type match this appeal!",
            contactName = "Carlos Ramirez",
            contactPhone = "+1 (555) 222-3344",
            isRead = false,
            status = "PENDING",
            createdAt = "1 hour ago"
        ),
        DonorNotification(
            id = "notif_3",
            donorId = "d1",
            requestId = "r3",
            bloodGroup = BloodGroup.O_NEGATIVE,
            city = "New York",
            state = "NY",
            patientName = "Direct Patient",
            hospital = "Mount Sinai Hospital",
            unitsNeeded = 2,
            urgency = UrgencyLevel.CRITICAL,
            type = NotificationType.DIRECT_REQUEST,
            title = "Direct Blood Appeal for You!",
            message = "Dr. Rebecca Stern directly requested 2 units of O- whole blood for emergency cardiac surgery at Mount Sinai.",
            contactName = "Dr. Rebecca Stern",
            contactPhone = "+1 (555) 234-8899",
            isRead = false,
            status = "PENDING",
            createdAt = "30 mins ago"
        )
    )

    private val _donors = MutableStateFlow<List<Donor>>(initialDonors)
    val donors: StateFlow<List<Donor>> = _donors.asStateFlow()

    private val _requests = MutableStateFlow<List<BloodRequest>>(initialRequests)
    val requests: StateFlow<List<BloodRequest>> = _requests.asStateFlow()

    private val _notifications = MutableStateFlow<List<DonorNotification>>(initialNotifications)
    val notifications: StateFlow<List<DonorNotification>> = _notifications.asStateFlow()

    private val _donationHistory = MutableStateFlow<List<DonationRecord>>(initialDonationHistory)
    val donationHistory: StateFlow<List<DonationRecord>> = _donationHistory.asStateFlow()

    private val _appointments = MutableStateFlow<List<DonationAppointment>>(initialAppointments)
    val appointments: StateFlow<List<DonationAppointment>> = _appointments.asStateFlow()

    private val _stats = MutableStateFlow(
        DonationStats(
            totalDonors = initialDonors.size,
            livesSaved = 142,
            activeRequests = initialRequests.count { it.status == RequestStatus.OPEN },
            unitsDonated = 298
        )
    )
    val stats: StateFlow<DonationStats> = _stats.asStateFlow()

    fun scheduleAppointment(
        donorId: String,
        date: String,
        time: String,
        donationCenter: String,
        address: String,
        type: String = "Whole Blood",
        notes: String = ""
    ): DonationAppointment {
        val appointment = DonationAppointment(
            id = "apt_" + UUID.randomUUID().toString().take(8),
            donorId = donorId,
            date = date,
            time = time,
            donationCenter = donationCenter,
            address = address,
            type = type,
            status = "CONFIRMED",
            notes = notes
        )
        _appointments.update { listOf(appointment) + it }
        return appointment
    }

    fun cancelAppointment(appointmentId: String) {
        _appointments.update { list -> list.filter { it.id != appointmentId } }
    }

    fun logDonation(
        donorId: String,
        date: String,
        donationCenter: String,
        city: String,
        type: String = "Whole Blood",
        units: Int = 1,
        volumeMl: Int = 450,
        impact: String = "Transfused to emergency surgical patient"
    ): DonationRecord {
        val record = DonationRecord(
            id = "hist_" + UUID.randomUUID().toString().take(8),
            donorId = donorId,
            date = date,
            donationCenter = donationCenter,
            city = city,
            type = type,
            units = units,
            volumeMl = volumeMl,
            impact = impact,
            isVerified = true
        )
        _donationHistory.update { listOf(record) + it }
        _donors.update { list ->
            list.map { donor ->
                if (donor.id == donorId) {
                    donor.copy(
                        totalDonations = donor.totalDonations + units,
                        lastDonationDate = date
                    )
                } else donor
            }
        }
        recalculateStats()
        return record
    }

    fun addDonor(
        name: String,
        bloodGroup: BloodGroup,
        city: String,
        state: String,
        phone: String,
        email: String
    ): Donor {
        val newDonor = Donor(
            id = UUID.randomUUID().toString(),
            name = name,
            bloodGroup = bloodGroup,
            city = city,
            state = state,
            phone = phone,
            email = email,
            isAvailable = true,
            totalDonations = 0,
            lastDonationDate = "Never"
        )
        _donors.update { listOf(newDonor) + it }
        recalculateStats()
        return newDonor
    }

    fun addBloodRequest(
        patientName: String,
        bloodGroup: BloodGroup,
        unitsRequired: Int,
        hospital: String,
        hospitalAddress: String = "",
        city: String,
        state: String,
        contactName: String,
        contactPhone: String,
        urgency: UrgencyLevel,
        note: String,
        requestedDonorName: String? = null
    ): BloodRequest {
        val newRequest = BloodRequest(
            id = UUID.randomUUID().toString(),
            patientName = patientName,
            bloodGroup = bloodGroup,
            unitsRequired = unitsRequired,
            hospital = hospital,
            hospitalAddress = hospitalAddress,
            city = city,
            state = state,
            contactName = contactName,
            contactPhone = contactPhone,
            urgency = urgency,
            note = note,
            requestedDonorName = requestedDonorName,
            status = RequestStatus.OPEN,
            createdAt = "Just now"
        )
        _requests.update { listOf(newRequest) + it }

        // Alert donors matching exact blood group in the same city
        val cityMatchDonors = _donors.value.filter {
            it.bloodGroup == bloodGroup && it.city.equals(city.trim(), ignoreCase = true)
        }

        val cityNotifications = cityMatchDonors.map { donor ->
            DonorNotification(
                id = "notif_" + UUID.randomUUID().toString().take(8),
                donorId = donor.id,
                requestId = newRequest.id,
                bloodGroup = bloodGroup,
                city = city,
                state = state,
                patientName = patientName,
                hospital = hospital,
                unitsNeeded = unitsRequired,
                urgency = urgency,
                type = NotificationType.EXACT_CITY_MATCH,
                title = "🚨 Emergency ${bloodGroup.label} in ${city}!",
                message = "${patientName} urgently needs ${unitsRequired} unit(s) of your blood type (${bloodGroup.label}) at ${hospital} in ${city}!",
                contactName = contactName,
                contactPhone = contactPhone,
                isRead = false,
                status = "PENDING",
                createdAt = "Just now"
            )
        }

        // Direct request alert if target donor was requested by name
        val directDonor = if (requestedDonorName != null) {
            _donors.value.find { it.name.equals(requestedDonorName, ignoreCase = true) }
        } else null

        val directNotification = directDonor?.let { donor ->
            if (!cityMatchDonors.any { it.id == donor.id }) {
                listOf(
                    DonorNotification(
                        id = "notif_" + UUID.randomUUID().toString().take(8),
                        donorId = donor.id,
                        requestId = newRequest.id,
                        bloodGroup = bloodGroup,
                        city = city,
                        state = state,
                        patientName = patientName,
                        hospital = hospital,
                        unitsNeeded = unitsRequired,
                        urgency = urgency,
                        type = NotificationType.DIRECT_REQUEST,
                        title = "🚨 Direct Blood Appeal for You!",
                        message = "${contactName} directly requested ${unitsRequired} unit(s) of ${bloodGroup.label} blood for ${patientName} at ${hospital}.",
                        contactName = contactName,
                        contactPhone = contactPhone,
                        isRead = false,
                        status = "PENDING",
                        createdAt = "Just now"
                    )
                )
            } else emptyList()
        } ?: emptyList()

        _notifications.update { current ->
            cityNotifications + directNotification + current
        }

        recalculateStats()
        return newRequest
    }

    fun markNotificationRead(notificationId: String) {
        _notifications.update { list ->
            list.map { notif ->
                if (notif.id == notificationId) notif.copy(isRead = true) else notif
            }
        }
    }

    fun markAllNotificationsRead(donorId: String) {
        _notifications.update { list ->
            list.map { notif ->
                if (notif.donorId == donorId) notif.copy(isRead = true) else notif
            }
        }
    }

    fun respondToNotification(notificationId: String, accept: Boolean): Boolean {
        var acceptedNotif: DonorNotification? = null
        _notifications.update { list ->
            list.map { notif ->
                if (notif.id == notificationId) {
                    val status = if (accept) "ACCEPTED" else "DECLINED"
                    val updated = notif.copy(status = status, isRead = true)
                    if (accept) acceptedNotif = updated
                    updated
                } else notif
            }
        }
        if (accept && acceptedNotif != null) {
            val target = acceptedNotif!!
            scheduleAppointment(
                donorId = target.donorId,
                date = "Tomorrow",
                time = "10:00 AM",
                donationCenter = target.hospital,
                address = "${target.hospital}, ${target.city}",
                type = "Whole Blood",
                notes = "Auto-scheduled in response to ${target.patientName}'s ${target.bloodGroup.label} blood request."
            )
        }
        return accept
    }

    fun fulfillRequest(requestId: String) {
        _requests.update { list ->
            list.map { req ->
                if (req.id == requestId) req.copy(status = RequestStatus.FULFILLED) else req
            }
        }
        _stats.update { it.copy(livesSaved = it.livesSaved + 1) }
        recalculateStats()
    }

    fun toggleDonorAvailability(donorId: String) {
        _donors.update { list ->
            list.map { d ->
                if (d.id == donorId) d.copy(isAvailable = !d.isAvailable) else d
            }
        }
    }

    private fun recalculateStats() {
        val activeCount = _requests.value.count { it.status == RequestStatus.OPEN }
        val donorCount = _donors.value.size
        _stats.update { current ->
            current.copy(
                totalDonors = donorCount,
                activeRequests = activeCount
            )
        }
    }

    fun getCompatibilityMatrix(): List<CompatibilityInfo> {
        return listOf(
            CompatibilityInfo(
                bloodGroup = BloodGroup.O_NEGATIVE,
                canGiveTo = BloodGroup.entries,
                canReceiveFrom = listOf(BloodGroup.O_NEGATIVE),
                isUniversalDonor = true,
                description = "Universal Red Cell Donor: Can donate red blood cells to anyone of any blood group."
            ),
            CompatibilityInfo(
                bloodGroup = BloodGroup.O_POSITIVE,
                canGiveTo = listOf(BloodGroup.O_POSITIVE, BloodGroup.A_POSITIVE, BloodGroup.B_POSITIVE, BloodGroup.AB_POSITIVE),
                canReceiveFrom = listOf(BloodGroup.O_POSITIVE, BloodGroup.O_NEGATIVE),
                description = "Most common blood group. Can help all positive blood types."
            ),
            CompatibilityInfo(
                bloodGroup = BloodGroup.A_NEGATIVE,
                canGiveTo = listOf(BloodGroup.A_NEGATIVE, BloodGroup.A_POSITIVE, BloodGroup.AB_NEGATIVE, BloodGroup.AB_POSITIVE),
                canReceiveFrom = listOf(BloodGroup.A_NEGATIVE, BloodGroup.O_NEGATIVE),
                description = "Can give to all A and AB patients."
            ),
            CompatibilityInfo(
                bloodGroup = BloodGroup.A_POSITIVE,
                canGiveTo = listOf(BloodGroup.A_POSITIVE, BloodGroup.AB_POSITIVE),
                canReceiveFrom = listOf(BloodGroup.A_POSITIVE, BloodGroup.A_NEGATIVE, BloodGroup.O_POSITIVE, BloodGroup.O_NEGATIVE),
                description = "Second most common type. Highly needed in general surgeries."
            ),
            CompatibilityInfo(
                bloodGroup = BloodGroup.B_NEGATIVE,
                canGiveTo = listOf(BloodGroup.B_NEGATIVE, BloodGroup.B_POSITIVE, BloodGroup.AB_NEGATIVE, BloodGroup.AB_POSITIVE),
                canReceiveFrom = listOf(BloodGroup.B_NEGATIVE, BloodGroup.O_NEGATIVE),
                description = "Rare blood group. Critical for trauma units."
            ),
            CompatibilityInfo(
                bloodGroup = BloodGroup.B_POSITIVE,
                canGiveTo = listOf(BloodGroup.B_POSITIVE, BloodGroup.AB_POSITIVE),
                canReceiveFrom = listOf(BloodGroup.B_POSITIVE, BloodGroup.B_NEGATIVE, BloodGroup.O_POSITIVE, BloodGroup.O_NEGATIVE),
                description = "Can donate to B+ and AB+ recipients."
            ),
            CompatibilityInfo(
                bloodGroup = BloodGroup.AB_NEGATIVE,
                canGiveTo = listOf(BloodGroup.AB_NEGATIVE, BloodGroup.AB_POSITIVE),
                canReceiveFrom = listOf(BloodGroup.AB_NEGATIVE, BloodGroup.A_NEGATIVE, BloodGroup.B_NEGATIVE, BloodGroup.O_NEGATIVE),
                description = "Rare type. Universal plasma donor."
            ),
            CompatibilityInfo(
                bloodGroup = BloodGroup.AB_POSITIVE,
                canGiveTo = listOf(BloodGroup.AB_POSITIVE),
                canReceiveFrom = BloodGroup.entries,
                isUniversalRecipient = true,
                description = "Universal Recipient: Can safely receive red blood cells from any blood group."
            )
        )
    }

    companion object {
        val instance by lazy { LifeFlowRepository() }
    }
}
