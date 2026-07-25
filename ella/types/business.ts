import { BaseEntity } from './index';

export interface Business extends BaseEntity {
  name: string;
  category: string;
  address: string;
  distance?: string;
  rating: number;
  isOpen: boolean;
  imageUrl?: string;
  icon: string;
  iconColor: string;
  description?: string;
  hasLoyaltyProgram: boolean;
  featured?: boolean;
  ownerId?: number;
}
