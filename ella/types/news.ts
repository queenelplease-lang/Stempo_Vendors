import { BaseEntity } from './index';

export interface News extends BaseEntity {
  title: string;
  content: string;
  imageUrl?: string;
  published: boolean;
  publishedAt?: string;
}
