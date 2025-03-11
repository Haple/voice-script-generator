
import type { NextApiRequest, NextApiResponse } from 'next';
import { ElevenLabsClient } from "elevenlabs";

const elevenLabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { voiceId, text } = req.body;

    if (!voiceId || !text) {
      return res.status(400).json({ error: 'Missing voiceId or text' });
    }

    // Generate audio using ElevenLabs
    const audioStream = await elevenLabs.textToSpeech.convert(voiceId, {
      text: text,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
      model_id: "eleven_multilingual_v2",
    });

    // Convert stream to buffer
    const chunks = [];
    for await (const chunk of audioStream) {
      chunks.push(chunk);
    }
    const audioBuffer = Buffer.concat(chunks);
    
    // Convert buffer to base64
    const base64Audio = audioBuffer.toString("base64");
    const audioUrl = `data:audio/mp3;base64,${base64Audio}`;
    
    return res.status(200).json({ 
      audioUrl: audioUrl 
    });
    
  } catch (error) {
    console.error('Error generating voice preview:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
