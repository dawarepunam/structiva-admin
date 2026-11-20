export interface StrapiSitePageData {
  id: number;
  documentId?: string;
  title: string;
  slug: string;
  metaDescription?: string;
  pageHeroTitle?: string;
  pageHeroSubtitle?: string;
  pageBody?: string;
}

export interface StrapiHomepageData {
  id?: number;
  documentId?: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroCtaText: string;
  heroSecondaryCtaText: string;
  aboutTagline: string;
  aboutTitle: string;
  aboutDescription: string;
  statExperienceYears: string;
  statProjectsCompleted: string;
  statWorkforceStrength: string;
  statMachineryUnits: string;
  ctaHeadline: string;
  ctaDescription: string;
  contactPhone: string;
  contactEmail: string;
  officeAddress: string;
}

export interface StrapiServiceData {
  id: number;
  documentId?: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription?: string;
  order: number;
  imageUrl?: string;
  features?: string[];
}

export interface StrapiProjectData {
  id: number;
  documentId?: string;
  name: string;
  code: string;
  slug?: string;
  client: string;
  location: string;
  category: string;
  budget?: string;
  spent?: string;
  status: string;
  progress: number;
  startDate?: string;
  expectedCompletion?: string;
  image?: string;
  description?: string;
  deployedMachinery?: number;
  isProtected?: boolean;
}

export interface StrapiClientData {
  id: number;
  documentId?: string;
  name: string;
  sector: 'Solar EPC' | 'Water Infrastructure' | 'Industrial & EPC' | 'Commercial Infrastructure';
  logo?: string;
  featured: boolean;
  order: number;
}

export interface ContactEnquiryPayload {
  fullName: string;
  email: string;
  phone: string;
  companyName?: string;
  projectSector?: string;
  location?: string;
  estimatedScope?: string;
  message: string;
}
