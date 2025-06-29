import { NextRequest, NextResponse } from 'next/server';
import { aiProvider } from '@/lib/ai/openrouter';

export async function POST(request: NextRequest) {
  try {
    const { prompt, config } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const response = await aiProvider.sendRequest(prompt, config);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('AI API route error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'AI request failed',
        details: 'Please check your API configuration and try again.'
      },
      { status: 500 }
    );
  }
}