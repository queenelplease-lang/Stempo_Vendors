import { BaseEntity } from './index';

export interface Category extends BaseEntity {
  name: string;
  slug: string;
  icon: string;
  iconColor: string;
}
