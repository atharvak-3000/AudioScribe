# AudioScribeSummarize - Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Working Flow](#working-flow)
5. [Requirements](#requirements)
6. [Limits & Constraints](#limits--constraints)
7. [Future Scope](#future-scope)

---

## Project Overview

**AudioScribeSummarize** (also known as YOOM) is a modern video conferencing application that replicates Zoom's core functionality with an added AI-powered feature for automatic meeting summarization. The application enables users to create, join, schedule, and record video meetings, with the ability to generate intelligent summaries of recorded meetings using Google's Gemini AI.

### Key Features
- Real-time video conferencing with multiple participants
- Meeting scheduling and management
- Meeting recording capabilities
- AI-powered meeting summarization
- Personal meeting rooms
- Secure authentication and authorization
- Responsive design for all devices

---

## Architecture

### System Architecture

The application follows a **modern full-stack architecture** with the following layers:

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer (Browser)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   React      │  │  Next.js     │  │  Stream SDK   │     │
│  │  Components  │  │  App Router  │  │  Video SDK    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 Next.js Server Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   API Routes │  │  Middleware   │  │  Server      │     │
│  │  /api/*      │  │  (Auth)       │  │  Actions     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Clerk      │  │   Stream.io  │  │  Google      │
│  Auth Service│  │  Video API   │  │  Gemini AI   │
└──────────────┘  └──────────────┘  └──────────────┘
```

### Component Architecture

The application uses a **component-based architecture** with the following structure:

```
components/
├── ui/                    # Reusable UI components (shadcn/ui)
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── ...
├── MeetingCard.tsx        # Meeting card display component
├── MeetingRoom.tsx        # Main video meeting interface
├── MeetingSetup.tsx       # Pre-meeting setup screen
├── MeetingTypeList.tsx    # Meeting type selection
├── Navbar.tsx            # Navigation bar
├── Sidebar.tsx           # Side navigation
└── ...

app/
├── (auth)/               # Authentication routes
│   ├── sign-in/
│   └── sign-up/
├── (root)/               # Protected routes
│   ├── (home)/
│   │   ├── page.tsx      # Home dashboard
│   │   ├── upcoming/     # Upcoming meetings
│   │   ├── previous/     # Past meetings
│   │   ├── recordings/   # Meeting recordings
│   │   └── personal-room/# Personal room
│   └── meeting/[id]/     # Dynamic meeting route
└── api/
    └── summarize/        # AI summarization endpoint
```

### Data Flow Architecture

1. **Authentication Flow**
   - User signs in/up via Clerk
   - Clerk middleware protects routes
   - User session managed by Clerk

2. **Meeting Creation Flow**
   - User selects meeting type (instant/scheduled/personal)
   - Stream.io creates call object
   - Meeting link generated
   - User redirected to meeting room

3. **Video Conferencing Flow**
   - Stream.io SDK initializes video client
   - Token generated via server action
   - Participants join via WebRTC
   - Real-time communication established

4. **Summarization Flow**
   - Recording URL fetched from Stream.io
   - Recording downloaded as buffer
   - Base64 encoded and sent to Gemini AI
   - AI processes and generates summary
   - Summary displayed to user

---

## Tech Stack

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14.1.3 | React framework with App Router, SSR, and API routes |
| **React** | 18.x | UI library for building interactive components |
| **TypeScript** | 5.x | Type-safe JavaScript for better development experience |
| **Tailwind CSS** | 3.3.0 | Utility-first CSS framework for styling |
| **shadcn/ui** | Latest | Pre-built accessible UI components |
| **Radix UI** | Various | Headless UI primitives for accessible components |
| **Lucide React** | 0.350.0 | Icon library |

### Backend & Services

| Service | Purpose |
|---------|---------|
| **Next.js API Routes** | Server-side API endpoints for business logic |
| **Clerk** | Authentication and user management service |
| **Stream.io Video SDK** | Real-time video conferencing infrastructure |
| **Google Gemini AI** | AI-powered meeting summarization |

### Development Tools

| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting and quality checks |
| **Prettier** | Code formatting |
| **TypeScript** | Static type checking |
| **PostCSS** | CSS processing |
| **Autoprefixer** | CSS vendor prefixing |

### Key Libraries

- **@clerk/nextjs**: Clerk authentication integration
- **@stream-io/video-react-sdk**: Stream.io video SDK for React
- **@stream-io/node-sdk**: Stream.io server-side SDK
- **@google/generative-ai**: Google Gemini AI integration
- **date-fns**: Date manipulation utilities
- **uuid**: Unique ID generation
- **class-variance-authority**: Component variant management
- **clsx**: Conditional class name utility
- **tailwind-merge**: Tailwind class merging utility

---

## Working Flow

### 1. Authentication Flow

```
User → Sign In/Sign Up Page → Clerk Authentication
  ↓
Clerk validates credentials
  ↓
User session created
  ↓
Middleware checks authentication
  ↓
User redirected to home page
```

**Implementation Details:**
- Clerk handles all authentication logic
- Middleware (`middleware.ts`) protects routes
- User session persists across page reloads
- UserButton component displays user profile

### 2. Meeting Creation Flow

```
User clicks "New Meeting" → MeetingTypeList component
  ↓
User selects meeting type:
  - Instant Meeting
  - Schedule Meeting
  - Join Meeting
  - Personal Room
  ↓
For Instant/Scheduled:
  - Stream.io creates call object
  - Meeting ID generated (UUID)
  - Meeting link created
  ↓
User redirected to /meeting/[id]
```

**Meeting Types:**
- **Instant Meeting**: Starts immediately
- **Scheduled Meeting**: Set date/time, stored in Stream.io
- **Join Meeting**: Enter meeting link/ID
- **Personal Room**: Permanent room with fixed link

### 3. Meeting Setup Flow

```
User enters meeting room → MeetingSetup component
  ↓
Video preview displayed
  ↓
User configures:
  - Camera on/off
  - Microphone on/off
  - Device selection
  ↓
User clicks "Join Meeting"
  ↓
Stream.io SDK joins call
  ↓
MeetingRoom component rendered
```

**Setup Features:**
- Video preview before joining
- Toggle camera/microphone
- Device settings (camera/mic selection)
- Check if meeting has started (for scheduled)
- Check if meeting has ended

### 4. Video Conferencing Flow

```
MeetingRoom component loads
  ↓
Stream.io SDK initializes:
  - WebRTC connections
  - Media streams
  - Signaling
  ↓
Participants join:
  - Video/audio streams shared
  - Real-time communication established
  ↓
Meeting controls available:
  - Mute/unmute
  - Camera on/off
  - Screen share
  - Layout switching (Grid/Speaker)
  - Participant list
  - Call stats
  - End call
```

**Meeting Controls:**
- **CallControls**: Mute, camera, screen share, leave
- **Layout Options**: Grid view, Speaker view (left/right)
- **Participant Management**: View participants, pin, mute, block
- **Recording**: Start/stop recording (host only)
- **End Call**: Leave or end for all participants

### 5. Recording Flow

```
Host starts recording → Stream.io begins recording
  ↓
Recording stored on Stream.io servers
  ↓
After meeting ends:
  - Recording URL available
  - Recording appears in "Recordings" page
  ↓
Recording metadata stored:
  - Recording URL
  - Recording ID
  - Start/end time
  - Participants
```

### 6. Summarization Flow

```
User views recording → Clicks "Summarize" button
  ↓
Frontend sends POST request to /api/summarize
  ↓
API Route:
  1. Validates user authentication
  2. Fetches recording URL from request
  3. Downloads recording file
  4. Converts to base64
  5. Determines MIME type
  ↓
Google Gemini AI:
  1. Initializes Gemini client
  2. Tests available models
  3. Sends recording + prompt
  4. Receives summary
  ↓
Summary returned to frontend
  ↓
Summary displayed in dialog
```

**Summarization Process:**
1. **Recording Download**: Fetches recording from Stream.io URL
2. **File Processing**: Converts to base64, determines MIME type
3. **Model Selection**: Tests available Gemini models (gemini-pro, gemini-1.5-pro, etc.)
4. **AI Processing**: Sends recording and structured prompt to Gemini
5. **Summary Generation**: AI analyzes audio/video and generates structured summary
6. **Response**: Summary returned with sections:
   - Meeting Overview
   - Key Topics Discussed
   - Decisions Made
   - Action Items
   - Important Highlights
   - Next Steps

### 7. Meeting Management Flow

```
Home Page → Displays:
  - Current time/date
  - Upcoming meeting (if any)
  - Meeting type options
  ↓
Sidebar Navigation:
  - Home
  - Upcoming Meetings
  - Previous Meetings
  - Recordings
  - Personal Room
  ↓
Each page queries Stream.io:
  - useGetCalls hook fetches calls
  - Filters by date/time
  - Displays in MeetingCard components
```

**Data Fetching:**
- `useGetCalls`: Fetches all user's calls
- Filters: `endedCalls`, `upcomingCalls`, `callRecordings`
- `useGetCallById`: Fetches specific call by ID
- Real-time updates via Stream.io SDK

---

## Requirements

### System Requirements

#### Development Environment
- **Node.js**: Version 18.x or higher
- **npm**: Version 9.x or higher (or yarn/pnpm)
- **Git**: For version control
- **Code Editor**: VS Code recommended (with extensions)

#### Runtime Requirements
- **Modern Browser**: Chrome, Firefox, Safari, Edge (latest versions)
- **WebRTC Support**: Required for video conferencing
- **Microphone & Camera**: Required for video meetings
- **Internet Connection**: Stable connection for video calls

### API Keys & Services

#### 1. Clerk Authentication
- **NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY**: Public Clerk key
- **CLERK_SECRET_KEY**: Secret Clerk key
- **Sign-up**: [https://clerk.com](https://clerk.com)

#### 2. Stream.io Video
- **NEXT_PUBLIC_STREAM_API_KEY**: Public Stream.io API key
- **STREAM_SECRET_KEY**: Secret Stream.io key
- **Sign-up**: [https://getstream.io](https://getstream.io)
- **Plan**: Free tier available (with limitations)

#### 3. Google Gemini AI
- **GEMINI_API_KEY**: Google AI Studio API key
- **Sign-up**: [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
- **Plan**: Free tier available (with rate limits)

### Environment Variables

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

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key
```

### Installation Steps

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd AudioScribeSummarize/zoom-clone
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**
   - Create `.env.local` file
   - Add all required API keys

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

### Browser Permissions

Users must grant:
- **Camera Access**: For video streaming
- **Microphone Access**: For audio streaming
- **Screen Share**: For screen sharing feature

---

## Limits & Constraints

### Stream.io Limits (Free Tier)

| Feature | Limit |
|---------|-------|
| **Concurrent Participants** | Up to 5 participants |
| **Meeting Duration** | Limited (varies by plan) |
| **Recording Storage** | Limited storage space |
| **API Rate Limits** | Request limits apply |
| **Bandwidth** | Limited bandwidth per month |

**Note**: Upgrade to paid plan for higher limits.

### Google Gemini AI Limits (Free Tier)

| Feature | Limit |
|---------|-------|
| **File Size** | ~20MB maximum per file |
| **Rate Limits** | 15 requests per minute (RPM) |
| **Daily Quota** | Limited requests per day |
| **Model Availability** | Some models may not be available |
| **Processing Time** | May take 30-60 seconds for large files |

**Common Issues:**
- **Rate Limit Exceeded**: Wait a few minutes before retrying
- **File Too Large**: Recording exceeds 20MB limit
- **Model Not Found**: API key may not have access to certain models
- **Timeout**: Large files may timeout (implement retry logic)

### Application Constraints

#### 1. Recording Summarization
- **File Format**: Supports MP4, MP3, WAV formats
- **File Size**: Maximum ~20MB (Gemini free tier)
- **Processing Time**: 30-60 seconds for typical recordings
- **Error Handling**: Retry logic implemented for rate limits

#### 2. Meeting Features
- **Participant Limit**: Depends on Stream.io plan (5 for free tier)
- **Recording**: Only host can start/stop recording
- **Scheduled Meetings**: Must have start time in future
- **Personal Room**: One per user, permanent link

#### 3. Browser Compatibility
- **WebRTC**: Required for video/audio
- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile**: Limited functionality on mobile browsers
- **Screen Share**: Browser-dependent support

#### 4. Network Requirements
- **Bandwidth**: Minimum 1 Mbps for video calls
- **Latency**: Low latency preferred for real-time communication
- **Stability**: Stable connection required for quality calls

### Known Limitations

1. **Summarization Accuracy**
   - Depends on audio/video quality
   - May miss context in noisy recordings
   - Language support limited to Gemini's capabilities

2. **Real-time Performance**
   - Depends on user's network and device
   - Large meetings may experience lag
   - Screen sharing may impact performance

3. **Storage**
   - Recordings stored on Stream.io servers
   - No local storage of recordings
   - Limited by Stream.io plan

4. **Scalability**
   - Free tier not suitable for production
   - Requires paid plans for enterprise use
   - No load balancing for high traffic

---

## Future Scope

### Short-term Enhancements (1-3 months)

#### 1. Enhanced Summarization
- **Multi-language Support**: Support for multiple languages
- **Custom Prompts**: Allow users to customize summary format
- **Summary Export**: Export summaries as PDF, DOCX, or TXT
- **Summary History**: Store and retrieve past summaries
- **Real-time Transcription**: Live transcription during meetings

#### 2. Meeting Features
- **Breakout Rooms**: Split participants into smaller groups
- **Polling & Q&A**: Interactive features during meetings
- **Whiteboard**: Collaborative whiteboard feature
- **Chat Integration**: In-meeting text chat
- **Reactions**: Emoji reactions during meetings

#### 3. User Experience
- **Dark/Light Theme**: Theme switching option
- **Accessibility**: Improved screen reader support
- **Mobile App**: Native mobile applications (iOS/Android)
- **Offline Mode**: Basic offline functionality
- **Keyboard Shortcuts**: Power user shortcuts

#### 4. Analytics & Reporting
- **Meeting Analytics**: Duration, attendance, engagement
- **Usage Statistics**: User activity dashboard
- **Export Reports**: Generate meeting reports
- **Integration**: Calendar integration (Google, Outlook)

### Medium-term Enhancements (3-6 months)

#### 1. Advanced AI Features
- **Action Item Extraction**: Automatic task extraction
- **Sentiment Analysis**: Analyze meeting sentiment
- **Key Speaker Identification**: Identify main speakers
- **Topic Clustering**: Group related discussions
- **Follow-up Suggestions**: AI-suggested follow-ups

#### 2. Collaboration Tools
- **Document Sharing**: Share and collaborate on documents
- **Note-taking**: Collaborative note-taking during meetings
- **Agenda Management**: Create and manage meeting agendas
- **Meeting Templates**: Pre-defined meeting templates
- **Recurring Meetings**: Schedule recurring meetings

#### 3. Integration & APIs
- **Slack Integration**: Notifications and meeting links
- **Microsoft Teams**: Integration with Teams
- **Zoom Compatibility**: Import Zoom meetings
- **CRM Integration**: Connect with CRM systems
- **REST API**: Public API for third-party integrations

#### 4. Enterprise Features
- **SSO (Single Sign-On)**: Enterprise authentication
- **User Management**: Admin dashboard for user management
- **Custom Branding**: White-label solution
- **Advanced Security**: End-to-end encryption
- **Compliance**: GDPR, HIPAA compliance features

### Long-term Vision (6-12 months)

#### 1. AI-Powered Features
- **Meeting Insights**: AI-generated insights and recommendations
- **Smart Scheduling**: AI suggests optimal meeting times
- **Automated Follow-ups**: AI-generated follow-up emails
- **Meeting Quality Score**: Rate meeting effectiveness
- **Predictive Analytics**: Predict meeting outcomes

#### 2. Platform Expansion
- **Webinar Support**: Large-scale webinars (1000+ participants)
- **Live Streaming**: Stream meetings to external platforms
- **Recording Studio**: Advanced recording and editing tools
- **Video Library**: Organize and search recordings
- **Content Management**: Manage meeting content and assets

#### 3. Advanced Collaboration
- **Virtual Workspaces**: Persistent virtual meeting rooms
- **3D Avatars**: Virtual reality meeting experience
- **Spatial Audio**: 3D audio positioning
- **Gesture Recognition**: Control meetings with gestures
- **AI Meeting Assistant**: AI co-host for meetings

#### 4. Business Intelligence
- **Meeting ROI**: Calculate meeting return on investment
- **Team Analytics**: Team performance metrics
- **Trend Analysis**: Identify meeting patterns and trends
- **Cost Optimization**: Suggest cost-saving measures
- **Custom Dashboards**: Personalized analytics dashboards

### Technical Improvements

#### 1. Performance Optimization
- **Code Splitting**: Optimize bundle sizes
- **Caching Strategy**: Implement advanced caching
- **CDN Integration**: Content delivery network
- **Progressive Web App**: PWA capabilities
- **Service Workers**: Offline functionality

#### 2. Scalability
- **Microservices**: Break into microservices architecture
- **Load Balancing**: Distribute load across servers
- **Database Optimization**: Optimize database queries
- **Caching Layer**: Redis/Memcached integration
- **Message Queue**: Queue system for async tasks

#### 3. Security Enhancements
- **End-to-End Encryption**: Encrypt all communications
- **Two-Factor Authentication**: Additional security layer
- **Audit Logs**: Comprehensive audit trail
- **Data Residency**: Control data location
- **Penetration Testing**: Regular security audits

#### 4. Developer Experience
- **API Documentation**: Comprehensive API docs
- **SDK Development**: Client SDKs for popular languages
- **Testing Suite**: Unit, integration, E2E tests
- **CI/CD Pipeline**: Automated deployment
- **Monitoring & Logging**: Advanced monitoring tools

### Research & Innovation

1. **AI Research**
   - Advanced NLP models for better summarization
   - Real-time translation during meetings
   - Voice cloning for meeting notes
   - Emotion detection and analysis

2. **Emerging Technologies**
   - WebRTC improvements and new standards
   - WebAssembly for performance
   - WebGPU for advanced graphics
   - Blockchain for meeting verification

3. **User Research**
   - User behavior analysis
   - Meeting effectiveness studies
   - Remote work impact research
   - Accessibility improvements

---

## Additional Information

### Project Structure

```
zoom-clone/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication routes
│   ├── (root)/            # Protected routes
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # UI components
│   └── ...               # Feature components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── providers/            # Context providers
├── actions/              # Server actions
├── constants/            # Constants and config
├── public/              # Static assets
└── middleware.ts        # Next.js middleware
```

### Key Files

- **`app/api/summarize/route.ts`**: AI summarization API endpoint
- **`components/MeetingRoom.tsx`**: Main video meeting interface
- **`components/MeetingCard.tsx`**: Meeting card with summarization
- **`providers/StreamClientProvider.tsx`**: Stream.io client provider
- **`actions/stream.actions.ts`**: Stream.io token generation
- **`middleware.ts`**: Route protection middleware

### Development Guidelines

1. **Code Style**: Follow TypeScript and React best practices
2. **Component Structure**: Keep components small and reusable
3. **Error Handling**: Implement comprehensive error handling
4. **Loading States**: Show loading indicators for async operations
5. **Responsive Design**: Ensure mobile-friendly design
6. **Accessibility**: Follow WCAG guidelines
7. **Performance**: Optimize bundle size and load times

### Deployment

**Recommended Platforms:**
- **Vercel**: Optimal for Next.js applications
- **Netlify**: Alternative deployment option
- **AWS/Azure/GCP**: For enterprise deployments

**Environment Setup:**
- Set all environment variables in deployment platform
- Configure CORS if needed
- Set up monitoring and logging
- Configure custom domain and SSL

---

## Conclusion

AudioScribeSummarize is a comprehensive video conferencing solution with AI-powered summarization capabilities. The application leverages modern web technologies to provide a seamless meeting experience with intelligent post-meeting analysis. With proper setup and understanding of the architecture, the application can be extended and customized to meet specific business needs.

For questions, issues, or contributions, please refer to the project repository or contact the development team.

---

**Last Updated**: 2024
**Version**: 1.0.0
**License**: [Specify License]

