import { SITE_URL } from './site';
import { NOTE_URL } from './links';

// Keep the existing public writing name. Do not substitute a private legal name.
export const AUTHOR = {
  '@type': 'Person',
  '@id': `${SITE_URL}/about-author/#person`,
  name: 'IELTS Consult',
  url: `${SITE_URL}/about-author/`,
  sameAs: [NOTE_URL],
};

export const PUBLISHER = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: 'IELTS Consult',
  url: `${SITE_URL}/`,
};

export const WEBSITE_ID = `${SITE_URL}/#website`;
