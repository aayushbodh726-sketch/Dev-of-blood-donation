package com.example.lifeflow.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.LocalHospital
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material.icons.filled.WaterDrop
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.NotificationsActive
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.lifeflow.data.LifeFlowRepository
import com.example.lifeflow.model.BloodRequest
import com.example.lifeflow.model.RequestStatus
import com.example.lifeflow.model.UrgencyLevel
import com.example.lifeflow.ui.theme.*

@Composable
fun HomeScreen(
    repository: LifeFlowRepository,
    onNavigateToDonors: () -> Unit,
    onNavigateToRequests: () -> Unit,
    onNavigateToCreateRequest: () -> Unit,
    onNavigateToRegisterDonor: () -> Unit,
    onNavigateToCompatibility: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = androidx.compose.ui.platform.LocalContext.current
    var showLoginDialog by remember { mutableStateOf(false) }
    var showNotificationsDialog by remember { mutableStateOf(false) }
    val stats by repository.stats.collectAsState()
    val requests by repository.requests.collectAsState()
    val notifications by repository.notifications.collectAsState()
    val unreadAlertsCount = remember(notifications) {
        notifications.count { !it.isRead && it.status == "PENDING" }
    }
    val openRequests = requests.filter { it.status == RequestStatus.OPEN }
    val urgentRequests = openRequests.filter { it.urgency == UrgencyLevel.CRITICAL || it.urgency == UrgencyLevel.URGENT }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .testTag("home_screen_column"),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Hero Header
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("hero_banner_card"),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color.Transparent)
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(
                            Brush.horizontalGradient(
                                colors = listOf(CrimsonRed, CrimsonDark)
                            )
                        )
                        .padding(24.dp)
                ) {
                    Column {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(44.dp)
                                    .clip(CircleShape)
                                    .background(Color.White.copy(alpha = 0.2f)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.WaterDrop,
                                    contentDescription = "LifeFlow logo",
                                    tint = Color.White,
                                    modifier = Modifier.size(26.dp)
                                )
                            }
                            Spacer(modifier = Modifier.width(12.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "LifeFlow",
                                    style = MaterialTheme.typography.headlineMedium,
                                    color = Color.White,
                                    fontWeight = FontWeight.ExtraBold
                                )
                                Text(
                                    text = "Connecting blood donors with those in need",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = Color.White.copy(alpha = 0.9f)
                                )
                            }
                            Row(
                                horizontalArrangement = Arrangement.spacedBy(8.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Box {
                                    IconButton(
                                        onClick = { showNotificationsDialog = true },
                                        modifier = Modifier
                                            .clip(CircleShape)
                                            .background(Color.White.copy(alpha = 0.2f))
                                            .testTag("home_notifications_bell_button")
                                    ) {
                                        Icon(
                                            imageVector = if (unreadAlertsCount > 0) Icons.Default.NotificationsActive else Icons.Default.Notifications,
                                            contentDescription = "Alerts and Inquiries",
                                            tint = Color.White
                                        )
                                    }
                                    if (unreadAlertsCount > 0) {
                                        Box(
                                            modifier = Modifier
                                                .align(Alignment.TopEnd)
                                                .size(18.dp)
                                                .clip(CircleShape)
                                                .background(Color.Red),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Text(
                                                text = if (unreadAlertsCount > 9) "9+" else unreadAlertsCount.toString(),
                                                color = Color.White,
                                                fontSize = 10.sp,
                                                fontWeight = FontWeight.Black
                                            )
                                        }
                                    }
                                }

                                IconButton(
                                    onClick = { showLoginDialog = true },
                                    modifier = Modifier
                                        .clip(CircleShape)
                                        .background(Color.White.copy(alpha = 0.2f))
                                        .testTag("home_login_button")
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.AccountCircle,
                                        contentDescription = "Sign In or Reset Password",
                                        tint = Color.White
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(20.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Button(
                                onClick = onNavigateToCreateRequest,
                                modifier = Modifier
                                    .weight(1f)
                                    .testTag("hero_request_blood_button"),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = Color.White,
                                    contentColor = CrimsonRed
                                ),
                                shape = RoundedCornerShape(12.dp)
                            ) {
                                Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(18.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Request Blood", fontWeight = FontWeight.Bold)
                            }

                            FilledTonalButton(
                                onClick = onNavigateToRegisterDonor,
                                modifier = Modifier
                                    .weight(1f)
                                    .testTag("hero_become_donor_button"),
                                colors = ButtonDefaults.filledTonalButtonColors(
                                    containerColor = Color.White.copy(alpha = 0.25f),
                                    contentColor = Color.White
                                ),
                                shape = RoundedCornerShape(12.dp)
                            ) {
                                Icon(Icons.Default.Favorite, contentDescription = null, modifier = Modifier.size(18.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Donate", fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        }

        // Stats Overview Grid
        item {
            Text(
                text = "Impact & Availability",
                style = MaterialTheme.typography.titleLarge,
                color = MaterialTheme.colorScheme.onBackground
            )
            Spacer(modifier = Modifier.height(10.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                StatCard(
                    title = "Total Donors",
                    value = stats.totalDonors.toString(),
                    icon = Icons.Default.People,
                    color = CrimsonRed,
                    modifier = Modifier
                        .weight(1f)
                        .testTag("stat_card_donors")
                )
                StatCard(
                    title = "Lives Saved",
                    value = stats.livesSaved.toString(),
                    icon = Icons.Default.Favorite,
                    color = SuccessGreen,
                    modifier = Modifier
                        .weight(1f)
                        .testTag("stat_card_lives_saved")
                )
            }
            Spacer(modifier = Modifier.height(10.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                StatCard(
                    title = "Active Requests",
                    value = stats.activeRequests.toString(),
                    icon = Icons.Default.Warning,
                    color = UrgentOrange,
                    modifier = Modifier
                        .weight(1f)
                        .testTag("stat_card_active_requests")
                )
                StatCard(
                    title = "Units Donated",
                    value = stats.unitsDonated.toString(),
                    icon = Icons.Default.WaterDrop,
                    color = InfoBlue,
                    modifier = Modifier
                        .weight(1f)
                        .testTag("stat_card_units_donated")
                )
            }
        }

        // Quick Navigation Tiles
        item {
            Text(
                text = "Quick Services",
                style = MaterialTheme.typography.titleLarge,
                color = MaterialTheme.colorScheme.onBackground
            )
            Spacer(modifier = Modifier.height(10.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                QuickActionTile(
                    title = "Find Donors",
                    subtitle = "Search by group & city",
                    icon = Icons.Default.Search,
                    onClick = onNavigateToDonors,
                    modifier = Modifier
                        .weight(1f)
                        .testTag("quick_action_find_donors")
                )
                QuickActionTile(
                    title = "Compatibility",
                    subtitle = "Blood match chart",
                    icon = Icons.Default.LocalHospital,
                    onClick = onNavigateToCompatibility,
                    modifier = Modifier
                        .weight(1f)
                        .testTag("quick_action_compatibility")
                )
            }
        }

        // Urgent Blood Requests Alert Section
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(10.dp)
                            .clip(CircleShape)
                            .background(CriticalRed)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Urgent Appeals (${urgentRequests.size})",
                        style = MaterialTheme.typography.titleLarge,
                        color = MaterialTheme.colorScheme.onBackground
                    )
                }
                TextButton(
                    onClick = onNavigateToRequests,
                    modifier = Modifier.testTag("view_all_requests_button")
                ) {
                    Text("View All", color = CrimsonRed, fontWeight = FontWeight.Bold)
                }
            }
        }

        if (urgentRequests.isEmpty()) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Box(modifier = Modifier.padding(24.dp), contentAlignment = Alignment.Center) {
                        Text(
                            text = "No urgent appeals right now. Regular requests remain open.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = GrayTextSecondary
                        )
                    }
                }
            }
        } else {
            items(urgentRequests) { request ->
                UrgentRequestCard(
                    request = request,
                    onFulfill = {
                        repository.fulfillRequest(request.id)
                        android.widget.Toast.makeText(
                            context,
                            "Thank you! You responded to donate for ${request.patientName}. Hospital alerted.",
                            android.widget.Toast.LENGTH_LONG
                        ).show()
                    }
                )
            }
        }
    }

    if (showLoginDialog) {
        LoginDialog(onDismiss = { showLoginDialog = false })
    }

    if (showNotificationsDialog) {
        NotificationsDialog(repository = repository, onDismiss = { showNotificationsDialog = false })
    }
}

@Composable
fun StatCard(
    title: String,
    value: String,
    icon: ImageVector,
    color: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(42.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(color.copy(alpha = 0.12f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = title,
                    tint = color,
                    modifier = Modifier.size(24.dp)
                )
            }
            Spacer(modifier = Modifier.width(12.dp))
            Column {
                Text(
                    text = value,
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = title,
                    style = MaterialTheme.typography.bodyMedium,
                    color = GrayTextSecondary
                )
            }
        }
    }
}

@Composable
fun QuickActionTile(
    title: String,
    subtitle: String,
    icon: ImageVector,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.clickable { onClick() },
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Icon(
                imageVector = icon,
                contentDescription = title,
                tint = CrimsonRed,
                modifier = Modifier.size(28.dp)
            )
            Spacer(modifier = Modifier.height(10.dp))
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodySmall,
                color = GrayTextSecondary
            )
        }
    }
}

