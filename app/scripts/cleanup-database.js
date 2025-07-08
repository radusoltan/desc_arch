/**
 * Script pentru curățarea automată a bazei de date
 * Poate fi rulat manual sau prin cron job
 *
 * Utilizare:
 * node scripts/cleanup-database.js
 *
 * Sau prin cron job (o dată pe lună, prima zi a lunii la 02:00):
 * 0 2 1 * * /usr/bin/node /path/to/your/project/scripts/cleanup-database.js
 */

import fetch from 'node-fetch';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Încarcă variabilele de mediu
config({ path: path.join(__dirname, '../../.env.local') });

async function runCleanup() {
  try {
    const apiUrl = process.env.APP_URL || 'http://localhost:3000';
    const cleanupKey = process.env.CLEANUP_SECRET_KEY;

    if (!cleanupKey) {
      throw new Error('CLEANUP_SECRET_KEY nu este setat în .env');
    }

    console.log('🧹 Începe curățarea bazei de date...');
    console.log(`📅 Data: ${new Date().toLocaleString('ro-RO')}`);

    // Verifică statusul înainte de curățare
    console.log('📊 Verifică statusul actual...');
    const statusResponse = await fetch(`${apiUrl}/api/cleanup`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cleanupKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!statusResponse.ok) {
      throw new Error(`Status check failed: ${statusResponse.status} ${statusResponse.statusText}`);
    }

    const statusData = await statusResponse.json();
    console.log('📈 Status actual:', JSON.stringify(statusData, null, 2));

    // Execută curățarea
    console.log('🚀 Execută curățarea...');
    const cleanupResponse = await fetch(`${apiUrl}/api/cleanup`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cleanupKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!cleanupResponse.ok) {
      throw new Error(`Cleanup failed: ${cleanupResponse.status} ${cleanupResponse.statusText}`);
    }

    const cleanupData = await cleanupResponse.json();

    console.log('✅ Curățarea s-a finalizat cu succes!');
    console.log('📊 Rezultate:', JSON.stringify(cleanupData.results, null, 2));

    // Afișează un sumar
    if (cleanupData.results.tgPosts) {
      const { totalBefore, deleted, remaining } = cleanupData.results.tgPosts;
      console.log(`\n📋 Sumar TgPosts:`);
      console.log(`   • Înainte: ${totalBefore} înregistrări`);
      console.log(`   • Șterse: ${deleted} înregistrări`);
      console.log(`   • Rămase: ${remaining} înregistrări`);
    }

    return cleanupData;

  } catch (error) {
    console.error('❌ Eroare la curățarea bazei de date:', error.message);
    console.error('📝 Detalii complete:', error);
    process.exit(1);
  }
}

// Execută doar dacă scriptul este rulat direct
if (import.meta.url === `file://${process.argv[1]}`) {
  runCleanup()
    .then(() => {
      console.log('🎉 Script finalizat cu succes!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script eșuat:', error);
      process.exit(1);
    });
}

export default runCleanup;