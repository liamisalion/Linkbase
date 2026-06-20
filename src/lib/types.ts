export interface ContactWithRelations {
  id: string;
  name: string;
  company: string;
  title: string;
  type: string;
  avatar: string;
  stage: string;
  health: number;
  frequency: string;
  interests: string;
  notes: string;
  lastContactAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  interactions: InteractionData[];
  commitments: CommitmentData[];
}

export interface InteractionData {
  id: string;
  contactId: string;
  channel: string;
  summary: string;
  date: Date;
}

export interface CommitmentData {
  id: string;
  contactId: string;
  direction: string;
  what: string;
  deadline: string;
  status: string;
  source: string;
}

export interface InboxItemData {
  id: string;
  contactId: string | null;
  source: string;
  title: string;
  preview: string;
  tags: string;
  unread: boolean;
  time: string;
}

export interface SocialFeedData {
  id: string;
  contactId: string | null;
  platform: string;
  person: string;
  company: string;
  content: string;
  aiEvent: string;
  aiAnalysis: string;
  aiAction: string;
  time: string;
}
