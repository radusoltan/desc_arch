/**
 * Configurație pentru curățarea automată a bazei de date
 * Acest fișier definește regulile pentru fiecare colecție
 */

// Importăm modelul cu calea corectă pentru ES modules
import TgPost from "../models/TgPost.js";

export const CLEANUP_CONFIG = {
  // Configurația pentru TgPost
  tgPosts: {
    model: TgPost,
    keepCount: 20,
    sortBy: { _id: -1 }, // Păstrează cele mai recente (după _id)
    description: "Telegram Posts"
  },

  // Exemplu pentru alte colecții - decomentează și adaptează după nevoie
  /*
  articles: {
    model: Article,
    keepCount: 50, // Păstrează mai multe articole
    sortBy: { published_at: -1 }, // Sortează după data publicării
    description: "News Articles"
  },

  users: {
    model: User,
    keepCount: 100,
    sortBy: { createdAt: -1 },
    description: "User Accounts",
    // Condiții suplimentare - șterge doar utilizatorii inactivi
    additionalFilter: {
      lastLogin: { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } // 90 zile
    }
  }
  */
};

export const CLEANUP_SETTINGS = {
  // Cheia secretă pentru autentificare
  secretKey: process.env.CLEANUP_SECRET_KEY,

  // Setări de siguranță
  maxDeletesPerRun: 10000, // Limitează numărul maxim de ștergeri pe execuție
  dryRun: process.env.CLEANUP_DRY_RUN === 'true', // Mod test - nu șterge nimic

  // Logging
  logLevel: process.env.CLEANUP_LOG_LEVEL || 'info', // 'debug', 'info', 'warn', 'error'

  // Notificări (opțional)
  notifications: {
    enabled: process.env.CLEANUP_NOTIFICATIONS === 'true',
    webhook: process.env.CLEANUP_WEBHOOK_URL, // Pentru Slack, Discord, etc.
    email: process.env.CLEANUP_EMAIL_RECIPIENT
  }
};

// Funcție helper pentru validarea configurației
export function validateConfig() {
  const errors = [];

  if (!CLEANUP_SETTINGS.secretKey) {
    errors.push('CLEANUP_SECRET_KEY nu este setat în variabilele de mediu');
  }

  Object.entries(CLEANUP_CONFIG).forEach(([key, config]) => {
    if (!config.model) {
      errors.push(`Model lipsește pentru ${key}`);
    }
    if (!config.keepCount || config.keepCount < 1) {
      errors.push(`keepCount invalid pentru ${key}`);
    }
  });

  if (errors.length > 0) {
    throw new Error(`Erori de configurație:\n${errors.join('\n')}`);
  }

  return true;
}