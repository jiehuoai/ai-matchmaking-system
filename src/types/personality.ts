export interface PersonalityProfile {
  mbti: {
    type: string;
    scores: {
      extraversion: number;
      intuition: number;
      thinking: number;
      judging: number;
    };
  };
  
  bigFive: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  
  values: {
    tradition: number;
    security: number;
    power: number;
    achievement: number;
    hedonism: number;
    stimulation: number;
    selfDirection: number;
    universalism: number;
    benevolence: number;
  };
  
  emotionalNeeds: {
    affection: number;
    independence: number;
    stability: number;
    growth: number;
    recognition: number;
  };
}

export interface UserProfile extends PersonalityProfile {
  id: string;
  age: number;
  location: {
    city: string;
    country: string;
    coordinates: [number, number];
  };
  dealBreakers: string[];
  interests: string[];
  socialMediaData?: {
    sentiment: number;
    topics: string[];
    activityPattern: string;
  };
  voiceAnalysis?: {
    pitch: number;
    tempo: number;
    emotionalMarkers: string[];
  };
}