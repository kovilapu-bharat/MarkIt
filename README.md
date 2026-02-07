# Clgpo - Academic Companion App 🎓

**Clgpo** is a powerful academic tracking app built for students to manage their college life effortlessly. It automatically fetches attendance and exam results, offers smart "bunk planning" predictions, and keeps you alerted with background notifications.

## ✨ Key Features

### 📊 Attendance Tracker
*   **Auto-Fetch**: Scrapes attendance data directly from the college ERP.
*   **Visual Stats**: Beautiful progress bars and daily calendars.
*   **Offline Mode**: Caches data so you can check streaks without internet.

### 🧠 Smart Bunk Planner
*   **"Can I Bunk?"**: Select dates on a calendar to see how they impact your attendance percentage.
*   **SafetyNet**: Warns you if a planned leave drops you below the 75% threshold.
*   **Predictions**: Calculates exactly how many classes you can miss safely.

### 📈 Exam Results Hub
*   **Results Portal**: Fetches exam results from the college portal.
*   **Analysis**:
    *   **SGPA/CGPA Trends**: Interactive graphs showing performance over time.
    *   **Backlog Tracker**: Keeps a count of active backlogs.
    *   **"What If" Calculator**: Predicts required SGPA to hit your target CGPA.

### 🔔 Smart Alerts (Background Agents)
*   **Attendance Watcher**: Checks for new attendance every 15 minutes and notifies you: *"Attendance Up! 🚀"* or *"Missed a Class? 👀"*.
*   **Results Watcher**: Periodically checks for new semester results and triggers a **"SCARY HOURS"** alert when they drop.

## 🛠️ Tech Stack

*   **Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/) (SDK 50+).
*   **Language**: TypeScript.
*   **Storage**: `expo-secure-store` for encrypted credentials, `AsyncStorage` for data caching.
*   **Background Tasks**: `expo-background-fetch` & `expo-task-manager`.
*   **Parsing**: `react-native-cheerio` for HTML parsing.
*   **UI Components**: Custom glassmorphism cards, `react-native-calendars`, `react-native-gifted-charts`.

## 🚀 Getting Started

### Prerequisites
*   Node.js (LTS)
*   Expo Go app on your phone (Android/iOS)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/Clgpo.git
    cd Clgpo
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Start the app**:
    ```bash
    npx expo start
    ```

4.  **Run on Device**:
    *   Scan the QR code with the **Expo Go** app (Android) or Camera app (iOS).
    *   **Note for Background Tasks**: Background Fetch works best in a "Development Build" or standalone APK, but manual triggers are included for testing in Expo Go.

## 📱 Screenshots

| Home Dashboard | Attendance Goals | Results Analysis |
|:---:|:---:|:---:|
| *(Add Screenshot)* | *(Add Screenshot)* | *(Add Screenshot)* |

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## 📄 License

This project is licensed under the MIT License.
