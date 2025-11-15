export interface Class {
  id: string;
  name: string;
  code: string;
  owner_id: string;
  created_at: string;
}

export interface ClassMember {
  user_id: string;
  class_id: string;
  role: 'member' | 'owner' | 'ta';
  joined_at: string;
}

