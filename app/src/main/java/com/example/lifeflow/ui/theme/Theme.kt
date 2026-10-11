package com.example.lifeflow.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val LightColorScheme = lightColorScheme(
    primary = CrimsonRed,
    onPrimary = GraySurface,
    primaryContainer = CrimsonLight,
    onPrimaryContainer = CrimsonDeep,
    secondary = CrimsonDark,
    onSecondary = GraySurface,
    background = GrayBackground,
    onBackground = GrayTextPrimary,
    surface = GraySurface,
    onSurface = GrayTextPrimary,
    surfaceVariant = GrayBorder,
    onSurfaceVariant = GrayTextSecondary,
    outline = GrayBorder
)

private val DarkColorScheme = darkColorScheme(
    primary = CrimsonRed,
    onPrimary = GraySurface,
    primaryContainer = CrimsonDeep,
    onPrimaryContainer = CrimsonLight,
    secondary = AccentRose,
    onSecondary = GraySurface,
    background = Color(0xFF121212),
    onBackground = Color(0xFFF3F4F6),
    surface = Color(0xFF1E1E1E),
    onSurface = Color(0xFFF3F4F6),
    surfaceVariant = Color(0xFF2D2D2D),
    onSurfaceVariant = Color(0xFF9CA3AF),
    outline = Color(0xFF3F3F46)
)

@Composable
fun LifeFlowTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.background.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
