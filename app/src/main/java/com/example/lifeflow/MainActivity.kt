package com.example.lifeflow

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.example.lifeflow.ui.LifeFlowApp
import com.example.lifeflow.ui.theme.LifeFlowTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            LifeFlowTheme {
                LifeFlowApp()
            }
        }
    }
}
