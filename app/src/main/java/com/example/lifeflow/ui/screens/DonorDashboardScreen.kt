package com.example.lifeflow.ui.screens

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.lifeflow.data.LifeFlowRepository
import com.example.lifeflow.model.DonationAppointment
import com.example.lifeflow.model.DonationRecord
import com.example.lifeflow.model.Donor
import com.example.lifeflow.ui.theme.*

data class DonorRankTier(
    val level: Int,
    val name: String,
    val tier: String,
    val minDonations: Int,
    val badgeColor: Color,
    val perk: String,
    val description: String
)

val DONOR_RANK_TIERS = listOf(
    DonorRankTier(1, "First Drop Lifesaver", "Rookie", 1, Color(0xFFEF4444), "Digital Donor ID Card", "Began the journey by giving your first whole blood donation."),
    DonorRankTier(2, "Bronze Lifesaver", "Bronze", 3, Color(0xFFB45309), "Community Donor Pin & Emergency Alert", "Demonstrated commitment with 3 verified blood donations."),
    DonorRankTier(3, "Silver Lifesaver", "Silver", 5, Color(0xFF64748B), "Priority Match Queue & Certificate", "Reached 5 donations, impacting over 15 hospital patients."),
    DonorRankTier(4, "Gold Lifesaver", "Gold", 10, Color(0xFFF59E0B), "Hospital Honor Roll & VIP Donor Desk", "Milestone of 10 donations! Sustained dozens of surgeries."),
    DonorRankTier(5, "Platinum Hero", "Platinum", 15, Color(0xFF9333EA), "Regional Wall of Fame & Annual Gala", "Answered the critical urgent call 15 times."),
    DonorRankTier(6, "Legendary Guardian", "Legendary", 25, Color(0xFF059669), "Lifetime Guardian Medallion", "Highest tier: over 25 donations and a lifetime of saving lives.")
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DonorDashboardScreen(
    repository: LifeFlowRepository,
    onNavigateToCreateRequest: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val donors by repository.donors.collectAsState()
    val allHistory by repository.donationHistory.collectAsState()
    val allAppointments by repository.appointments.collectAsState()

    var currentDonorId by remember { mutableStateOf(donors.firstOrNull()?.id ?: "d1") }
    val currentDonor = donors.find { it.id == currentDonorId } ?: donors.firstOrNull()

    val allNotifications by repository.notifications.collectAsState()
    val donorNotifs = remember(currentDonorId, allNotifications) {
        allNotifications.filter { it.donorId == currentDonorId }
    }
    val unreadAlertsCount = remember(donorNotifs) {
        donorNotifs.count { !it.isRead && it.status == "PENDING" }
    }

    var selectedTab by remember { mutableIntStateOf(0) } // 0: Overview & Appointments, 1: Ranks & Badges, 2: History
    var showBookDialog by remember { mutableStateOf(false) }
    var showLogDialog by remember { mutableStateOf(false) }
    var showNotificationsDialog by remember { mutableStateOf(false) }
    var selectedRankDetail by remember { mutableStateOf<DonorRankTier?>(null) }

    val donorHistory = remember(currentDonorId, allHistory) {
        allHistory.filter { it.donorId == currentDonorId }
    }
    val donorAppointments = remember(currentDonorId, allAppointments) {
        allAppointments.filter { it.donorId == currentDonorId }
    }

    val totalDonations = currentDonor?.totalDonations ?: donorHistory.size
    val livesSaved = totalDonations * 3
    val volumeLiters = String.format("%.1f", (totalDonations * 450) / 1000f)

    // Calculate rank
    val currentRank = remember(totalDonations) {
        var highest = DONOR_RANK_TIERS[0]
        for (tier in DONOR_RANK_TIERS) {
            if (totalDonations >= tier.minDonations) {
                highest = tier
            }
        }
        highest
    }

    val nextRank = remember(totalDonations) {
        DONOR_RANK_TIERS.firstOrNull { it.minDonations > totalDonations }
    }

    val rankProgress = remember(totalDonations, currentRank, nextRank) {
        if (nextRank == null) 1f
        else {
            val diff = (nextRank.minDonations - currentRank.minDonations).toFloat()
            val done = (totalDonations - currentRank.minDonations).toFloat()
            (done / diff).coerceIn(0f, 1f)
        }
    }

    Scaffold(
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = { showBookDialog = true },
                modifier = Modifier.testTag("dashboard_book_appointment_fab"),
                containerColor = CrimsonRed,
                contentColor = Color.White,
                icon = { Icon(Icons.Default.DateRange, contentDescription = "Book Appointment") },
                text = { Text("Book Appointment", fontWeight = FontWeight.Bold) }
            )
        }
    ) { innerPadding ->
        LazyColumn(
            modifier = modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // HEADER PROFILE CARD
            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("donor_dashboard_profile_card"),
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.Transparent)
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(
                                Brush.horizontalGradient(
                                    colors = listOf(CrimsonDark, CrimsonRed, CrimsonDeep)
                                )
                            )
                            .padding(20.dp)
                    ) {
                        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Box(
                                        modifier = Modifier
                                            .size(54.dp)
                                            .clip(RoundedCornerShape(14.dp))
                                            .background(Color.White),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text(
                                            text = currentDonor?.bloodGroup?.label ?: "O+",
                                            color = CrimsonRed,
                                            fontWeight = FontWeight.Black,
                                            fontSize = 20.sp
                                        )
                                    }
                                    Spacer(modifier = Modifier.width(14.dp))
                                    Column {
                                        Text(
                                            text = currentDonor?.name ?: "Blood Donor",
                                            style = MaterialTheme.typography.titleLarge,
                                            fontWeight = FontWeight.Bold,
                                            color = Color.White
                                        )
                                        Row(verticalAlignment = Alignment.CenterVertically) {
                                            Text(
                                                text = "📍 ${currentDonor?.city}, ${currentDonor?.state}",
                                                style = MaterialTheme.typography.bodySmall,
                                                color = CrimsonLight.copy(alpha = 0.9f)
                                            )
                                            Spacer(modifier = Modifier.width(6.dp))
                                            Box(
                                                modifier = Modifier
                                                    .clip(RoundedCornerShape(12.dp))
                                                    .background(Color.White.copy(alpha = 0.25f))
                                                    .padding(horizontal = 8.dp, vertical = 2.dp)
                                            ) {
                                                Text(
                                                    text = "${currentRank.tier} Badge",
                                                    color = Color.White,
                                                    fontSize = 11.sp,
                                                    fontWeight = FontWeight.Bold
                                                )
                                            }
                                        }
                                    }
                                }

                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    // Notification Bell for this Donor
                                    Box {
                                        IconButton(
                                            onClick = { showNotificationsDialog = true },
                                            modifier = Modifier
                                                .size(36.dp)
                                                .clip(CircleShape)
                                                .background(Color.White.copy(alpha = 0.2f))
                                                .testTag("dashboard_notifications_bell_button")
                                        ) {
                                            Icon(
                                                imageVector = if (unreadAlertsCount > 0) Icons.Default.NotificationsActive else Icons.Default.Notifications,
                                                contentDescription = "Alerts",
                                                tint = Color.White,
                                                modifier = Modifier.size(18.dp)
                                            )
                                        }
                                        if (unreadAlertsCount > 0) {
                                            Box(
                                                modifier = Modifier
                                                    .align(Alignment.TopEnd)
                                                    .size(16.dp)
                                                    .clip(CircleShape)
                                                    .background(Color.Red),
                                                contentAlignment = Alignment.Center
                                            ) {
                                                Text(
                                                    text = unreadAlertsCount.toString(),
                                                    color = Color.White,
                                                    fontSize = 9.sp,
                                                    fontWeight = FontWeight.Black
                                                )
                                            }
                                        }
                                    }

                                    // Availability Toggle Badge
                                    currentDonor?.let { donor ->
                                        Box(
                                            modifier = Modifier
                                                .clip(RoundedCornerShape(20.dp))
                                                .background(if (donor.isAvailable) SuccessGreen.copy(alpha = 0.25f) else Color.White.copy(alpha = 0.2f))
                                                .clickable {
                                                    repository.toggleDonorAvailability(donor.id)
                                                    Toast.makeText(
                                                        context,
                                                        "Availability status updated to ${if (!donor.isAvailable) "Available" else "Busy"}",
                                                        Toast.LENGTH_SHORT
                                                    ).show()
                                                }
                                                .padding(horizontal = 10.dp, vertical = 5.dp)
                                        ) {
                                            Text(
                                                text = if (donor.isAvailable) "✓ Available" else "Busy",
                                                color = Color.White,
                                                fontWeight = FontWeight.Bold,
                                                fontSize = 11.sp
                                            )
                                        }
                                    }
                                }
                            }

                            // STATS STRIP
                            HorizontalDivider(color = Color.White.copy(alpha = 0.2f))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Column {
                                    Text("Donations", fontSize = 11.sp, color = CrimsonLight)
                                    Text("$totalDonations times", fontSize = 16.sp, fontWeight = FontWeight.Black, color = Color.White)
                                }
                                Column {
                                    Text("Lives Saved", fontSize = 11.sp, color = CrimsonLight)
                                    Text("~$livesSaved patients", fontSize = 16.sp, fontWeight = FontWeight.Black, color = Color.White)
                                }
                                Column {
                                    Text("Donor Rank", fontSize = 11.sp, color = CrimsonLight)
                                    Text(currentRank.tier, fontSize = 16.sp, fontWeight = FontWeight.Black, color = Color.White)
                                }
                                Column {
                                    Text("Status", fontSize = 11.sp, color = CrimsonLight)
                                    Text("Eligible", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = SuccessGreen)
                                }
                            }
                        }
                    }
                }
            }

            // TABS (Appointments, Ranks & Badges, History)
            item {
                TabRow(
                    selectedTabIndex = selectedTab,
                    modifier = Modifier.clip(RoundedCornerShape(12.dp)),
                    containerColor = MaterialTheme.colorScheme.surfaceVariant
                ) {
                    Tab(
                        selected = selectedTab == 0,
                        onClick = { selectedTab = 0 },
                        text = {
                            Text("Appointments (${donorAppointments.size})", fontWeight = FontWeight.Bold)
                        }
                    )
                    Tab(
                        selected = selectedTab == 1,
                        onClick = { selectedTab = 1 },
                        text = {
                            Text("Ranks & Badges (${currentRank.tier})", fontWeight = FontWeight.Bold)
                        }
                    )
                    Tab(
                        selected = selectedTab == 2,
                        onClick = { selectedTab = 2 },
                        text = {
                            Text("History (${donorHistory.size})", fontWeight = FontWeight.Bold)
                        }
                    )
                }
            }

            // TAB 0: APPOINTMENTS
            if (selectedTab == 0) {
                if (donorAppointments.isEmpty()) {
                    item {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                            shape = RoundedCornerShape(16.dp)
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(32.dp),
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Icon(Icons.Default.EventAvailable, contentDescription = null, tint = GrayTextMuted, modifier = Modifier.size(44.dp))
                                Text("No appointments scheduled", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
                                Text("Book a donation slot at your nearest hospital or mobile drive.", style = MaterialTheme.typography.bodySmall, color = GrayTextSecondary)
                                Button(
                                    onClick = { showBookDialog = true },
                                    colors = ButtonDefaults.buttonColors(containerColor = CrimsonRed),
                                    shape = RoundedCornerShape(10.dp)
                                ) {
                                    Text("Schedule Now")
                                }
                            }
                        }
                    }
                } else {
                    items(donorAppointments) { apt ->
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("appointment_card_${apt.id}"),
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                            elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                        ) {
                            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(Icons.Default.AccessTime, contentDescription = null, tint = CrimsonRed, modifier = Modifier.size(18.dp))
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text("${apt.date} at ${apt.time}", fontWeight = FontWeight.Bold, color = CrimsonDark)
                                    }
                                    Badge(containerColor = SuccessGreen.copy(alpha = 0.15f)) {
                                        Text(apt.status, color = SuccessGreen, fontWeight = FontWeight.Bold)
                                    }
                                }

                                Text(apt.donationCenter, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium)
                                Text("📍 ${apt.address}", style = MaterialTheme.typography.bodySmall, color = GrayTextSecondary)

                                if (apt.notes.isNotBlank()) {
                                    Text("Note: ${apt.notes}", style = MaterialTheme.typography.bodySmall, color = GrayTextMuted)
                                }

                                HorizontalDivider(color = GrayBorder)
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text("Type: ${apt.type}", style = MaterialTheme.typography.bodySmall, fontWeight = FontWeight.SemiBold)
                                    TextButton(
                                        onClick = {
                                            repository.cancelAppointment(apt.id)
                                            Toast.makeText(context, "Appointment cancelled.", Toast.LENGTH_SHORT).show()
                                        }
                                    ) {
                                        Text("Cancel", color = CriticalRed, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // TAB 1: DONOR RANKS & BADGES SYSTEM
            if (selectedTab == 1) {
                // CURRENT RANK SPOTLIGHT CARD
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(20.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                    ) {
                        Column(modifier = Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Box(
                                        modifier = Modifier
                                            .size(52.dp)
                                            .clip(RoundedCornerShape(14.dp))
                                            .background(currentRank.badgeColor),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(Icons.Default.Award, contentDescription = null, tint = Color.White, modifier = Modifier.size(30.dp))
                                    }
                                    Spacer(modifier = Modifier.width(12.dp))
                                    Column {
                                        Text(
                                            text = "Rank Tier ${currentRank.level}: ${currentRank.name}",
                                            style = MaterialTheme.typography.titleMedium,
                                            fontWeight = FontWeight.Black
                                        )
                                        Text(
                                            text = "${currentRank.tier} Lifesaver Badge Unlocked",
                                            style = MaterialTheme.typography.bodySmall,
                                            color = GrayTextSecondary
                                        )
                                    }
                                }
                            }

                            Text(
                                text = currentRank.description,
                                style = MaterialTheme.typography.bodySmall,
                                color = GrayTextSecondary
                            )

                            // Progress Bar to next rank
                            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text(
                                        text = if (nextRank != null) "Next Rank: ${nextRank.name}" else "Highest Rank Reached!",
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = CrimsonDark
                                    )
                                    Text(
                                        text = if (nextRank != null) "${nextRank.minDonations - totalDonations} more donations needed" else "100%",
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = CrimsonRed
                                    )
                                }
                                LinearProgressIndicator(
                                    progress = { rankProgress },
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(10.dp)
                                        .clip(RoundedCornerShape(5.dp)),
                                    color = CrimsonRed,
                                    trackColor = GrayBorder
                                )
                            }

                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(CrimsonLight.copy(alpha = 0.35f))
                                    .padding(12.dp)
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(Icons.Default.Star, contentDescription = null, tint = CrimsonRed, modifier = Modifier.size(18.dp))
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = "Perk: ${currentRank.perk}",
                                        style = MaterialTheme.typography.bodySmall,
                                        fontWeight = FontWeight.Bold,
                                        color = CrimsonDark
                                    )
                                }
                            }
                        }
                    }
                }

                // ALL BADGES ROADMAP
                item {
                    Text(
                        text = "All Lifesaver Badges",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                }

                items(DONOR_RANK_TIERS) { rank ->
                    val isUnlocked = totalDonations >= rank.minDonations
                    val isCurrent = rank.tier == currentRank.tier

                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { selectedRankDetail = rank }
                            .testTag("rank_badge_card_${rank.tier.lowercase()}"),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = if (isCurrent) CrimsonLight.copy(alpha = 0.2f) else MaterialTheme.colorScheme.surface
                        ),
                        border = if (isCurrent) androidx.compose.foundation.BorderStroke(1.5.dp, CrimsonRed) else null,
                        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                                Box(
                                    modifier = Modifier
                                        .size(46.dp)
                                        .clip(RoundedCornerShape(12.dp))
                                        .background(if (isUnlocked) rank.badgeColor else GrayBorder),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        imageVector = if (isUnlocked) Icons.Default.Award else Icons.Default.Lock,
                                        contentDescription = null,
                                        tint = if (isUnlocked) Color.White else GrayTextMuted,
                                        modifier = Modifier.size(24.dp)
                                    )
                                }
                                Spacer(modifier = Modifier.width(12.dp))
                                Column {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Text(rank.name, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleSmall)
                                        if (isCurrent) {
                                            Spacer(modifier = Modifier.width(6.dp))
                                            Badge(containerColor = CrimsonRed) {
                                                Text("CURRENT", color = Color.White, fontSize = 9.sp)
                                            }
                                        }
                                    }
                                    Text("${rank.minDonations} donations required", style = MaterialTheme.typography.bodySmall, color = GrayTextSecondary)
                                    Text("Perk: ${rank.perk}", style = MaterialTheme.typography.bodySmall, color = GrayTextMuted, maxLines = 1)
                                }
                            }

                            if (isUnlocked) {
                                Badge(containerColor = SuccessGreen.copy(alpha = 0.15f)) {
                                    Text("✓ Unlocked", color = SuccessGreen, fontWeight = FontWeight.Bold)
                                }
                            } else {
                                Badge(containerColor = GrayBorder) {
                                    Text("${rank.minDonations - totalDonations} needed", color = GrayTextSecondary)
                                }
                            }
                        }
                    }
                }
            }

            // TAB 2: DONATION HISTORY
            if (selectedTab == 2) {
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Verified Donation Records", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium)
                        TextButton(onClick = { showLogDialog = true }) {
                            Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Record Past Donation", color = CrimsonRed, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        }
                    }
                }

                if (donorHistory.isEmpty()) {
                    item {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                        ) {
                            Box(modifier = Modifier.padding(28.dp), contentAlignment = Alignment.Center) {
                                Text("No past donations on record yet.", color = GrayTextSecondary)
                            }
                        }
                    }
                } else {
                    items(donorHistory) { record ->
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(14.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                            elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                        ) {
                            Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(record.donationCenter, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleSmall)
                                    Badge(containerColor = SuccessGreen.copy(alpha = 0.15f)) {
                                        Text("✓ Verified", color = SuccessGreen, fontWeight = FontWeight.Bold)
                                    }
                                }

                                Text("${record.date} • ${record.city} • ${record.type} (${record.units} unit, ${record.volumeMl}ml)", style = MaterialTheme.typography.bodySmall, color = GrayTextSecondary)
                                Text("❤️ ${record.impact}", style = MaterialTheme.typography.bodySmall, color = CrimsonDark, fontWeight = FontWeight.Medium)
                            }
                        }
                    }
                }
            }

            item {
                Spacer(modifier = Modifier.height(72.dp))
            }
        }
    }

    // BADGE DETAIL DIALOG
    selectedRankDetail?.let { rank ->
        AlertDialog(
            onDismissRequest = { selectedRankDetail = null },
            title = { Text(rank.name) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(rank.description)
                    HorizontalDivider()
                    Text("• Minimum Donations: ${rank.minDonations}")
                    Text("• Unlocked Perk: ${rank.perk}")
                    Text("• Status: ${if (totalDonations >= rank.minDonations) "Unlocked ✓" else "Locked (${rank.minDonations - totalDonations} more donations needed)"}")
                }
            },
            confirmButton = {
                Button(onClick = { selectedRankDetail = null }) {
                    Text("OK")
                }
            }
        )
    }

    // BOOK APPOINTMENT DIALOG (Calendar & Slot Selector)
    if (showBookDialog) {
        val calendarDates = remember {
            listOf(
                "2026-10-19" to "Mon, Oct 19",
                "2026-10-20" to "Tue, Oct 20",
                "2026-10-21" to "Wed, Oct 21",
                "2026-10-22" to "Thu, Oct 22",
                "2026-10-23" to "Fri, Oct 23",
                "2026-10-24" to "Sat, Oct 24"
            )
        }
        val availableSlots = remember {
            listOf("08:30 AM", "09:15 AM", "10:00 AM", "11:30 AM", "01:15 PM", "02:30 PM", "03:45 PM", "04:30 PM")
        }
        val hospitals = remember {
            listOf(
                "Metropolitan General Hospital - Blood Donor Pavilion",
                "St. Jude Regional Blood Bank",
                "Downtown Community Blood Pavilion",
                "Midtown Mobile Donation Bus"
            )
        }

        var selectedCalendarDate by remember { mutableStateOf(calendarDates[1].first) }
        var selectedSlot by remember { mutableStateOf(availableSlots[2]) }
        var selectedHospital by remember { mutableStateOf(hospitals[0]) }
        var selectedProcType by remember { mutableStateOf("Whole Blood") }
        var notes by remember { mutableStateOf("") }

        AlertDialog(
            onDismissRequest = { showBookDialog = false },
            title = {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.DateRange, contentDescription = null, tint = CrimsonRed)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Calendar Appointment Scheduler")
                }
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    // Hospital selector
                    Text("1. Select Blood Center", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = CrimsonDark)
                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        hospitals.take(3).forEach { hosp ->
                            val isSel = hosp == selectedHospital
                            Card(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable { selectedHospital = hosp },
                                shape = RoundedCornerShape(10.dp),
                                colors = CardDefaults.cardColors(
                                    containerColor = if (isSel) CrimsonLight.copy(alpha = 0.35f) else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
                                ),
                                border = if (isSel) androidx.compose.foundation.BorderStroke(1.dp, CrimsonRed) else null
                            ) {
                                Text(
                                    text = hosp,
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                                    fontSize = 11.sp,
                                    fontWeight = if (isSel) FontWeight.Bold else FontWeight.Normal,
                                    color = if (isSel) CrimsonDark else MaterialTheme.colorScheme.onSurface
                                )
                            }
                        }
                    }

                    // Calendar date chips
                    Text("2. Choose Date", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = CrimsonDark)
                    androidx.compose.foundation.lazy.LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        items(calendarDates) { (dateVal, label) ->
                            val isSel = dateVal == selectedCalendarDate
                            FilterChip(
                                selected = isSel,
                                onClick = { selectedCalendarDate = dateVal },
                                label = { Text(label, fontSize = 11.sp, fontWeight = if (isSel) FontWeight.Bold else FontWeight.Normal) },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = CrimsonRed,
                                    selectedLabelColor = Color.White
                                )
                            )
                        }
                    }

                    // Time slots chips
                    Text("3. Choose Time Slot", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = CrimsonDark)
                    androidx.compose.foundation.lazy.LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        items(availableSlots) { slot ->
                            val isSel = slot == selectedSlot
                            FilterChip(
                                selected = isSel,
                                onClick = { selectedSlot = slot },
                                label = { Text(slot, fontSize = 11.sp, fontWeight = if (isSel) FontWeight.Bold else FontWeight.Normal) },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = CrimsonRed,
                                    selectedLabelColor = Color.White
                                )
                            )
                        }
                    }

                    // Type chips
                    Text("4. Donation Procedure", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = CrimsonDark)
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        listOf("Whole Blood", "Double Red", "Platelets").forEach { type ->
                            val isSel = type == selectedProcType
                            FilterChip(
                                selected = isSel,
                                onClick = { selectedProcType = type },
                                label = { Text(type, fontSize = 10.sp) },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = CrimsonRed,
                                    selectedLabelColor = Color.White
                                )
                            )
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (currentDonor != null) {
                            repository.scheduleAppointment(
                                donorId = currentDonor.id,
                                date = selectedCalendarDate,
                                time = selectedSlot,
                                donationCenter = selectedHospital,
                                address = "${currentDonor.city} Medical Plaza",
                                type = selectedProcType,
                                notes = "Hydrate with 500ml water and bring photo ID."
                            )
                            Toast.makeText(
                                context,
                                "Appointment booked for $selectedCalendarDate at $selectedSlot!",
                                Toast.LENGTH_LONG
                            ).show()
                        }
                        showBookDialog = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = CrimsonRed)
                ) {
                    Text("Confirm Appointment")
                }
            },
            dismissButton = {
                TextButton(onClick = { showBookDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }

    // LOG DONATION DIALOG
    if (showLogDialog) {
        var date by remember { mutableStateOf("2026-09-15") }
        var center by remember { mutableStateOf("City Community Blood Drive") }
        var impact by remember { mutableStateOf("Supported hospital emergency trauma care") }

        AlertDialog(
            onDismissRequest = { showLogDialog = false },
            title = { Text("Record Past Donation") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedTextField(
                        value = center,
                        onValueChange = { center = it },
                        label = { Text("Center or Hospital *") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = date,
                        onValueChange = { date = it },
                        label = { Text("Date *") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = impact,
                        onValueChange = { impact = it },
                        label = { Text("Impact / Medical Notes") },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (currentDonor != null) {
                            repository.logDonation(
                                donorId = currentDonor.id,
                                date = date,
                                donationCenter = center,
                                city = "${currentDonor.city}, ${currentDonor.state}",
                                impact = impact
                            )
                            Toast.makeText(
                                context,
                                "Donation recorded into your official history!",
                                Toast.LENGTH_LONG
                            ).show()
                        }
                        showLogDialog = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = CrimsonRed)
                ) {
                    Text("Save to History")
                }
            },
            dismissButton = {
                TextButton(onClick = { showLogDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }

    if (showNotificationsDialog) {
        NotificationsDialog(
            repository = repository,
            onDismiss = { showNotificationsDialog = false }
        )
    }
}
