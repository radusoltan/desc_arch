import dbConnect from "@/app/lib/mongoose";
import { NextResponse } from "next/server";
import { CLEANUP_CONFIG, CLEANUP_SETTINGS, validateConfig } from "@/app/config/cleanup-config.js";

export async function POST(request) {
  const startTime = Date.now();

  try {
    // Validează configurația
    validateConfig();

    // Verifică autentificarea
    const authHeader = request.headers.get('authorization');
    if (!CLEANUP_SETTINGS.secretKey || authHeader !== `Bearer ${CLEANUP_SETTINGS.secretKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Verifică dacă este dry run
    const isDryRun = CLEANUP_SETTINGS.dryRun;
    if (isDryRun) {
      console.log('🧪 DRY RUN MODE - Nu se vor șterge înregistrări');
    }

    const results = {};
    let totalDeleted = 0;

    // Procesează fiecare colecție din configurație
    for (const [collectionKey, config] of Object.entries(CLEANUP_CONFIG)) {
      try {
        console.log(`📋 Procesează colecția: ${config.description || collectionKey}`);

        const result = await cleanupCollection(
          config.model,
          config.keepCount,
          config.sortBy,
          config.additionalFilter,
          isDryRun
        );

        results[collectionKey] = result;
        totalDeleted += result.deleted;

        // Verifică limita de siguranță
        if (totalDeleted > CLEANUP_SETTINGS.maxDeletesPerRun) {
          throw new Error(`Limita de siguranță depășită: ${totalDeleted} > ${CLEANUP_SETTINGS.maxDeletesPerRun}`);
        }

      } catch (error) {
        console.error(`❌ Eroare la procesarea ${collectionKey}:`, error);
        results[collectionKey] = {
          error: error.message,
          collectionName: config.model.collection.name
        };
      }
    }

    const executionTime = Date.now() - startTime;
    const finalResults = {
      success: true,
      dryRun: isDryRun,
      totalDeleted,
      executionTimeMs: executionTime,
      results,
      timestamp: new Date().toISOString(),
    };

    console.log(`✅ Curățarea finalizată în ${executionTime}ms:`, finalResults);

    // Trimite notificări dacă sunt configurate
    if (CLEANUP_SETTINGS.notifications.enabled) {
      await sendNotification(finalResults);
    }

    return NextResponse.json(finalResults);

  } catch (error) {
    console.error('❌ Eroare la curățarea bazei de date:', error);

    const errorResponse = {
      success: false,
      error: 'Cleanup failed',
      details: error.message,
      timestamp: new Date().toISOString(),
      executionTimeMs: Date.now() - startTime
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// Funcție îmbunătățită pentru curățarea unei colecții
async function cleanupCollection(Model, keepCount = 20, sortBy = { _id: -1 }, additionalFilter = {}, isDryRun = false) {
  try {
    // Construiește filtrul de căutare
    const baseFilter = { ...additionalFilter };

    // Numără totalul de documente care îndeplinesc criteriile
    const totalCount = await Model.countDocuments(baseFilter);

    if (totalCount <= keepCount) {
      return {
        collectionName: Model.collection.name,
        totalBefore: totalCount,
        deleted: 0,
        remaining: totalCount,
        message: `Nu sunt suficiente documente pentru ștergere (${totalCount} <= ${keepCount})`,
        dryRun: isDryRun
      };
    }

    // Găsește ID-urile documentelor de păstrat
    const latestDocs = await Model
      .find(baseFilter)
      .sort(sortBy)
      .limit(keepCount)
      .select('_id');

    const idsToKeep = latestDocs.map(doc => doc._id);

    // Construiește filtrul pentru ștergere
    const deleteFilter = {
      ...baseFilter,
      _id: { $nin: idsToKeep }
    };

    let deleteResult = { deletedCount: 0 };

    if (!isDryRun) {
      // Șterge documentele (doar dacă nu e dry run)
      deleteResult = await Model.deleteMany(deleteFilter);
    } else {
      // În dry run, doar numără ce s-ar șterge
      deleteResult.deletedCount = await Model.countDocuments(deleteFilter);
    }

    const finalCount = await Model.countDocuments(baseFilter);

    return {
      collectionName: Model.collection.name,
      totalBefore: totalCount,
      deleted: deleteResult.deletedCount,
      remaining: finalCount,
      idsKept: idsToKeep,
      filter: baseFilter,
      dryRun: isDryRun
    };

  } catch (error) {
    throw new Error(`Eroare la curățarea colecției ${Model.collection.name}: ${error.message}`);
  }
}

// Funcție pentru trimiterea notificărilor
async function sendNotification(results) {
  if (!CLEANUP_SETTINGS.notifications.enabled) return;

  const message = `
🧹 **Database Cleanup Completed**
📅 Time: ${results.timestamp}
⏱️ Duration: ${results.executionTimeMs}ms
🗑️ Total deleted: ${results.totalDeleted}
${results.dryRun ? '🧪 **DRY RUN MODE**' : '✅ Live run'}

📊 **Details:**
${Object.entries(results.results).map(([key, result]) =>
    `• ${key}: ${result.deleted || 0} deleted, ${result.remaining || 0} remaining`
  ).join('\n')}
  `;

  try {
    // Webhook (Slack, Discord, etc.)
    if (CLEANUP_SETTINGS.notifications.webhook) {
      await fetch(CLEANUP_SETTINGS.notifications.webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message })
      });
    }

    // Email (implementează după nevoie)
    if (CLEANUP_SETTINGS.notifications.email) {
      // Aici poți integra un service de email
      console.log('📧 Email notification sent to:', CLEANUP_SETTINGS.notifications.email);
    }

  } catch (error) {
    console.error('❌ Eroare la trimiterea notificării:', error);
  }
}

// GET endpoint pentru verificarea statusului
export async function GET(request) {
  try {
    validateConfig();

    const authHeader = request.headers.get('authorization');
    if (!CLEANUP_SETTINGS.secretKey || authHeader !== `Bearer ${CLEANUP_SETTINGS.secretKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const collections = {};

    // Verifică statusul pentru fiecare colecție
    for (const [collectionKey, config] of Object.entries(CLEANUP_CONFIG)) {
      try {
        const baseFilter = config.additionalFilter || {};
        const count = await config.model.countDocuments(baseFilter);

        collections[collectionKey] = {
          description: config.description || collectionKey,
          count,
          keepCount: config.keepCount,
          needsCleanup: count > config.keepCount,
          wouldDelete: Math.max(0, count - config.keepCount)
        };
      } catch (error) {
        collections[collectionKey] = {
          error: error.message
        };
      }
    }

    return NextResponse.json({
      status: 'ready',
      dryRun: CLEANUP_SETTINGS.dryRun,
      collections,
      settings: {
        maxDeletesPerRun: CLEANUP_SETTINGS.maxDeletesPerRun,
        notificationsEnabled: CLEANUP_SETTINGS.notifications.enabled
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Status check failed', details: error.message },
      { status: 500 }
    );
  }
}