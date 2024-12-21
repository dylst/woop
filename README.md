# Food Ranking App

## Overview

The **Food Ranking App** is a mobile application designed to help users discover the best food items in their area. Built with **React Native** and powered by **Supabase**, the app enables users to search for food items, leave reviews, manage favorites, and receive location-based recommendations.

---

## Features

- **User Authentication**: Sign up, log in, and log out securely.
- **Food Item Search**: Search food items with advanced filters like price, dietary preferences, and location.
- **Review and Rating System**: Leave reviews with star ratings and photos.
- **Favorites Management**: Save your favorite food items for quick access.
- **Location-Based Recommendations**: Get notified about top-rated food items nearby.
- **Real-Time Updates**: See live changes for reviews and favorites.

---

## Tech Stack

### Frontend

- **Framework**: React Native (with Expo)
- **UI Components**: React Native Elements and custom components
- **Navigation**: React Navigation

### Backend

- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-Time Updates**: Supabase Real-Time API

### Additional Tools

- **State Management**: Context API or Redux
- **Notifications**: Expo Notifications
- **Location Services**: Expo Location API

---

## Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** (v14 or higher) and npm (v6 or higher)
- **Expo CLI** (can be installed using `npm install -g expo-cli`)

### Setup

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/food-ranking-app.git
   cd food-ranking-app

   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Set Environment Variables**

   Create a .env file in the root directory and add:

   ```bash
   SUPABASE_URL=https://your-supabase-url.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Start the Development Server**

   ```bash
   npx expo start
   ```

5. **Run the App**

   Open the app on a physical device using the Expo Go app (scan the QR code).
   Alternatively, use an emulator or simulator.

### Development Workflow

1. **Branching:** Use Git branching to manage features and fixes

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Committing Changes**

   ```bash
   git add .
   git commit -m "Your commit message"
   ```

3. **Pushing to Remote**

   ```bash
   git push origin feature/your-feature-name
   ```

4. **Creating a Pull Request:** Open a PR on GitHub and request a review from a team member.

### Troubleshooting

**Expo CLI Warning**

Ensure you're using the new Expo CLI with npx expo start.

**Environment Variables Not Working**

Verify .env file is properly configured and loaded.

**Dependency Errors**

Run npm install to ensure all dependencies are installed.

**Cannot Access Supabase Backend**

Check your SUPABASE_URL and SUPABASE_ANON_KEY values in the .env file.

### License

This project is licensed under the Apache 2.0 License. See the LICENSE file for details.

### Table 




<img width="625" alt="Screenshot 2024-12-21 at 10 43 30 AM" src="https://github.com/user-attachments/assets/e74620ce-ddcb-4c5d-a720-65d554ba9d5e" />
<img width="628" alt="Screenshot 2024-12-21 at 10 44 24 AM" src="https://github.com/user-attachments/assets/b1f5df31-c8cf-4c34-81eb-456c516045f4" />
