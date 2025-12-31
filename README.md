# 🏋️ FitTrack Pro

A comprehensive fitness tracking web application with activity logging, meal planning, and insights dashboard.

## 🌐 Live Demo
**[View Live App](https://fittrack-pro-five.vercel.app)**

## ✨ Features

- 📊 **Activity Tracking** - Log workouts, steps, and calories burned
- 🍽️ **Meal Planning** - Track daily meals and calorie intake  
- 📈 **Insights Dashboard** - Visualize your fitness progress with interactive charts
- 👤 **User Profiles** - Personalized fitness goals and statistics
- 🔐 **Secure Authentication** - Google OAuth and email login via Supabase

## 🚀 Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel

## 🛠️ Local Installation

```bash
# Clone the repository
git clone https://github.com/Sarthak-77/FitTrack-Pro.git

# Navigate to project directory
cd FitTrack-Pro

# Install dependencies
npm install

# Create .env file with your Supabase credentials
cp .env.example .env
# Add your SUPABASE_URL and SUPABASE_ANON_KEY

# Start the development server
node server.js
```

Visit `http://localhost:3000` in your browser.

## 📁 Project Structure

```
FitTrack-Pro/
├── css/
│   └── styles.css          # Main stylesheet
├── js/
│   ├── app.js             # Main application logic
│   ├── auth.js            # Authentication handlers
│   ├── charts.js          # Chart visualizations
│   ├── data.js            # Data management
│   └── supabase.js        # Supabase client setup
├── routes/
│   └── api.js             # API routes
├── landing.html           # Landing page
├── login.html             # Login/signup page
├── index.html             # Dashboard
├── activity.html          # Activity tracking
├── meals.html             # Meal planning
├── insights.html          # Analytics dashboard
├── profile.html           # User profile
├── server.js              # Express server
└── vercel.json            # Vercel configuration
```

## 🎯 Key Functionality

### Activity Tracking
- Log various types of workouts
- Track duration and calories burned
- Filter activities by time of day

### Meal Planning
- Add meals for breakfast, lunch, and dinner
- Track calorie intake
- View daily nutrition summary

### Insights Dashboard
- Visual charts for steps and calories
- Weekly progress tracking
- Goal achievement monitoring

### User Authentication
- Secure login with Supabase Auth
- Google OAuth integration
- Protected routes and user sessions

## 🔒 Environment Variables

Create a `.env` file in the root directory:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=3000
```

## 📝 License

MIT License - feel free to use this project for learning!

## 👨‍💻 Author

**Sarthak Kawatra**

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## ⭐ Show your support

Give a ⭐️ if you like this project!
