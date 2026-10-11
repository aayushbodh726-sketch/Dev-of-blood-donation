package com.example.lifeflow.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.WaterDrop
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

@Composable
fun CompatibilityScreen(
    repository: LifeFlowRepository,
    modifier: Modifier = Modifier
) {
    val matrix = remember { repository.getCompatibilityMatrix() }
    var selectedGroup by remember { mutableStateOf(BloodGroup.O_NEGATIVE) }
    val info = remember(selectedGroup) { matrix.first { it.bloodGroup == selectedGroup } }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp)
            .testTag("compatibility_screen"),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text(
                text = "Blood Group Match Matrix",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onBackground
            )
            Text(
                text = "Select any blood group below to see who they can give to and receive from.",
                style = MaterialTheme.typography.bodyMedium,
                color = GrayTextSecondary
            )
        }

        // Selector Grid
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                shape = RoundedCornerShape(16.dp),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Select Blood Group",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        BloodGroup.entries.take(4).forEach { group ->
                            BloodTypePill(
                                group = group,
                                isSelected = selectedGroup == group,
                                onClick = { selectedGroup = group },
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        BloodGroup.entries.drop(4).forEach { group ->
                            BloodTypePill(
                                group = group,
                                isSelected = selectedGroup == group,
                                onClick = { selectedGroup = group },
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }
                }
            }
        }

        // Selected Compatibility Details
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                shape = RoundedCornerShape(16.dp),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(52.dp)
                                    .clip(CircleShape)
                                    .background(CrimsonRed),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = info.bloodGroup.label,
                                    color = Color.White,
                                    fontSize = 20.sp,
                                    fontWeight = FontWeight.ExtraBold
                                )
                            }
                            Spacer(modifier = Modifier.width(14.dp))
                            Column {
                                Text(
                                    text = "Blood Group ${info.bloodGroup.label}",
                                    style = MaterialTheme.typography.titleLarge,
                                    fontWeight = FontWeight.Bold
                                )
                                if (info.isUniversalDonor) {
                                    Text("⭐ Universal Red Cell Donor", color = CrimsonRed, fontWeight = FontWeight.SemiBold, fontSize = 12.sp)
                                } else if (info.isUniversalRecipient) {
                                    Text("⭐ Universal Recipient", color = InfoBlue, fontWeight = FontWeight.SemiBold, fontSize = 12.sp)
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))
                    Text(text = info.description, style = MaterialTheme.typography.bodyMedium, color = GrayTextSecondary)

                    Spacer(modifier = Modifier.height(16.dp))
                    HorizontalDivider(color = GrayBorder)
                    Spacer(modifier = Modifier.height(16.dp))

                    // CAN GIVE TO
                    Text(
                        text = "🩸 Can Give Red Blood Cells To:",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = CrimsonRed
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    FlowRowCompat(
                        items = info.canGiveTo.map { it.label },
                        chipColor = CrimsonRed
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    // CAN RECEIVE FROM
                    Text(
                        text = "💉 Can Receive Red Blood Cells From:",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = SuccessGreen
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    FlowRowCompat(
                        items = info.canReceiveFrom.map { it.label },
                        chipColor = SuccessGreen
                    )
                }
            }
        }

        // Preparation & Guidelines Card
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f)),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Info, contentDescription = null, tint = CrimsonRed)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Tips Before You Donate",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                    DonationTipItem("Drink an extra 16 oz (approx. 500 ml) of water before your appointment.")
                    DonationTipItem("Eat a healthy meal high in iron (spinach, beans, lean meats) and avoid fatty foods.")
                    DonationTipItem("Avoid alcohol and smoking for at least 24 hours prior to donation.")
                    DonationTipItem("Get a good night's sleep (7–8 hours) before donating.")
                }
            }
            Spacer(modifier = Modifier.height(20.dp))
        }
    }
}

@Composable
fun BloodTypePill(
    group: BloodGroup,
    isSelected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .height(44.dp)
            .clip(RoundedCornerShape(10.dp))
            .background(if (isSelected) CrimsonRed else MaterialTheme.colorScheme.surfaceVariant)
            .clickable { onClick() }
            .testTag("compat_pill_${group.label}"),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = group.label,
            color = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurface,
            fontWeight = FontWeight.Bold,
            fontSize = 15.sp
        )
    }
}

@Composable
fun FlowRowCompat(
    items: List<String>,
    chipColor: Color
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items.forEach { label ->
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(8.dp))
                    .background(chipColor.copy(alpha = 0.15f))
                    .border(1.dp, chipColor, RoundedCornerShape(8.dp))
                    .padding(horizontal = 12.dp, vertical = 6.dp)
            ) {
                Text(
                    text = label,
                    color = chipColor,
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp
                )
            }
        }
    }
}

@Composable
fun DonationTipItem(text: String) {
    Row(
        modifier = Modifier.padding(vertical = 4.dp),
        verticalAlignment = Alignment.Top
    ) {
        Icon(
            imageVector = Icons.Default.Check,
            contentDescription = null,
            tint = CrimsonRed,
            modifier = Modifier
                .size(18.dp)
                .padding(top = 2.dp)
        )
        Spacer(modifier = Modifier.width(8.dp))
        Text(text = text, style = MaterialTheme.typography.bodySmall, color = GrayTextSecondary)
    }
}
