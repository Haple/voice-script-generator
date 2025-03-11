
import type { NextApiRequest, NextApiResponse } from 'next';
import { ElevenLabsClient } from "elevenlabs";
import { v4 as uuidv4 } from 'uuid';

const elevenLabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

type Actor = {
  id: string;
  name: string;
  emoji: string;
  voiceId: string;
};

type Line = {
  id: string;
  actorId: string;
  text: string;
  audioUrl?: string;
};

type RequestData = {
  lines: Line[];
  actors: Actor[];
};

type ResponseData = {
  lines: Line[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { lines, actors } = req.body as RequestData;

    if (!lines || !actors || !Array.isArray(lines) || !Array.isArray(actors)) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const scriptId = uuidv4();
    const updatedLines: Line[] = [...lines];
    
    // Process each line to generate audio
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const actor = actors.find(a => a.id === line.actorId);
      
      if (!actor) {
        console.warn(`Actor not found for line ${i}`);
        continue;
      }

      if (!line.text || line.text.trim() === '') {
        console.warn(`Empty text for line ${i}`);
        continue;
      }
      
      try {
        // Generate audio using ElevenLabs
        const audioStream = await elevenLabs.textToSpeech.convert(actor.voiceId, {
          text: line.text,
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
                
        // Update the line with audio URL
        updatedLines[i] = {
          ...line,
          audioUrl: audioUrl
        };
        
      } catch (error) {
        console.error(`Error generating audio for line ${i}:`, error);
      }
    }
    
    return res.status(200).json({ 
      lines: updatedLines 
    });
    
  } catch (error) {
    console.error('Error processing script:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