@Composable
fun UrgentRequestCard(
    request: BloodRequest,
    onFulfill: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .testTag("urgent_request_card_${request.id}"),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(CrimsonRed)
                            .padding(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = request.bloodGroup.label,
                            color = Color.White,
                            fontWeight = FontWeight.ExtraBold,
                            fontSize = 16.sp
                        )
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(
                            text = request.patientName,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "${request.unitsRequired} unit(s) needed",
                            style = MaterialTheme.typography.bodySmall,
                            color = GrayTextSecondary
                        )
                    }
                }

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(6.dp))
                        .background(CriticalRed.copy(alpha = 0.15f))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = if (request.urgency == UrgencyLevel.CRITICAL) "CRITICAL" else "URGENT",
                        color = CriticalRed,
                        fontWeight = FontWeight.Bold,
                        fontSize = 11.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))
            Text(
                text = "📍 ${request.hospital}, ${request.city}",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurface
            )

            if (request.note.isNotEmpty()) {
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "\"${request.note}\"",
                    style = MaterialTheme.typography.bodySmall,
                    color = GrayTextSecondary
                )
            }

            Spacer(modifier = Modifier.height(12.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Contact: ${request.contactPhone}",
                    style = MaterialTheme.typography.bodySmall,
                    fontWeight = FontWeight.Medium,
                    color = GrayTextPrimary
                )
                Button(
                    onClick = onFulfill,
                    modifier = Modifier.testTag("fulfill_button_${request.id}"),
                    colors = ButtonDefaults.buttonColors(containerColor = CrimsonRed),
                    shape = RoundedCornerShape(8.dp),
                    contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp)
                ) {
                    Text("I Can Donate", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
