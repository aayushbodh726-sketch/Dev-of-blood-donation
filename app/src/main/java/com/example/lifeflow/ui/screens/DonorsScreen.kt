package com.example.lifeflow.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Message
import androidx.compose.material.icons.filled.Person
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
import com.example.lifeflow.model.Donor
import com.example.lifeflow.ui.theme.*

@Composable
fun DonorsScreen(
    repository: LifeFlowRepository,
    onNavigateToRegister: () -> Unit,
    onRequestDonor: (Donor) -> Unit = {},
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val donors by repository.donors.collectAsState()

    var searchQuery by remember { mutableStateOf("") }
    var selectedBloodGroup by remember { mutableStateOf<BloodGroup?>(null) }
    var onlyAvailable by remember { mutableStateOf(false) }

    val filteredDonors = remember(donors, searchQuery, selectedBloodGroup, onlyAvailable) {
        donors.filter { donor ->
            val matchesSearch = searchQuery.isBlank() ||
                    donor.name.contains(searchQuery, ignoreCase = true) ||
                    donor.city.contains(searchQuery, ignoreCase = true) ||
                    donor.state.contains(searchQuery, ignoreCase = true)
            val matchesGroup = selectedBloodGroup == null || donor.bloodGroup == selectedBloodGroup
            val matchesAvailability = !onlyAvailable || donor.isAvailable
            matchesSearch && matchesGroup && matchesAvailability
        }
    }

    Scaffold(
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = onNavigateToRegister,
                modifier = Modifier.testTag("register_as_donor_fab"),
                containerColor = CrimsonRed,
                contentColor = Color.White,
                icon = { Icon(Icons.Default.Add, contentDescription = "Add Donor") },
                text = { Text("Register as Donor", fontWeight = FontWeight.Bold) }
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

            // Search Bar
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("donor_search_input"),
                placeholder = { Text("Search by name or city...") },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = "Search") },
                trailingIcon = {
                    if (searchQuery.isNotEmpty()) {
                        IconButton(onClick = { searchQuery = "" }) {
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

            Spacer(modifier = Modifier.height(12.dp))

            // Blood Group Filters
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                item {
                    FilterChip(
                        selected = selectedBloodGroup == null,
                        onClick = { selectedBloodGroup = null },
                        label = { Text("All Groups") },
                        modifier = Modifier.testTag("filter_blood_all"),
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = CrimsonRed,
                            selectedLabelColor = Color.White
                        )
                    )
                }

                items(BloodGroup.entries) { group ->
                    FilterChip(
                        selected = selectedBloodGroup == group,
                        onClick = {
                            selectedBloodGroup = if (selectedBloodGroup == group) null else group
                        },
                        label = { Text(group.label) },
                        modifier = Modifier.testTag("filter_blood_${group.label}"),
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = CrimsonRed,
                            selectedLabelColor = Color.White
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Availability Toggle & Count
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "${filteredDonors.size} Donors Found",
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Bold,
                    color = GrayTextSecondary
                )

                FilterChip(
                    selected = onlyAvailable,
                    onClick = { onlyAvailable = !onlyAvailable },
                    label = { Text("Available Only") },
                    modifier = Modifier.testTag("filter_available_toggle"),
                    leadingIcon = if (onlyAvailable) {
                        { Icon(Icons.Default.CheckCircle, contentDescription = null, modifier = Modifier.size(16.dp)) }
                    } else null
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Donors List
            if (filteredDonors.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(top = 60.dp),
                    contentAlignment = Alignment.TopCenter
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            imageVector = Icons.Default.Person,
                            contentDescription = null,
                            tint = GrayTextMuted,
                            modifier = Modifier.size(48.dp)
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "No donors match your search",
                            style = MaterialTheme.typography.titleMedium,
                            color = GrayTextSecondary
                        )
                        Text(
                            text = "Try clearing filters or changing city",
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
                    items(filteredDonors) { donor ->
                        DonorCard(
                            donor = donor,
                            onToggleAvailability = { repository.toggleDonorAvailability(donor.id) },
                            onCall = {
                                val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:${donor.phone}"))
                                context.startActivity(intent)
                            },
                            onMessage = {
                                val intent = Intent(Intent.ACTION_SENDTO, Uri.parse("smsto:${donor.phone}"))
                                context.startActivity(intent)
                            },
                            onRequestBlood = { onRequestDonor(donor) }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun DonorCard(
    donor: Donor,
    onToggleAvailability: () -> Unit,
    onCall: () -> Unit,
    onMessage: () -> Unit,
    onRequestBlood: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .testTag("donor_card_${donor.id}"),
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
                            text = donor.bloodGroup.label,
                            color = Color.White,
                            fontWeight = FontWeight.ExtraBold,
                            fontSize = 18.sp
                        )
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(
                            text = donor.name,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "📍 ${donor.city}, ${donor.state}",
                            style = MaterialTheme.typography.bodySmall,
                            color = GrayTextSecondary
                        )
                    }
                }

                // Availability Badge (Clickable to toggle)
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(20.dp))
                        .background(if (donor.isAvailable) SuccessGreen.copy(alpha = 0.15f) else Color.Gray.copy(alpha = 0.15f))
                        .clickable { onToggleAvailability() }
                        .padding(horizontal = 10.dp, vertical = 5.dp)
                ) {
                    Text(
                        text = if (donor.isAvailable) "Available" else "Busy",
                        color = if (donor.isAvailable) SuccessGreen else Color.Gray,
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp
                    )
                }
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
                        text = "Total Donations: ${donor.totalDonations}",
                        style = MaterialTheme.typography.bodySmall,
                        color = GrayTextSecondary
                    )
                    Text(
                        text = "Last: ${donor.lastDonationDate}",
                        style = MaterialTheme.typography.bodySmall,
                        color = GrayTextMuted
                    )
                }

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    FilledTonalIconButton(
                        onClick = onMessage,
                        modifier = Modifier.testTag("message_donor_${donor.id}")
                    ) {
                        Icon(Icons.Default.Message, contentDescription = "Send SMS", tint = CrimsonRed)
                    }

                    FilledTonalIconButton(
                        onClick = onCall,
                        modifier = Modifier.testTag("call_donor_${donor.id}")
                    ) {
                        Icon(Icons.Default.Call, contentDescription = "Call Donor", tint = SuccessGreen)
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            Button(
                onClick = onRequestBlood,
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("request_blood_from_donor_${donor.id}"),
                colors = ButtonDefaults.buttonColors(containerColor = CrimsonRed),
                shape = RoundedCornerShape(10.dp)
            ) {
                Text("Request Blood from ${donor.name.split(" ").firstOrNull() ?: "Donor"}", fontWeight = FontWeight.Bold, fontSize = 13.sp)
            }
        }
    }
}
