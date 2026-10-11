package com.example.lifeflow.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.LocalHospital
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Search
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
import com.example.lifeflow.data.LifeFlowRepository
import com.example.lifeflow.model.BloodGroup
import com.example.lifeflow.model.BloodRequest
import com.example.lifeflow.model.RequestStatus
import com.example.lifeflow.model.UrgencyLevel
import com.example.lifeflow.ui.theme.*

@Composable
fun RequestsScreen(
    repository: LifeFlowRepository,
    onNavigateToCreateRequest: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val requests by repository.requests.collectAsState()

    var locationSearchQuery by remember { mutableStateOf("") }
    var selectedTab by remember { mutableIntStateOf(0) } // 0: Open, 1: Fulfilled
    var selectedUrgency by remember { mutableStateOf<UrgencyLevel?>(null) }
    var selectedGroup by remember { mutableStateOf<BloodGroup?>(null) }

    var requestToFulfill by remember { mutableStateOf<BloodRequest?>(null) }

    val popularCities = remember(requests) {
        requests.map { it.city }.filter { it.isNotBlank() }.distinct().take(5)
    }

    val filteredRequests = remember(requests, selectedTab, selectedUrgency, selectedGroup, locationSearchQuery) {
        requests.filter { req ->
            val matchesStatus = if (selectedTab == 0) req.status == RequestStatus.OPEN else req.status == RequestStatus.FULFILLED
            val matchesUrgency = selectedUrgency == null || req.urgency == selectedUrgency
            val matchesGroup = selectedGroup == null || req.bloodGroup == selectedGroup

            val q = locationSearchQuery.trim().lowercase()
            val matchesLocation = q.isBlank() ||
                    req.city.lowercase().contains(q) ||
                    req.state.lowercase().contains(q) ||
                    req.hospital.lowercase().contains(q) ||
                    req.hospitalAddress.lowercase().contains(q)

            matchesStatus && matchesUrgency && matchesGroup && matchesLocation
        }
    }

    Scaffold(
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = onNavigateToCreateRequest,
                modifier = Modifier.testTag("create_blood_request_fab"),
                containerColor = CrimsonRed,
                contentColor = Color.White,
                icon = { Icon(Icons.Default.Add, contentDescription = "New Request") },
                text = { Text("Request Blood", fontWeight = FontWeight.Bold) }
            )
        }
    ) { innerPadding ->
        Column(
            modifier = modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = 16.dp)
        ) {
            Spacer(modifier = Modifier.height(16.dp))

            // LOCATION SEARCH BAR (Filters by location/city/hospital)
            OutlinedTextField(
                value = locationSearchQuery,
                onValueChange = { locationSearchQuery = it },
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("request_location_search_input"),
                placeholder = { Text("Search by city, hospital, or state...") },
                leadingIcon = { Icon(Icons.Default.LocationOn, contentDescription = "Location", tint = CrimsonRed) },
                trailingIcon = {
                    if (locationSearchQuery.isNotEmpty()) {
                        IconButton(onClick = { locationSearchQuery = "" }) {
                            Icon(Icons.Default.Clear, contentDescription = "Clear")
                        }
                    }
                },
                singleLine = true,
                shape = RoundedCornerShape(14.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = CrimsonRed,
                    cursorColor = CrimsonRed
                )
            )

            // Popular city quick chips
            if (popularCities.isNotEmpty()) {
                Spacer(modifier = Modifier.height(6.dp))
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    items(popularCities) { city ->
                        val isSelected = locationSearchQuery.equals(city, ignoreCase = true)
                        SuggestionChip(
                            onClick = {
                                locationSearchQuery = if (isSelected) "" else city
                            },
                            label = { Text("📍 $city", fontSize = 11.sp) },
                            colors = SuggestionChipDefaults.suggestionChipColors(
                                containerColor = if (isSelected) CrimsonLight else MaterialTheme.colorScheme.surfaceVariant
                            )
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // BLOOD GROUP FILTER ROW
            Text("Filter by Blood Type", style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.Bold, color = GrayTextSecondary)
            Spacer(modifier = Modifier.height(4.dp))
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                item {
                    FilterChip(
                        selected = selectedGroup == null,
                        onClick = { selectedGroup = null },
                        label = { Text("All Blood Types") },
                        modifier = Modifier.testTag("request_filter_blood_all"),
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = CrimsonRed,
                            selectedLabelColor = Color.White
                        )
                    )
                }
                items(BloodGroup.entries) { group ->
                    FilterChip(
                        selected = selectedGroup == group,
                        onClick = {
                            selectedGroup = if (selectedGroup == group) null else group
                        },
                        label = { Text(group.label, fontWeight = FontWeight.Bold) },
                        modifier = Modifier.testTag("request_filter_blood_${group.label}"),
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = CrimsonRed,
                            selectedLabelColor = Color.White
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Tab Selector (Active vs Fulfilled)
            TabRow(
                selectedTabIndex = selectedTab,
                modifier = Modifier.clip(RoundedCornerShape(12.dp)),
                containerColor = MaterialTheme.colorScheme.surfaceVariant
            ) {
                Tab(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    text = {
                        val count = requests.count { it.status == RequestStatus.OPEN }
                        Text("Active ($count)", fontWeight = FontWeight.Bold)
                    }
                )
                Tab(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    text = {
                        val count = requests.count { it.status == RequestStatus.FULFILLED }
                        Text("Fulfilled ($count)", fontWeight = FontWeight.Bold)
                    }
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Urgency Filter Chips
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "${filteredRequests.size} requests found",
                    style = MaterialTheme.typography.bodySmall,
                    fontWeight = FontWeight.Bold,
                    color = GrayTextSecondary
                )

                if (locationSearchQuery.isNotEmpty() || selectedGroup != null || selectedUrgency != null) {
                    TextButton(
                        onClick = {
                            locationSearchQuery = ""
                            selectedGroup = null
                            selectedUrgency = null
                        }
                    ) {
                        Text("Clear Filters", color = CrimsonRed, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }

            Spacer(modifier = Modifier.height(6.dp))

            if (filteredRequests.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(top = 40.dp),
                    contentAlignment = Alignment.TopCenter
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            imageVector = Icons.Default.LocalHospital,
                            contentDescription = null,
                            tint = GrayTextMuted,
                            modifier = Modifier.size(48.dp)
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "No blood requests match your filters",
                            style = MaterialTheme.typography.titleMedium,
                            color = GrayTextSecondary
                        )
                        Text(
                            text = "Try clearing search location or selecting a different blood type",
                            style = MaterialTheme.typography.bodySmall,
                            color = GrayTextMuted
                        )
                    }
                }
            } else {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    contentPadding = PaddingValues(bottom = 80.dp),
                    modifier = Modifier.fillMaxSize()
                ) {
                    items(filteredRequests) { request ->
                        RequestItemCard(
                            request = request,
                            onCall = {
                                val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:${request.contactPhone}"))
                                context.startActivity(intent)
                            },
                            onFulfillClick = { requestToFulfill = request }
                        )
                    }
                }
            }
        }
    }

    // Confirmation Dialog
    requestToFulfill?.let { req ->
        AlertDialog(
            onDismissRequest = { requestToFulfill = null },
            title = { Text("Confirm Blood Donation") },
            text = {
                Text("Are you sure you want to mark this request for ${req.patientName} (${req.bloodGroup.label}, ${req.unitsRequired} units) at ${req.hospital} as fulfilled by a donor?")
            },
            confirmButton = {
                Button(
                    onClick = {
                        repository.fulfillRequest(req.id)
                        android.widget.Toast.makeText(
                            context,
                            "Thank you! You responded to donate ${req.bloodGroup.label} for ${req.patientName}. Hospital alerted.",
                            android.widget.Toast.LENGTH_LONG
                        ).show()
                        requestToFulfill = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = SuccessGreen)
                ) {
                    Text("Mark as Fulfilled")
                }
            },
            dismissButton = {
                TextButton(onClick = { requestToFulfill = null }) {
                    Text("Cancel")
                }
            }
        )
    }
}

@Composable
fun RequestItemCard(
    request: BloodRequest,
    onCall: () -> Unit,
    onFulfillClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .testTag("request_item_card_${request.id}"),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
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
                            .size(46.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(CrimsonRed),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = request.bloodGroup.label,
                            color = Color.White,
                            fontWeight = FontWeight.ExtraBold,
                            fontSize = 18.sp
                        )
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(
                            text = request.patientName,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "${request.unitsRequired} units required",
                            style = MaterialTheme.typography.bodySmall,
                            color = GrayTextSecondary
                        )
                    }
                }

                val (badgeBg, badgeText, badgeColor) = when (request.urgency) {
                    UrgencyLevel.CRITICAL -> Triple(CriticalRed.copy(alpha = 0.15f), "CRITICAL", CriticalRed)
                    UrgencyLevel.URGENT -> Triple(UrgentOrange.copy(alpha = 0.15f), "URGENT", UrgentOrange)
                    UrgencyLevel.NORMAL -> Triple(InfoBlue.copy(alpha = 0.15f), "NORMAL", InfoBlue)
                }

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(badgeBg)
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = badgeText,
                        color = badgeColor,
                        fontWeight = FontWeight.Bold,
                        fontSize = 11.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))
            Text(
                text = "🏥 ${request.hospital}",
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.Medium
            )
            if (request.hospitalAddress.isNotBlank()) {
                Text(
                    text = "🏠 ${request.hospitalAddress}",
                    style = MaterialTheme.typography.bodySmall,
                    color = GrayTextSecondary
                )
            }
            Text(
                text = "📍 ${request.city}, ${request.state}",
                style = MaterialTheme.typography.bodySmall,
                color = GrayTextSecondary
            )

            request.requestedDonorName?.let { donorName ->
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "🎯 Direct request to donor: $donorName",
                    style = MaterialTheme.typography.bodySmall,
                    color = CrimsonDark,
                    fontWeight = FontWeight.SemiBold
                )
            }

            if (request.note.isNotBlank()) {
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "Note: ${request.note}",
                    style = MaterialTheme.typography.bodySmall,
                    color = GrayTextSecondary
                )
            }

            Spacer(modifier = Modifier.height(12.dp))
            HorizontalDivider(color = GrayBorder)
            Spacer(modifier = Modifier.height(10.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Contact: ${request.contactName}",
                        style = MaterialTheme.typography.bodySmall,
                        fontWeight = FontWeight.Medium
                    )
                    Text(
                        text = request.createdAt,
                        style = MaterialTheme.typography.bodySmall,
                        color = GrayTextMuted
                    )
                }

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    FilledTonalIconButton(
                        onClick = onCall,
                        modifier = Modifier.testTag("call_request_contact_${request.id}")
                    ) {
                        Icon(Icons.Default.Call, contentDescription = "Call Contact", tint = CrimsonRed)
                    }

                    if (request.status == RequestStatus.OPEN) {
                        Button(
                            onClick = onFulfillClick,
                            modifier = Modifier.testTag("fulfill_request_btn_${request.id}"),
                            colors = ButtonDefaults.buttonColors(containerColor = SuccessGreen),
                            shape = RoundedCornerShape(8.dp),
                            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Fulfill", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    } else {
                        Badge(containerColor = SuccessGreen.copy(alpha = 0.15f)) {
                            Text("Fulfilled", color = SuccessGreen, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}
