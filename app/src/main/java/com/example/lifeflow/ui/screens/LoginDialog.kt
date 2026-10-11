package com.example.lifeflow.ui.screens

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
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
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.lifeflow.ui.theme.CrimsonRed

enum class AuthMode {
    LOGIN,
    FORGOT_PASSWORD,
    VERIFY_RESET_CODE,
    RESET_SUCCESS
}

@Composable
fun LoginDialog(
    onDismiss: () -> Unit,
    onLoginSuccess: (email: String) -> Unit = {}
) {
    val context = LocalContext.current
    var mode by remember { mutableStateOf(AuthMode.LOGIN) }

    // Login state
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var showPassword by remember { mutableStateOf(false) }

    // Forgot password state
    var resetEmail by remember { mutableStateOf("") }
    var otpCode by remember { mutableStateOf("") }
    var generatedOtp by remember { mutableStateOf("729401") }
    var newPassword by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    var showNewPassword by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    AlertDialog(
        onDismissRequest = onDismiss,
        confirmButton = {},
        dismissButton = {},
        title = null,
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("login_dialog_content"),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Header Icon
                Box(
                    modifier = Modifier
                        .size(56.dp)
                        .clip(CircleShape)
                        .background(CrimsonRed.copy(alpha = 0.12f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = when (mode) {
                            AuthMode.LOGIN -> Icons.Default.AccountCircle
                            AuthMode.FORGOT_PASSWORD, AuthMode.VERIFY_RESET_CODE -> Icons.Default.Lock
                            AuthMode.RESET_SUCCESS -> Icons.Default.CheckCircle
                        },
                        contentDescription = null,
                        tint = CrimsonRed,
                        modifier = Modifier.size(32.dp)
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                Text(
                    text = when (mode) {
                        AuthMode.LOGIN -> "Sign In to LifeFlow"
                        AuthMode.FORGOT_PASSWORD -> "Forgot Password"
                        AuthMode.VERIFY_RESET_CODE -> "Verify & Reset Password"
                        AuthMode.RESET_SUCCESS -> "Password Updated!"
                    },
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.ExtraBold,
                    color = MaterialTheme.colorScheme.onSurface
                )

                Text(
                    text = when (mode) {
                        AuthMode.LOGIN -> "Access your donor dashboard, appointments & alerts"
                        AuthMode.FORGOT_PASSWORD -> "We will send a reset verification code to your email"
                        AuthMode.VERIFY_RESET_CODE -> "Enter the 6-digit code sent to $resetEmail"
                        AuthMode.RESET_SUCCESS -> "You can now log in with your updated password"
                    },
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(top = 4.dp, bottom = 16.dp)
                )

                if (errorMessage != null) {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 12.dp)
                    ) {
                        Text(
                            text = errorMessage ?: "",
                            color = MaterialTheme.colorScheme.onErrorContainer,
                            style = MaterialTheme.typography.bodySmall,
                            modifier = Modifier.padding(10.dp)
                        )
                    }
                }

                when (mode) {
                    AuthMode.LOGIN -> {
                        OutlinedTextField(
                            value = email,
                            onValueChange = {
                                email = it
                                errorMessage = null
                            },
                            label = { Text("Email Address") },
                            leadingIcon = { Icon(Icons.Default.Email, contentDescription = null) },
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("login_email_input"),
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email)
                        )

                        Spacer(modifier = Modifier.height(10.dp))

                        OutlinedTextField(
                            value = password,
                            onValueChange = {
                                password = it
                                errorMessage = null
                            },
                            label = { Text("Password") },
                            leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null) },
                            trailingIcon = {
                                IconButton(onClick = { showPassword = !showPassword }) {
                                    Icon(
                                        imageVector = if (showPassword) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                                        contentDescription = "Toggle password"
                                    )
                                }
                            },
                            visualTransformation = if (showPassword) VisualTransformation.None else PasswordVisualTransformation(),
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("login_password_input"),
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password)
                        )

                        // FORGOT PASSWORD ACTION BUTTON
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.End
                        ) {
                            TextButton(
                                onClick = {
                                    errorMessage = null
                                    resetEmail = email.trim()
                                    mode = AuthMode.FORGOT_PASSWORD
                                },
                                modifier = Modifier.testTag("forgot_password_button")
                            ) {
                                Text(
                                    text = "Forgot Password?",
                                    color = CrimsonRed,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 12.sp
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        Button(
                            onClick = {
                                if (email.isBlank() || !email.contains("@")) {
                                    errorMessage = "Please enter a valid email address."
                                    return@Button
                                }
                                if (password.isBlank()) {
                                    errorMessage = "Please enter your password."
                                    return@Button
                                }
                                Toast.makeText(context, "Welcome back, $email!", Toast.LENGTH_SHORT).show()
                                onLoginSuccess(email)
                                onDismiss()
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(48.dp)
                                .testTag("login_submit_button"),
                            colors = ButtonDefaults.buttonColors(containerColor = CrimsonRed),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text("Sign In", fontWeight = FontWeight.Bold)
                        }

                        // Demo Quick Fill
                        TextButton(
                            onClick = {
                                email = "sarah.j@example.com"
                                password = "password123"
                            }
                        ) {
                            Text("Demo: Fill Sarah's Account", fontSize = 11.sp, color = Color.Gray)
                        }
                    }

                    AuthMode.FORGOT_PASSWORD -> {
                        OutlinedTextField(
                            value = resetEmail,
                            onValueChange = {
                                resetEmail = it
                                errorMessage = null
                            },
                            label = { Text("Registered Email Address") },
                            leadingIcon = { Icon(Icons.Default.Email, contentDescription = null) },
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("forgot_email_input"),
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email)
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        Button(
                            onClick = {
                                if (resetEmail.isBlank() || !resetEmail.contains("@")) {
                                    errorMessage = "Please enter your valid registered email."
                                    return@Button
                                }
                                generatedOtp = (100000..999999).random().toString()
                                Toast.makeText(
                                    context,
                                    "Verification code ($generatedOtp) sent to $resetEmail!",
                                    Toast.LENGTH_LONG
                                ).show()
                                mode = AuthMode.VERIFY_RESET_CODE
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(48.dp)
                                .testTag("send_reset_code_button"),
                            colors = ButtonDefaults.buttonColors(containerColor = CrimsonRed),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Icon(Icons.Default.Send, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Send Reset Code to Email", fontWeight = FontWeight.Bold)
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        TextButton(
                            onClick = {
                                errorMessage = null
                                mode = AuthMode.LOGIN
                            }
                        ) {
                            Icon(Icons.Default.ArrowBack, contentDescription = null, modifier = Modifier.size(14.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Back to Sign In", fontWeight = FontWeight.SemiBold)
                        }
                    }

                    AuthMode.VERIFY_RESET_CODE -> {
                        Card(
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(bottom = 12.dp)
                        ) {
                            Column(modifier = Modifier.padding(10.dp)) {
                                Text("Check your email: $resetEmail", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                Text("Test code: $generatedOtp", fontSize = 11.sp, color = CrimsonRed)
                            }
                        }

                        OutlinedTextField(
                            value = otpCode,
                            onValueChange = {
                                otpCode = it.filter { ch -> ch.isDigit() }.take(6)
                                errorMessage = null
                            },
                            label = { Text("6-Digit Verification Code") },
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("otp_code_input"),
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                        )

                        Spacer(modifier = Modifier.height(10.dp))

                        OutlinedTextField(
                            value = newPassword,
                            onValueChange = {
                                newPassword = it
                                errorMessage = null
                            },
                            label = { Text("New Password (min 6 chars)") },
                            visualTransformation = if (showNewPassword) VisualTransformation.None else PasswordVisualTransformation(),
                            trailingIcon = {
                                IconButton(onClick = { showNewPassword = !showNewPassword }) {
                                    Icon(
                                        imageVector = if (showNewPassword) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                                        contentDescription = null
                                    )
                                }
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("new_password_input"),
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password)
                        )

                        Spacer(modifier = Modifier.height(10.dp))

                        OutlinedTextField(
                            value = confirmPassword,
                            onValueChange = {
                                confirmPassword = it
                                errorMessage = null
                            },
                            label = { Text("Confirm New Password") },
                            visualTransformation = if (showNewPassword) VisualTransformation.None else PasswordVisualTransformation(),
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("confirm_password_input"),
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password)
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        Button(
                            onClick = {
                                if (otpCode.length < 4) {
                                    errorMessage = "Please enter the 6-digit verification code."
                                    return@Button
                                }
                                if (newPassword.length < 6) {
                                    errorMessage = "Password must be at least 6 characters."
                                    return@Button
                                }
                                if (newPassword != confirmPassword) {
                                    errorMessage = "Passwords do not match."
                                    return@Button
                                }
                                Toast.makeText(context, "Password updated successfully!", Toast.LENGTH_SHORT).show()
                                mode = AuthMode.RESET_SUCCESS
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(48.dp)
                                .testTag("submit_reset_password_button"),
                            colors = ButtonDefaults.buttonColors(containerColor = CrimsonRed),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text("Verify Code & Reset Password", fontWeight = FontWeight.Bold)
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        TextButton(
                            onClick = {
                                errorMessage = null
                                mode = AuthMode.FORGOT_PASSWORD
                            }
                        ) {
                            Text("Change Email or Resend", fontSize = 12.sp)
                        }
                    }

                    AuthMode.RESET_SUCCESS -> {
                        Button(
                            onClick = {
                                email = resetEmail
                                password = ""
                                mode = AuthMode.LOGIN
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(48.dp)
                                .testTag("proceed_login_button"),
                            colors = ButtonDefaults.buttonColors(containerColor = CrimsonRed),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text("Proceed to Sign In", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        },
        shape = RoundedCornerShape(24.dp)
    )
}
