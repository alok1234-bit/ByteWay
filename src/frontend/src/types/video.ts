export type Time = bigint;

export interface VideoPost {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  uploadedAt: Time;
}

export interface VideoInput {
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
}
