<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

🚀 VISOR – AI Supply Chain Risk Monitor

VISOR is a high-fidelity logistics monitoring dashboard designed to identify, categorize, and mitigate supplier risks in real time.
By integrating live weather and news data with LLM-driven analysis, VISOR replaces static spreadsheets with dynamic, data-driven decision-making.

🌐 Live Application

🔗 https://visor-934259760793.us-west1.run.app

----
## ✨ Key Features
* Automated Risk Categorization
* Uses real-time news and weather signals analyzed via LLMs to classify suppliers into Stable, Caution, or Risky states.
* Geospatial Intelligence
* Interactive map visualization of supplier locations with live weather overlays and alerts.
* AI-Powered Decision Engine
* Leverages Gemini 3 Flash to autonomously assess supplier stability and contextual risk.
* Cloud-Native Architecture
* Fully containerized and deployed on Cloud Run for scalable, low-latency access.
* Production-Ready Security
* Implements API key management, spend caps, and secure environment configurations.

---
## 🛠️ Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS (Modern/Grunge UI)

### Backend

* Node.js (Express 5)
* TypeScript

### AI/ML

* Gemini 3 Flash (via Google AI Studio)

### Cloud & Infrastructure

* Google Cloud Run (Containerized deployment)
* Google AlloyDB (PostgreSQL-compatible database)

## APIs & Integrations

* OpenWeather API
* NewsAPI
* Google Maps JavaScript API

---  
## 🏗️ Architecture Overview
### VISOR follows a cloud-native, event-driven architecture:

* External APIs (weather + news) provide real-time signals
* Backend processes and structures incoming data
* LLM (Gemini) performs contextual risk analysis
* Results are stored and served via scalable cloud infrastructure
* Frontend dashboard visualizes risks and alerts in real time

---
## ⚙️ Local Setup
1. Clone the Repository
```bash
git clone https://github.com/your-username/VISOR.git
cd VISOR
```
2. Install Dependencies
```bash
npm install
```
3. Configure Environment Variables

#### Create a .env file in the root directory:
```bash
GEMINI_API_KEY=your_key_here
VITE_GOOGLE_MAPS_API_KEY=your_key_here
PORT=8080
```
4. Run the Development Server
```bash
npm run dev
```
---
## 🚀 Deployment

VISOR is deployed using Google Cloud Run with a containerized setup.

To deploy a new revision:
```bash
gcloud run deploy visor --source . --region us-west1
```
---


## 📌 Project Context

This project was developed as a capstone submission for the BUILD the Future Showcase under Startup School (Google initiative), focusing on rapid prototyping of AI-powered applications.
---

## 💡 Future Improvements
* Predictive risk modeling using historical trends
* Supplier scoring dashboards with analytics
* Multi-region deployment for lower latency
* Alert integrations (email/SMS/webhooks)

---
## 🧠 Key Takeaways
* Built an end-to-end AI system combining LLMs, real-time data, and cloud infrastructure
* Designed for scalability, interpretability, and real-world applicability
* Demonstrates strong understanding of full-stack + cloud + AI integration
---
