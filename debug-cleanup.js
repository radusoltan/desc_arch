import fetch from 'node-fetch';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Încarcă variabilele de mediu
config({ path: path.join(__dirname, '/.env.local') });

async function debugCleanup() {
  const apiUrl = process.env.APP_URL || 'http://localhost:3000';
  const cleanupKey = process.env.CLEANUP_SECRET_KEY;

  console.log('🔍 DEBUG: Verificare detaliată cleanup...');
  console.log('');

  // 1. Verifică variabilele de mediu
  console.log('1️⃣ Verifică variabilele de mediu:');
  console.log(`   APP_URL: ${apiUrl}`);
  console.log(`   CLEANUP_SECRET_KEY: ${cleanupKey ? '✅ setat' : '❌ lipsește'}`);
  console.log(`   MONGODB_URI: ${process.env.MONGODB_URI ? '✅ setat' : '❌ lipsește'}`);
  console.log('');

  if (!cleanupKey) {
    console.error('❌ CLEANUP_SECRET_KEY nu este setat!');
    return;
  }

  // 2. Testează conectivitatea de bază
  console.log('2️⃣ Testează conectivitatea de bază:');
  try {
    const homeResponse = await fetch(apiUrl, { timeout: 5000 });
    console.log(`   Homepage: ${homeResponse.status} ${homeResponse.statusText}`);
  } catch (error) {
    console.error(`   ❌ Nu se poate conecta la ${apiUrl}:`, error.message);
    console.log('   💡 Pornește serverul cu: npm run dev');
    return;
  }

  // 3. Testează endpoint-ul cleanup fără autentificare
  console.log('3️⃣ Testează endpoint-ul cleanup (fără auth):');
  try {
    const noAuthResponse = await fetch(`${apiUrl}/api/cleanup`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    console.log(`   Status fără auth: ${noAuthResponse.status} ${noAuthResponse.statusText}`);

    if (noAuthResponse.status === 401) {
      console.log('   ✅ Endpoint-ul există și cere autentificare corect');
    } else if (noAuthResponse.status === 500) {
      const errorText = await noAuthResponse.text();
      console.log('   ❌ Eroare 500:', errorText);
    }
  } catch (error) {
    console.error('   ❌ Eroare la testarea endpoint-ului:', error.message);
  }

  // 4. Testează cu autentificare
  console.log('4️⃣ Testează cu autentificare:');
  try {
    const authResponse = await fetch(`${apiUrl}/api/cleanup`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cleanupKey}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`   Status cu auth: ${authResponse.status} ${authResponse.statusText}`);

    if (authResponse.status === 500) {
      // Încearcă să obții mai multe detalii despre eroare
      const errorText = await authResponse.text();
      console.log('   📝 Răspuns server:', errorText);

      // Încearcă să parseze JSON-ul pentru mai multe detalii
      try {
        const errorJson = JSON.parse(errorText);
        console.log('   🔍 Detalii eroare:', JSON.stringify(errorJson, null, 2));
      } catch (parseError) {
        console.log('   📄 Răspuns text brut:', errorText);
      }
    } else if (authResponse.ok) {
      const data = await authResponse.json();
      console.log('   ✅ Success! Răspuns:', JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.error('   ❌ Eroare la request-ul cu auth:', error.message);
  }

  // 5. Verifică dacă toate dependențele sunt instalate
  console.log('5️⃣ Verifică dependențele:');
  try {
    // Simulează importurile din cleanup
    console.log('   📦 Testează importurile...');

    // Nu putem importa direct din app/ aici, dar putem verifica dacă fișierele există
    const fs = await import('fs');
    const configExists = fs.existsSync(path.join(__dirname, '../../app/config/cleanup-config.js'));
    const modelExists = fs.existsSync(path.join(__dirname, '../../app/models/TgPost.js'));
    const mongooseExists = fs.existsSync(path.join(__dirname, '../../app/lib/mongoose.js'));

    console.log(`   Config: ${configExists ? '✅' : '❌'} cleanup-config.js`);
    console.log(`   Model: ${modelExists ? '✅' : '❌'} TgPost.js`);
    console.log(`   DB: ${mongooseExists ? '✅' : '❌'} mongoose.js`);

  } catch (error) {
    console.error('   ❌ Eroare la verificarea dependențelor:', error.message);
  }
}

debugCleanup();