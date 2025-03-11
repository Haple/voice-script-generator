
# 🎭 Voice Script Generator

![Script Generator Banner](https://i.imgur.com/nReL6WH.png)

A modern web application for creating voice-acted scripts with multiple actors. Perfect for storytelling, dialogue writing, voiceovers, and animated character interactions.

## ✨ Features

- 🎬 Create scripts with multiple actors
- 🗣️ Generate realistic voice-overs using ElevenLabs' AI voices
- 👥 Customize actors with names, emoji avatars, and voices
- 🎵 Play individual lines or the entire script in sequence
- ✏️ Edit and re-generate specific lines at any time
- 🔄 Drag and drop interface for rearranging dialogue lines

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- An [ElevenLabs](https://elevenlabs.io/) account with API key

### Setup Instructions

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/voice-script-generator.git
   cd voice-script-generator
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up your ElevenLabs API key**

   Create a `.env.local` file in the project root with the following content:

   ```
   ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**

   Visit [http://localhost:3000](http://localhost:3000) to use the application

## 🔑 API Key and Voices

This project uses ElevenLabs for voice generation. You'll need:

- **API Key**: Sign up at [ElevenLabs](https://elevenlabs.io/) to get your API key
- **Voice Access**: The default voices (`qNkzaJoHLLdpvgh5tISm` and `eVItLK1UvXctxuaRV2Oq`) are premium voices that require a **Starter** or **Creator** plan subscription

### Adding Custom Voices

You can add more voices by editing the `AVAILABLE_VOICES` array in `pages/index.tsx`:

```typescript
const AVAILABLE_VOICES = [
  { id: "qNkzaJoHLLdpvgh5tISm", name: "Male Voice", gender: "male" },
  { id: "eVItLK1UvXctxuaRV2Oq", name: "Female Voice", gender: "female" },
  // Add your voice IDs here:
  // { id: "YOUR_VOICE_ID_HERE", name: "Custom Voice", gender: "male" },
];
```

## 🔧 Implementation Details

The application is built with:

- **Next.js** for the React framework
- **TypeScript** for type safety
- **React Beautiful DND** for drag-and-drop functionality
- **ElevenLabs API** for AI voice generation

## 📝 Project Structure

- `/pages` - Next.js pages and API routes
- `/styles` - CSS modules for styling
- `/lib` - Utility functions and libraries
- `/public` - Static assets

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [ElevenLabs](https://elevenlabs.io/) for the AI voice technology
- [Next.js](https://nextjs.org/) for the React framework
- [React Beautiful DND](https://github.com/atlassian/react-beautiful-dnd) for drag-and-drop functionality
