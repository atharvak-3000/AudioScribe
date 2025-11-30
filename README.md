# MeetSummary - Video Conferencing Platform with AI Summarization

<div align="center">
  <br />
  <h3 align="center">A Modern Video Conferencing Platform</h3>
  <p align="center">
    Built with Next.js, featuring AI-powered meeting summarization using Google Gemini
  </p>
</div>

## 🚀 Features

- **Video Conferencing**: Real-time video calls with screen sharing, recording, and participant management
- **AI Meeting Summarization**: Automatically generate intelligent summaries of recorded meetings using Google Gemini AI
- **Authentication**: Secure login with Clerk authentication
- **Meeting Management**: Schedule, join, and manage meetings with ease
- **Recording Playback**: View and summarize past meeting recordings
- **Personal Rooms**: Create permanent meeting rooms with unique links

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Authentication**: Clerk
- **Video SDK**: Stream.io
- **AI Integration**: Google Gemini API
- **Styling**: Tailwind CSS, shadcn/ui
- **UI Components**: Radix UI

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Clerk account (for authentication)
- Stream.io account (for video functionality)
- Google Gemini API key (for meeting summarization)

## 🔧 Installation

1. **Clone the repository**
```bash
git clone https://github.com/atharvak-3000/MeetSummary.git
cd MeetSummary
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Stream.io Video
NEXT_PUBLIC_STREAM_API_KEY=your_stream_api_key
STREAM_SECRET_KEY=your_stream_secret_key

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Google Gemini API (for meeting summarization)
GEMINI_API_KEY=your_gemini_api_key
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Key Features

### Meeting Summarization
- Record meetings and generate AI-powered summaries
- View summaries directly from the recordings page
- Clean, readable summaries without markdown formatting

### Video Conferencing
- Start instant meetings or schedule future ones
- Join meetings via invitation links
- Full meeting controls (mute, video, screen share, etc.)
- Grid and speaker view layouts

### Meeting Management
- View upcoming meetings
- Access past meeting recordings
- Personal meeting room with permanent link

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   └── summarize/          # Meeting summarization API
│   ├── (auth)/                 # Authentication pages
│   ├── (root)/                 # Main application pages
│   └── meeting/                # Meeting room pages
├── components/
│   ├── ui/                     # Reusable UI components
│   └── ...                     # Feature components
├── hooks/                      # Custom React hooks
├── constants/                  # App constants
└── lib/                        # Utility functions
```

## 🔐 Getting API Keys

### Clerk (Authentication)
1. Sign up at [clerk.com](https://clerk.com/)
2. Create a new application
3. Copy your publishable key and secret key

### Stream.io (Video)
1. Sign up at [getstream.io](https://getstream.io/)
2. Create a new application
3. Copy your API key and secret key

### Google Gemini (AI Summarization)
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Create a new API key
4. Copy your API key

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add your environment variables
4. Deploy!

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- Render

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

Built with ❤️ using Next.js and Google Gemini AI
