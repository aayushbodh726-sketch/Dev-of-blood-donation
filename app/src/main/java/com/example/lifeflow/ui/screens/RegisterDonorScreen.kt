package com.example.lifeflow.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
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
import com.example.lifeflow.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RegisterDonorScreen(
    repository: LifeFlowRepository,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    BackHandler { onBack() }

    var fullName by remember { mutableStateOf("") }
    var selectedBloodGroup by remember { mutableStateOf(BloodGroup.O_POSITIVE) }
    var phone by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var city by remember { mutableStateOf("") }
    var state by remember { mutableStateOf("") }

    // Eligibility Checkbox states
    var isAdult by remember { mutableStateOf(true) }
    var isHealthyWeight by remember { mutableStateOf(true) }
    var noRecentDonation by remember { mutableStateOf(true) }
    var feelingHealthy by remember { mutableStateOf(true) }

    var errorMessage by remember { mutableStateOf<String?>(null) }
    var isRegistered by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Donor Registration", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack, modifier = Modifier.testTag("register_donor_back_button")) {
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
            Card(
                colors = CardDefaults.cardColors(containerColor = CrimsonLight.copy(alpha = 0.5f)),
                shape = RoundedCornerShape(12.dp)
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.CheckCircle, contentDescription = null, tint = CrimsonRed)
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(
                        text = "Join our network of life savers. One donation can save up to 3 lives!",
                        style = MaterialTheme.typography.bodySmall,
                        color = CrimsonDeep,
                        fontWeight = FontWeight.Medium
                    )
                }
            }

            Text(
                text = "Personal Details",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = CrimsonRed
            )

            OutlinedTextField(
                value = fullName,
                onValueChange = { fullName = it; errorMessage = null },
                label = { Text("Full Name *") },
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("donor_name_input"),
                singleLine = true,
                shape = RoundedCornerShape(12.dp)
            )

            Text("Your Blood Group *", style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Medium)
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

            OutlinedTextField(
                value = phone,
                onValueChange = { phone = it; errorMessage = null },
                label = { Text("Phone Number *") },
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("donor_phone_input"),
                singleLine = true,
                shape = RoundedCornerShape(12.dp)
            )

            OutlinedTextField(
                value = email,
                onValueChange = { email = it },
                label = { Text("Email Address (Optional)") },
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("donor_email_input"),
                singleLine = true,
                shape = RoundedCornerShape(12.dp)
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                OutlinedTextField(
                    value = city,
                    onValueChange = { city = it; errorMessage = null },
                    label = { Text("City *") },
                    modifier = Modifier
                        .weight(1f)
                        .testTag("donor_city_input"),
                    singleLine = true,
                    shape = RoundedCornerShape(12.dp)
                )
                OutlinedTextField(
                    value = state,
                    onValueChange = { state = it },
                    label = { Text("State") },
                    modifier = Modifier
                        .weight(1f)
                        .testTag("donor_state_input"),
                    singleLine = true,
                    shape = RoundedCornerShape(12.dp)
                )
            }

            HorizontalDivider(color = GrayBorder)

            Text(
                text = "Eligibility Criteria",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = CrimsonRed
            )

            EligibilityCheckbox(
                checked = isAdult,
                onCheckedChange = { isAdult = it },
                text = "I am at least 18 years old",
                tag = "check_adult"
            )

            EligibilityCheckbox(
                checked = isHealthyWeight,
                onCheckedChange = { isHealthyWeight = it },
                text = "My weight is 50 kg (110 lbs) or above",
                tag = "check_weight"
            )

            EligibilityCheckbox(
                checked = noRecentDonation,
                onCheckedChange = { noRecentDonation = it },
                text = "I have not donated whole blood in the last 3 months",
                tag = "check_recent_donation"
            )

            EligibilityCheckbox(
                checked = feelingHealthy,
                onCheckedChange = { feelingHealthy = it },
                text = "I feel fit and currently free of fever, cold or active medication",
                tag = "check_feeling_healthy"
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
                    if (fullName.isBlank()) {
                        errorMessage = "Please enter your name"
                    } else if (phone.isBlank()) {
                        errorMessage = "Please enter your phone number"
                    } else if (city.isBlank()) {
                        errorMessage = "Please enter your city"
                    } else if (!isAdult || !isHealthyWeight || !noRecentDonation || !feelingHealthy) {
                        errorMessage = "Please satisfy all eligibility conditions to register"
                    } else {
                        repository.addDonor(
                            name = fullName.trim(),
                            bloodGroup = selectedBloodGroup,
                            city = city.trim(),
                            state = state.trim(),
                            phone = phone.trim(),
                            email = email.trim()
                        )
                        isRegistered = true
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp)
                    .testTag("submit_donor_button"),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(containerColor = CrimsonRed)
            ) {
                Text("Complete Registration", fontSize = 16.sp, fontWeight = FontWeight.Bold)
            }

            Spacer(modifier = Modifier.height(24.dp))
        }
    }

    if (isRegistered) {
        AlertDialog(
            onDismissRequest = {
                isRegistered = false
                onBack()
            },
            title = { Text("Welcome to LifeFlow Heroes!") },
            text = { Text("Thank you, $fullName. You are now registered as an active donor for ${selectedBloodGroup.label} in $city. You will be contacted when a patient in your area needs matching blood.") },
            confirmButton = {
                Button(
                    onClick = {
                        isRegistered = false
                        onBack()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = CrimsonRed)
                ) {
                    Text("Go to Donors List")
                }
            }
        )
    }
}

@Composable
fun EligibilityCheckbox(
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit,
    text: String,
    tag: String
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(8.dp))
            .clickable { onCheckedChange(!checked) }
            .padding(vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Checkbox(
            checked = checked,
            onCheckedChange = onCheckedChange,
            modifier = Modifier.testTag(tag),
            colors = CheckboxDefaults.colors(checkedColor = CrimsonRed)
        )
        Spacer(modifier = Modifier.width(8.dp))
        Text(text = text, style = MaterialTheme.typography.bodyMedium)
    }
}
