package com.example.lifeflow.ui.screens

import android.content.Intent
import android.net.Uri
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.lifeflow.data.LifeFlowRepository
import com.example.lifeflow.model.DonorNotification
import com.example.lifeflow.model.NotificationType
import com.example.lifeflow.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NotificationsDialog(
    repository: LifeFlowRepository,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val donors by repository.donors.collectAsState()
    val allNotifications by repository.notifications.collectAsState()

    var activeDonorId by remember { mutableStateOf(donors.firstOrNull()?.id ?: "d1") }
    val activeDonor = donors.find { it.id == activeDonorId } ?: donors.firstOrNull()

    var filterType by remember { mutableStateOf("ALL") } // ALL, CITY_MATCH, UNREAD

    val donorNotifs = remember(activeDonorId, allNotifications) {
        allNotifications.filter { it.donorId == activeDonorId }
    }

    val unreadCount = remember(donorNotifs) {
        donorNotifs.count { !it.isRead && it.status == "PENDING" }
    }

    val filteredList = remember(donorNotifs, filterType) {
        donorNotifs.filter { notif ->
            when (filterType) {
                "CITY_MATCH" -> notif.type == NotificationType.EXACT_CITY_MATCH
                "UNREAD" -> !notif.isRead || notif.status == "PENDING"
                else -> true
            }
        }
    }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = modifier
                .fillMaxWidth(0.95f)
                .fillMaxHeight(0.85f)
                .clip(RoundedCornerShape(24.dp))
                .testTag("notifications_dialog"),
            color = MaterialTheme.colorScheme.surface,
            tonalElevation = 6.dp
        ) {
            Column(modifier = Modifier.fillMaxSize()) {
                // Header
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(CrimsonRed)
                        .padding(horizontal = 20.dp, vertical = 16.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(38.dp)
                                    .clip(CircleShape)
                                    .background(Color.White.copy(alpha = 0.2f)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.NotificationsActive,
                                    contentDescription = "Alerts",
                                    tint = Color.White
                                )
                            }
                            Spacer(modifier = Modifier.width(12.dp))
                            Column {
                                Text(
                                    text = "Blood Alerts & Inquiries",
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White,
                                    fontSize = 18.sp
                                )
                                Text(
                                    text = "${activeDonor?.city} (${activeDonor?.bloodGroup?.label}) • $unreadCount pending",
                                    color = CrimsonLight,
                                    fontSize = 12.sp
                                )
                            }
                        }
                        IconButton(onClick = onDismiss) {
                            Icon(Icons.Default.Close, contentDescription = "Close", tint = Color.White)
                        }
                    }
                }

                // Donor Profile Switcher Row
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                        .padding(horizontal = 16.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "Viewing alerts as:",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    var expandedDropdown by remember { mutableStateOf(false) }
                    Box {
                        OutlinedButton(
                            onClick = { expandedDropdown = true },
                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                            modifier = Modifier.height(34.dp)
                        ) {
                            Text(
                                text = "${activeDonor?.name?.split(" ")?.firstOrNull()} (${activeDonor?.bloodGroup?.label})",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Icon(Icons.Default.ArrowDropDown, contentDescription = null, modifier = Modifier.size(16.dp))
                        }
                        DropdownMenu(
                            expanded = expandedDropdown,
                            onDismissRequest = { expandedDropdown = false }
                        ) {
                            donors.forEach { donor ->
                                DropdownMenuItem(
                                    text = {
                                        Text("${donor.name} (${donor.bloodGroup.label} • ${donor.city})")
                                    },
                                    onClick = {
                                        activeDonorId = donor.id
                                        expandedDropdown = false
                                    }
                                )
                            }
                        }
                    }
                }

                // Filter Chips
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 8.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    FilterChip(
                        selected = filterType == "ALL",
                        onClick = { filterType = "ALL" },
                        label = { Text("All (${donorNotifs.size})", fontSize = 11.sp) }
                    )
                    FilterChip(
                        selected = filterType == "CITY_MATCH",
                        onClick = { filterType = "CITY_MATCH" },
                        label = { Text("📍 City Match", fontSize = 11.sp, fontWeight = FontWeight.Bold) }
                    )
                    FilterChip(
                        selected = filterType == "UNREAD",
                        onClick = { filterType = "UNREAD" },
                        label = { Text("Pending ($unreadCount)", fontSize = 11.sp) }
                    )
                    Spacer(modifier = Modifier.weight(1f))
                    if (unreadCount > 0) {
                        TextButton(
                            onClick = {
                                repository.markAllNotificationsRead(activeDonorId)
                                Toast.makeText(context, "All alerts marked as read", Toast.LENGTH_SHORT).show()
                            },
                            contentPadding = PaddingValues(0.dp)
                        ) {
                            Text("Mark read", fontSize = 11.sp, color = CrimsonRed, fontWeight = FontWeight.Bold)
                        }
                    }
                }

                Divider(color = MaterialTheme.colorScheme.outlineVariant)

                // Alerts List
                if (filteredList.isEmpty()) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f)
                            .padding(24.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.CheckCircle,
                                contentDescription = null,
                                tint = SuccessGreen,
                                modifier = Modifier.size(44.dp)
                            )
                            Text(
                                text = "All caught up!",
                                fontWeight = FontWeight.Bold,
                                style = MaterialTheme.typography.titleMedium
                            )
                            Text(
                                text = "Whenever someone requests ${activeDonor?.bloodGroup?.label} blood in ${activeDonor?.city}, an instant alert appears here.",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.padding(horizontal = 16.dp),
                                textAlign = androidx.compose.ui.text.style.TextAlign.Center
                            )
                        }
                    }
                } else {
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f)
                            .padding(horizontal = 16.dp, vertical = 8.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        items(filteredList, key = { it.id }) { notif ->
                            NotificationCardItem(
                                notification = notif,
                                onAccept = {
                                    repository.respondToNotification(notif.id, true)
                                    Toast.makeText(
                                        context,
                                        "Pledge Confirmed! Appointment scheduled at ${notif.hospital}.",
                                        Toast.LENGTH_LONG
                                    ).show()
                                },
                                onDecline = {
                                    repository.respondToNotification(notif.id, false)
                                    Toast.makeText(context, "Request declined", Toast.LENGTH_SHORT).show()
                                },
                                onCall = {
                                    if (notif.contactPhone.isNotBlank()) {
                                        val intent = Intent(Intent.ACTION_DIAL).apply {
                                            data = Uri.parse("tel:${notif.contactPhone}")
                                        }
                                        context.startActivity(intent)
                                    }
                                }
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun NotificationCardItem(
    notification: DonorNotification,
    onAccept: () -> Unit,
    onDecline: () -> Unit,
    onCall: () -> Unit
) {
    val isCityMatch = notification.type == NotificationType.EXACT_CITY_MATCH
    val isPending = notification.status == "PENDING"
    val isAccepted = notification.status == "ACCEPTED"

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .testTag("notification_item_${notification.id}"),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isCityMatch) CrimsonLight.copy(alpha = 0.25f)
            else MaterialTheme.colorScheme.surface
        ),
        border = if (isCityMatch) androidx.compose.foundation.BorderStroke(1.dp, CrimsonRed.copy(alpha = 0.4f))
        else androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant)
    ) {
        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    if (isCityMatch) {
                        Surface(
                            color = CrimsonRed,
                            shape = RoundedCornerShape(6.dp)
                        ) {
                            Text(
                                text = "📍 City & Blood Match",
                                color = Color.White,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Black,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    } else if (notification.type == NotificationType.DIRECT_REQUEST) {
                        Surface(
                            color = UrgentAmber,
                            shape = RoundedCornerShape(6.dp)
                        ) {
                            Text(
                                text = "Direct Request",
                                color = Color.White,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }
                    Surface(
                        color = Color.Black,
                        shape = RoundedCornerShape(6.dp)
                    ) {
                        Text(
                            text = "${notification.bloodGroup.label} • ${notification.unitsNeeded} unit(s)",
                            color = Color.White,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                }

                Text(
                    text = notification.createdAt,
                    fontSize = 10.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            Text(
                text = notification.title,
                fontWeight = FontWeight.Bold,
                fontSize = 13.sp,
                color = MaterialTheme.colorScheme.onSurface
            )

            Text(
                text = notification.message,
                fontSize = 12.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                lineHeight = 16.sp
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "🏥 ${notification.hospital} (${notification.city})",
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontWeight = FontWeight.Medium
                )
                if (notification.contactName.isNotBlank()) {
                    Text(
                        text = "Contact: ${notification.contactName}",
                        fontSize = 11.sp,
                        color = CrimsonRed,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }

            // Actions
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                if (isPending) {
                    Button(
                        onClick = onAccept,
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(containerColor = CrimsonRed),
                        shape = RoundedCornerShape(10.dp),
                        contentPadding = PaddingValues(vertical = 6.dp)
                    ) {
                        Text("Accept & Pledge", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                    OutlinedButton(
                        onClick = onDecline,
                        shape = RoundedCornerShape(10.dp),
                        contentPadding = PaddingValues(vertical = 6.dp)
                    ) {
                        Text("Decline", fontSize = 12.sp)
                    }
                } else if (isAccepted) {
                    Row(
                        modifier = Modifier.weight(1f),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(Icons.Default.CheckCircle, contentDescription = null, tint = SuccessGreen, modifier = Modifier.size(16.dp))
                        Text("Donation Pledged & Scheduled", fontSize = 12.sp, color = SuccessGreen, fontWeight = FontWeight.Bold)
                    }
                } else {
                    Text("Declined", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }

                if (notification.contactPhone.isNotBlank()) {
                    IconButton(
                        onClick = onCall,
                        modifier = Modifier.size(36.dp)
                    ) {
                        Icon(Icons.Default.Phone, contentDescription = "Call Coordinator", tint = CrimsonRed)
                    }
                }
            }
        }
    }
}
