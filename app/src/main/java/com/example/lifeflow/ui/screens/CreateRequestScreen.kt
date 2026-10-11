package com.example.lifeflow.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.LocalHospital
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.lifeflow.data.LifeFlowRepository
import com.example.lifeflow.model.BloodGroup
import com.example.lifeflow.model.Donor
import com.example.lifeflow.model.UrgencyLevel
import com.example.lifeflow.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CreateRequestScreen(
    repository: LifeFlowRepository,
    onBack: () -> Unit,
    targetDonor: Donor? = null,
    modifier: Modifier = Modifier
) {
    BackHandler { onBack() }

    val context = androidx.compose.ui.platform.LocalContext.current
    val allDonors by repository.donors.collectAsState()

    var patientName by remember { mutableStateOf("") }
    var selectedBloodGroup by remember { mutableStateOf(targetDonor?.bloodGroup ?: BloodGroup.O_POSITIVE) }
    var unitsRequired by remember { mutableIntStateOf(1) }
    var hospital by remember { mutableStateOf("") }
    var hospitalAddress by remember { mutableStateOf("") }
    var city by remember { mutableStateOf(targetDonor?.city ?: "") }
    var state by remember { mutableStateOf(targetDonor?.state ?: "") }
    var zipCode by remember { mutableStateOf("") }
    var contactName by remember { mutableStateOf("") }
    var contactPhone by remember { mutableStateOf("") }
    var urgency by remember { mutableStateOf(UrgencyLevel.URGENT) }
    var note by remember { mutableStateOf("") }

    // Donor Request Type: "Broadcast" vs "Direct Donor Request"
    var isDirectDonorRequest by remember { mutableStateOf(targetDonor != null) }
    var selectedDonor by remember { mutableStateOf<Donor?>(targetDonor) }

    var errorMessage by remember { mutableStateOf<String?>(null) }
    var isSubmitted by remember { mutableStateOf(false) }

    // Filter compatible available donors
    val compatibleDonors = remember(selectedBloodGroup, allDonors) {
        val matrix = repository.getCompatibilityMatrix()
        val info = matrix.find { it.bloodGroup == selectedBloodGroup }
        val canReceiveFrom = info?.canReceiveFrom ?: listOf(selectedBloodGroup)
        allDonors.filter { it.isAvailable && canReceiveFrom.contains(it.bloodGroup) }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Create Blood Request", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack, modifier = Modifier.testTag("create_request_back_button")) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { innerPadding ->
        Column(
            modifier = modifier
                .fillMaxSize()
                .padding(innerPadding)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Mode selector card: General Community Broadcast vs Direct Donor Request
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)),
                shape = RoundedCornerShape(14.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(6.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    FilledTonalButton(
                        onClick = {
                            isDirectDonorRequest = false
                            selectedDonor = null
                        },
                        modifier = Modifier
                            .weight(1f)
                            .testTag("request_mode_broadcast"),
                        colors = ButtonDefaults.filledTonalButtonColors(
                            containerColor = if (!isDirectDonorRequest) CrimsonRed else Color.Transparent,
                            contentColor = if (!isDirectDonorRequest) Color.White else MaterialTheme.colorScheme.onSurface
                        ),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Text("Broadcast All", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    }

                    FilledTonalButton(
                        onClick = { isDirectDonorRequest = true },
                        modifier = Modifier
                            .weight(1f)
                            .testTag("request_mode_direct_donor"),
                        colors = ButtonDefaults.filledTonalButtonColors(
                            containerColor = if (isDirectDonorRequest) CrimsonRed else Color.Transparent,
                            contentColor = if (isDirectDonorRequest) Color.White else MaterialTheme.colorScheme.onSurface
                        ),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Icon(Icons.Default.Send, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Request Donor", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    }
                }
            }

            // Direct Donor Picker (if direct donor mode active)
            if (isDirectDonorRequest) {
                Card(
                    colors = CardDefaults.cardColors(containerColor = CrimsonLight.copy(alpha = 0.4f)),
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Text(
                            text = "Target Donor Selection",
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Bold,
                            color = CrimsonDeep
                        )
                        Text(
                            text = "Send alert directly to a registered compatible donor in your region:",
                            style = MaterialTheme.typography.bodySmall,
                            color = GrayTextSecondary
                        )
                        Spacer(modifier = Modifier.height(10.dp))

                        if (compatibleDonors.isEmpty()) {
                            Text(
                                text = "No matching available donors currently in system for ${selectedBloodGroup.label}. Switching to broadcast mode recommended.",
                                style = MaterialTheme.typography.bodySmall,
                                color = CriticalRed
                            )
                        } else {
                            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                compatibleDonors.take(4).forEach { donor ->
                                    val isSelected = selectedDonor?.id == donor.id
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .clip(RoundedCornerShape(10.dp))
                                            .background(if (isSelected) Color.White else Color.White.copy(alpha = 0.6f))
                                            .border(
                                                width = if (isSelected) 2.dp else 1.dp,
                                                color = if (isSelected) CrimsonRed else GrayBorder,
                                                shape = RoundedCornerShape(10.dp)
                                            )
                                            .clickable {
                                                selectedDonor = donor
                                                city = donor.city
                                                state = donor.state
                                            }
                                            .padding(10.dp),
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Row(verticalAlignment = Alignment.CenterVertically) {
                                            Box(
                                                modifier = Modifier
                                                    .size(32.dp)
                                                    .clip(CircleShape)
                                                    .background(CrimsonRed),
                                                contentAlignment = Alignment.Center
                                            ) {
                                                Text(donor.bloodGroup.label, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                                            }
                                            Spacer(modifier = Modifier.width(10.dp))
                                            Column {
                                                Text(donor.name, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.bodyMedium)
                                                Text("${donor.city}, ${donor.state}", style = MaterialTheme.typography.bodySmall, color = GrayTextSecondary)
                                            }
                                        }
                                        if (isSelected) {
                                            Icon(Icons.Default.Check, contentDescription = "Selected", tint = CrimsonRed)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            Text(
                text = "Blood Type & Quantity Required",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = CrimsonRed
            )

            // Blood Group Selector
            Text("Required Blood Group *", style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Medium)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                BloodGroup.entries.take(4).forEach { group ->
                    BloodGroupChoiceCard(
                        group = group,
                        isSelected = selectedBloodGroup == group,
                        onClick = { selectedBloodGroup = group },
                        modifier = Modifier.weight(1f)
                    )
                }
            }
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                BloodGroup.entries.drop(4).forEach { group ->
                    BloodGroupChoiceCard(
                        group = group,
                        isSelected = selectedBloodGroup == group,
                        onClick = { selectedBloodGroup = group },
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            // Units Required Stepper
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("Quantity / Blood Units *", style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Medium)
                    Text("1 unit ≈ 450ml of whole blood", style = MaterialTheme.typography.bodySmall, color = GrayTextMuted)
                }
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    FilledTonalIconButton(
                        onClick = { if (unitsRequired > 1) unitsRequired-- },
                        modifier = Modifier.testTag("decrease_units_btn")
                    ) {
                        Icon(Icons.Default.Remove, contentDescription = "Decrease")
                    }
                    Text(
                        text = "$unitsRequired Units",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 8.dp)
                    )
                    FilledTonalIconButton(
                        onClick = { if (unitsRequired < 10) unitsRequired++ },
                        modifier = Modifier.testTag("increase_units_btn")
                    ) {
                        Icon(Icons.Default.Add, contentDescription = "Increase")
                    }
                }
            }

            HorizontalDivider(color = GrayBorder)

            Text(
                text = "Patient & Hospital Details",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = CrimsonRed
            )

            // Patient Name
            OutlinedTextField(
                value = patientName,
                onValueChange = {
                    patientName = it
                    errorMessage = null
                },
                label = { Text("Patient Full Name *") },
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("patient_name_input"),
                singleLine = true,
                shape = RoundedCornerShape(12.dp)
            )

            // Hospital Name
            OutlinedTextField(
                value = hospital,
                onValueChange = { hospital = it; errorMessage = null },
                label = { Text("Hospital Name *") },
                placeholder = { Text("e.g. St. Jude General Hospital") },
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("hospital_name_input"),
                singleLine = true,
                shape = RoundedCornerShape(12.dp)
            )

            // Full Hospital Address
            OutlinedTextField(
                value = hospitalAddress,
                onValueChange = { hospitalAddress = it; errorMessage = null },
                label = { Text("Hospital Full Street Address / Ward / Room *") },
                placeholder = { Text("e.g. 500 Medical Center Blvd, ICU Room 302") },
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("hospital_address_input"),
                singleLine = true,
                shape = RoundedCornerShape(12.dp)
            )

            // City, State, Zip
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedTextField(
                    value = city,
                    onValueChange = { city = it; errorMessage = null },
                    label = { Text("City *") },
                    modifier = Modifier
                        .weight(1.2f)
                        .testTag("city_input"),
                    singleLine = true,
                    shape = RoundedCornerShape(12.dp)
                )
                OutlinedTextField(
                    value = state,
                    onValueChange = { state = it },
                    label = { Text("State") },
                    modifier = Modifier
                        .weight(0.8f)
                        .testTag("state_input"),
                    singleLine = true,
                    shape = RoundedCornerShape(12.dp)
                )
                OutlinedTextField(
                    value = zipCode,
                    onValueChange = { zipCode = it },
                    label = { Text("ZIP") },
                    modifier = Modifier
                        .weight(1f)
                        .testTag("zip_input"),
                    singleLine = true,
                    shape = RoundedCornerShape(12.dp)
                )
            }

            HorizontalDivider(color = GrayBorder)

            Text(
                text = "Urgency & Contact Person",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = CrimsonRed
            )

            // Urgency Selector
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                UrgencyLevel.entries.forEach { level ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(10.dp))
                            .border(
                                width = if (urgency == level) 2.dp else 1.dp,
                                color = if (urgency == level) CrimsonRed else GrayBorder,
                                shape = RoundedCornerShape(10.dp)
                            )
                            .clickable { urgency = level }
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        RadioButton(
                            selected = urgency == level,
                            onClick = { urgency = level },
                            colors = RadioButtonDefaults.colors(selectedColor = CrimsonRed)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = level.label,
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = if (urgency == level) FontWeight.Bold else FontWeight.Normal
                        )
                    }
                }
            }

            // Contact info
            OutlinedTextField(
                value = contactName,
                onValueChange = { contactName = it; errorMessage = null },
                label = { Text("Contact Person Name *") },
                placeholder = { Text("Relative or Doctor attendant") },
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("contact_name_input"),
                singleLine = true,
                shape = RoundedCornerShape(12.dp)
            )

            OutlinedTextField(
                value = contactPhone,
                onValueChange = { contactPhone = it; errorMessage = null },
                label = { Text("Emergency Phone Number *") },
                placeholder = { Text("+1 (555) 000-0000") },
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("contact_phone_input"),
                singleLine = true,
                shape = RoundedCornerShape(12.dp)
            )

            OutlinedTextField(
                value = note,
                onValueChange = { note = it },
                label = { Text("Medical Reason or Additional Notes") },
                placeholder = { Text("e.g. Scheduled emergency trauma care, please bring donor card") },
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("request_note_input"),
                shape = RoundedCornerShape(12.dp),
                maxLines = 3
            )

            errorMessage?.let { msg ->
                Text(
                    text = msg,
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Medium
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            Button(
                onClick = {
                    if (patientName.isBlank()) {
                        errorMessage = "Please enter patient name"
                    } else if (hospital.isBlank()) {
                        errorMessage = "Please enter hospital name"
                    } else if (hospitalAddress.isBlank()) {
                        errorMessage = "Please enter hospital street address"
                    } else if (city.isBlank()) {
                        errorMessage = "Please enter city"
                    } else if (contactName.isBlank()) {
                        errorMessage = "Please enter contact person name"
                    } else if (contactPhone.isBlank()) {
                        errorMessage = "Please enter emergency phone number"
                    } else if (isDirectDonorRequest && selectedDonor == null) {
                        errorMessage = "Please select a target donor or switch to broadcast mode"
                    } else {
                        repository.addBloodRequest(
                            patientName = patientName.trim(),
                            bloodGroup = selectedBloodGroup,
                            unitsRequired = unitsRequired,
                            hospital = hospital.trim(),
                            hospitalAddress = hospitalAddress.trim(),
                            city = city.trim(),
                            state = state.trim(),
                            contactName = contactName.trim(),
                            contactPhone = contactPhone.trim(),
                            urgency = urgency,
                            note = note.trim(),
                            requestedDonorName = selectedDonor?.name
                        )
                        val toastMsg = if (selectedDonor != null) {
                            "Direct request sent to ${selectedDonor?.name}! The donor received an instant alert."
                        } else {
                            "Blood request broadcasted! Matching ${selectedBloodGroup.label} donors in ${city.trim()} have been alerted."
                        }
                        android.widget.Toast.makeText(context, toastMsg, android.widget.Toast.LENGTH_LONG).show()
                        isSubmitted = true
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp)
                    .testTag("submit_request_button"),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(containerColor = CrimsonRed)
            ) {
                Icon(Icons.Default.Send, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = if (isDirectDonorRequest && selectedDonor != null)
                        "Request Blood from ${selectedDonor?.name}"
                    else
                        "Publish Blood Request",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.height(24.dp))
        }
    }

    if (isSubmitted) {
        AlertDialog(
            onDismissRequest = {
                isSubmitted = false
                onBack()
            },
            title = { Text("Blood Request Posted!") },
            text = {
                Text(
                    if (selectedDonor != null)
                        "Your direct request for ${selectedBloodGroup.label} ($unitsRequired units) at $hospital has been sent to ${selectedDonor?.name}. You will be contacted shortly."
                    else
                        "Your request for ${selectedBloodGroup.label} ($unitsRequired units) at $hospital ($hospitalAddress, $city) has been broadcasted to all nearby donors."
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        isSubmitted = false
                        onBack()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = CrimsonRed)
                ) {
                    Text("View Requests")
                }
            }
        )
    }
}
