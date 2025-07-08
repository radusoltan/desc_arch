import fetch from 'node-fetch';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Încarcă variabilele de mediu - calea corectată către root
config({ path: path.join(__dirname, '../../.env.local') });

async function checkStatus() {
  try {
    const apiUrl = process.env.APP_URL || 'http://localhost:3000';
    const cleanupKey = process.env.CLEANUP_SECRET_KEY;

    if (!cleanupKey) {
      throw new Error('CLEANUP_SECRET_KEY nu este setat în .env');
    }

    console.log('📊 Verifică statusul bazei de date...');
    console.log(`🌐 URL: ${apiUrl}/api/cleanup`);
    console.log(`📅 Data: ${new Date().toLocaleString('ro-RO')}`);
    console.log('');

    const response = await fetch(`${apiUrl}/api/cleanup`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cleanupKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    console.log('✅ Status obținut cu succes!');
    console.log('');

    // Afișează informații pentru fiecare colecție
    if (data.collections) {
      console.log('📋 Statistici colecții:');
      console.log('=' .repeat(50));

      Object.entries(data.collections).forEach(([collectionName, info]) => {
        const statusIcon = info.needsCleanup ? '⚠️ ' : '✅';
        const statusText = info.needsCleanup ? 'Necesită curățare' : 'OK';

        console.log(`${statusIcon} ${collectionName.toUpperCase()}:`);
        console.log(`   📊 Numărul de înregistrări: ${info.count}`);
        console.log(`   🔧 Status: ${statusText}`);

        if (info.needsCleanup) {
          const toDelete = info.count - 20;
          console.log(`   🗑️  Se vor șterge: ${toDelete} înregistrări`);
          console.log(`   💾 Se vor păstra: 20 înregistrări`);
        }
        console.log('');
      });
    }

    // Recomandări
    const hasCleanupNeeded = Object.values(data.collections || {}).some(c => c.needsCleanup);

    console.log('💡 Recomandări:');
    console.log('-' .repeat(30));

    if (hasCleanupNeeded) {
      console.log('⚠️  Unele colecții necesită curățare');
      console.log('🔧 Rulează: npm run cleanup');
      console.log('⏰ Sau programează un cron job pentru curățare automată');
    } else {
      console.log('✅ Toate colecțiile sunt în parametri normali');
      console.log('😎 Nu este necesară curățarea în acest moment');
    }

    console.log('');
    console.log(`🕐 Ultima verificare: ${data.timestamp}`);

    return data;

  } catch (error) {
    console.error('❌ Eroare la verificarea statusului:', error.message);

    if (error.message.includes('CLEANUP_SECRET_KEY')) {
      console.log('');
      console.log('💡 Soluție: Adaugă CLEANUP_SECRET_KEY în fișierul .env.local');
      console.log('   Exemplu: CLEANUP_SECRET_KEY=your-secret-key-here');
      console.log('   Locația fișierului: /var/www/desc_arch/.env.local');
    }

    if (error.message.includes('fetch')) {
      console.log('');
      console.log('💡 Verifică dacă:');
      console.log('   • Serverul Next.js rulează (npm run dev)');
      console.log('   • URL-ul din APP_URL este corect');
      console.log('   • Nu există probleme de rețea');
    }

    console.error('📝 Detalii complete:', error);
    process.exit(1);
  }
}

// Execută doar dacă scriptul este rulat direct
if (import.meta.url === `file://${process.argv[1]}`) {
  checkStatus()
    .then(() => {
      console.log('🎉 Verificare finalizată!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Verificare eșuată:', error);
      process.exit(1);
    });
}

export default checkStatus;