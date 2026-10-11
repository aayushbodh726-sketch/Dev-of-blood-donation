# LifeFlow - Blood Donation Platform

LifeFlow is a modern blood donation platform connecting voluntary blood donors directly with patients and healthcare facilities in urgent need of blood.

## Features

- **Dashboard & Real-time Stats**: Track total registered donors, lives saved, active requests, and units donated.
- **Find Donors**: Search donors by name, city, or state. Filter by blood group (A+, A-, B+, B-, AB+, AB-, O+, O-) and availability. Instant Call and SMS contact actions.
- **Urgent Blood Appeals**: Browse open blood requests with urgency indicators (Critical, Urgent, Normal). One-tap "I Can Donate" fulfillment.
- **Blood Request Creation**: Quick form for hospitals and families to broadcast urgent blood requirements to nearby matching donors.
- **Donor Registration & Health Checklist**: Easy registration with built-in eligibility screening (age, weight, donation interval).
- **Interactive Compatibility Matrix**: Visual blood match guide showing red blood cell donor and recipient compatibility rules.

## Android Architecture

The Android application is built using modern Jetpack Compose and Material 3 design:

- **Kotlin DSL & Jetpack Compose**: 100% declarative UI with edge-to-edge support and dynamic theming.
- **Clean Architecture & Unidirectional Data Flow**: Repository layer (`LifeFlowRepository`) backed by `StateFlow` providing real-time reactivity.
- **Material 3 Components**: Fluid navigation, accessible touch targets, and automated test tags (`Modifier.testTag(...)`) across all interactive flows.
- **Custom Adaptive Launcher Icon**: Themed vector silhouette with medical cross droplet asset.
