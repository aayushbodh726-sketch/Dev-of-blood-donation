package com.example.lifeflow.ui

import androidx.compose.animation.Crossfade
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.LocalHospital
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.WaterDrop
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import com.example.lifeflow.data.LifeFlowRepository
import com.example.lifeflow.model.Donor
import com.example.lifeflow.ui.screens.*
import com.example.lifeflow.ui.theme.CrimsonRed

sealed interface Screen {
    data object Home : Screen
    data object Dashboard : Screen
    data object Donors : Screen
    data object Requests : Screen
    data object Compatibility : Screen
    data class CreateRequest(val targetDonor: Donor? = null) : Screen
    data object RegisterDonor : Screen
}

enum class NavigationItem(val label: String, val icon: ImageVector, val tag: String) {
    HOME("Home", Icons.Default.Home, "nav_home"),
    DASHBOARD("My Portal", Icons.Default.AccountCircle, "nav_dashboard"),
    DONORS("Donors", Icons.Default.People, "nav_donors"),
    REQUESTS("Requests", Icons.Default.LocalHospital, "nav_requests"),
    COMPATIBILITY("Matches", Icons.Default.WaterDrop, "nav_compatibility")
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LifeFlowApp(
    repository: LifeFlowRepository = LifeFlowRepository.instance
) {
    var currentScreen by remember { mutableStateOf<Screen>(Screen.Home) }

    Scaffold(
        bottomBar = {
            if (currentScreen !is Screen.CreateRequest && currentScreen !is Screen.RegisterDonor) {
                NavigationBar(
                    containerColor = MaterialTheme.colorScheme.surface,
                    modifier = Modifier.testTag("bottom_navigation_bar")
                ) {
                    NavigationItem.entries.forEach { item ->
                        val isSelected = when (item) {
                            NavigationItem.HOME -> currentScreen is Screen.Home
                            NavigationItem.DASHBOARD -> currentScreen is Screen.Dashboard
                            NavigationItem.DONORS -> currentScreen is Screen.Donors
                            NavigationItem.REQUESTS -> currentScreen is Screen.Requests
                            NavigationItem.COMPATIBILITY -> currentScreen is Screen.Compatibility
                        }

                        NavigationBarItem(
                            selected = isSelected,
                            onClick = {
                                currentScreen = when (item) {
                                    NavigationItem.HOME -> Screen.Home
                                    NavigationItem.DASHBOARD -> Screen.Dashboard
                                    NavigationItem.DONORS -> Screen.Donors
                                    NavigationItem.REQUESTS -> Screen.Requests
                                    NavigationItem.COMPATIBILITY -> Screen.Compatibility
                                }
                            },
                            icon = { Icon(item.icon, contentDescription = item.label) },
                            label = { Text(item.label, fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal) },
                            modifier = Modifier.testTag(item.tag),
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = CrimsonRed,
                                selectedTextColor = CrimsonRed,
                                indicatorColor = CrimsonRed.copy(alpha = 0.12f)
                            )
                        )
                    }
                }
            }
        }
    ) { innerPadding ->
        Crossfade(
            targetState = currentScreen,
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding),
            label = "ScreenTransition"
        ) { screen ->
            when (screen) {
                is Screen.Home -> HomeScreen(
                    repository = repository,
                    onNavigateToDonors = { currentScreen = Screen.Donors },
                    onNavigateToRequests = { currentScreen = Screen.Requests },
                    onNavigateToCreateRequest = { currentScreen = Screen.CreateRequest() },
                    onNavigateToRegisterDonor = { currentScreen = Screen.RegisterDonor },
                    onNavigateToCompatibility = { currentScreen = Screen.Compatibility }
                )
                is Screen.Dashboard -> DonorDashboardScreen(
                    repository = repository,
                    onNavigateToCreateRequest = { currentScreen = Screen.CreateRequest() }
                )
                is Screen.Donors -> DonorsScreen(
                    repository = repository,
                    onNavigateToRegister = { currentScreen = Screen.RegisterDonor },
                    onRequestDonor = { donor -> currentScreen = Screen.CreateRequest(donor) }
                )
                is Screen.Requests -> RequestsScreen(
                    repository = repository,
                    onNavigateToCreateRequest = { currentScreen = Screen.CreateRequest() }
                )
                is Screen.Compatibility -> CompatibilityScreen(
                    repository = repository
                )
                is Screen.CreateRequest -> CreateRequestScreen(
                    repository = repository,
                    targetDonor = screen.targetDonor,
                    onBack = { currentScreen = Screen.Requests }
                )
                is Screen.RegisterDonor -> RegisterDonorScreen(
                    repository = repository,
                    onBack = { currentScreen = Screen.Donors }
                )
            }
        }
    }
}
