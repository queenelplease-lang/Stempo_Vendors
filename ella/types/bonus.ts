import { BaseEntity } from './index';

export type QRCodeType = 'temporary' | 'permanent';

export type ProgramType = 
  | 'stamp_card'      // Punch/Stamp Card
  | 'points'          // Points-Based
  | 'tiered'         // Tiered Programs
  | 'referral'       // Referral Programs
  | 'gamification'   // Gamification
  | 'vip'            // VIP/Member Benefits
  | 'spend_based';   // Spend-Based

export interface ProgramUserProgress {
  current: number;
  required: number;
  type: 'stamps' | 'points';
}

export interface BonusProgram extends BaseEntity {
  name: string;
  description: string;
  cafeName?: string;
  businessId?: string | number;
  business?: {
    id: string | number;
    name: string;
  };
  programType?: ProgramType;
  
  // Stamp/Points configuration
  points: number;
  pointsRequired: number;
  pointsPerPurchase?: number;
  pointsPerDollar?: number;
  
  // Reward configuration
  discount: number;
  discountType: 'percentage' | 'fixed';
  
  // Tiered program configuration
  tierLevels?: string;
  tierThresholds?: string;
  
  // Referral program configuration
  referralReward?: number;
  referredReward?: number;
  
  // Gamification configuration
  challenges?: string;
  achievements?: string;
  
  // VIP/Member benefits
  memberBenefits?: string;
  
  qrCodeType?: QRCodeType;
  qrExpirationMinutes?: number; // 1-10 for temporary QR, default 3
  status: 'active' | 'pending' | 'approved' | 'rejected' | 'expired';
  expiresAt?: string;
  imageUrl?: string;
  userProgress?: ProgramUserProgress;
}

export interface QRCode extends BaseEntity {
  code: string;
  type: QRCodeType;
  bonusProgramId: number;
  businessId: number;
  expiresAt?: string;
  isActive: boolean;
}

export interface LoyaltyCard extends BaseEntity {
  userId?: number;
  businessId?: number;
  bonusProgramId?: number;
  businessName?: string;
  category?: string;
  icon?: string;
  iconColor?: string;
  stamps: number;
  stampsRequired: number;
  points?: number;
  progressColor?: string;
  business?: {
    id: number;
    name: string;
    category?: string;
    icon?: string;
    iconColor?: string;
  };
}

export interface BonusRedemption extends BaseEntity {
  cardId: number;
  code: string;
  expiresAt: string;
  used: boolean;
  usedAt?: string;
  scannedBy?: number;
}
