'use client';
import { z } from 'zod';

export type Mountain = {
  id: string;
  name: string;
  name_en?: string;
  slug: string;
  imageUrl: string;
  description: string;
  description_en?: string;
  height?: number;
  bestSeason?: string;
  difficulty?: 'Asan' | 'Orta' | 'Çətin' | 'Ekstremal';
  latitude?: number;
  longitude?: number;
  temperature?: string;
};

export type InfoCategory = 'hotels' | 'restaurants' | 'attractions' | 'cuisine';

export type InfoItem = {
  id: string;
  mountainId: string;
  mountainSlug: string;
  category: InfoCategory;
  
  name: string; 
  name_en?: string;
  
  description: string;
  description_en?: string;

  imageUrl?: string;
  rating?: number;
  price?: string;
  
  googleMapsUrl?: string;
  
  ingredients?: string; 
  ingredients_en?: string;
  
  menu?: string; 
  address?: string; 
  phone?: string; 
  entranceFee?: string; 

  nearbyRestaurants?: string; 
  nearbyRestaurantImageUrl?: string;
};

export type Reservation = {
  id: string;
  itemId: string;
  itemName: string;
  mountainSlug?: string;
  userName: string;
  email: string;
  date: string;
  time: string;
  guests: number;
  specialRequests?: string;
  createdAt: any;
};

export type Feedback = {
  id: string;
  name: string;
  surname: string;
  email: string;
  message: string;
  createdAt: any;
};

export const TtsInputSchema = z.object({
  text: z.string().describe('The text to be converted to speech.'),
  languageCode: z.string().describe('The language of the text (e.g., "az-AZ", "en-US").'),
});

export type TtsInput = z.infer<typeof TtsInputSchema>;

export const TtsOutputSchema = z.object({
  audioContent: z.string().describe('The base64 encoded audio content.'),
});

export type TtsOutput = z.infer<typeof TtsOutputSchema>;

export const UserProfileSchema = z.object({
  email: z.string().email(),
  emergencyContactName: z.string(),
  emergencyContactPhone: z.string(),
  name: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  age: z.number().optional(),
  family: z.number().optional(),
  region: z.string().optional(),
  trips_per_year: z.number().optional(),
  avg_budget_per_year: z.number().optional(),
  favorite_destination: z.string().optional(),
  vacation_type: z.string().optional(),
  travel_interest: z.number().optional(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;
