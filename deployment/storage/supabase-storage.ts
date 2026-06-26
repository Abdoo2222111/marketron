// ============================================================
// Supabase Storage Setup - منصة التسويق الإلكتروني
// ============================================================
// شغّل هذا الملف باستخدام:
// npx ts-node deployment/storage/supabase-storage.ts
// ============================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('⚠️  SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface BucketConfig {
  name: string;
  public: boolean;
  fileSizeLimit: number;
  allowedMimeTypes: string[];
  description: string;
}

const buckets: BucketConfig[] = [
  {
    name: 'campaign-images',
    public: false,
    fileSizeLimit: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    description: 'صور الحملات الإعلانية - خاصة بالمستخدم',
  },
  {
    name: 'video-uploads',
    public: false,
    fileSizeLimit: 50 * 1024 * 1024, // 50MB
    allowedMimeTypes: ['video/mp4', 'video/quicktime', 'video/x-msvideo'],
    description: 'فيديوهات الحملات الإعلانية',
  },
  {
    name: 'brand-logos',
    public: true,
    fileSizeLimit: 2 * 1024 * 1024, // 2MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'],
    description: 'شعارات الشركات - عامة للعرض',
  },
];

async function setupBuckets() {
  console.log('🚀 جاري إعداد Supabase Storage Buckets...\n');

  for (const bucket of buckets) {
    console.log(`📦 إنشاء bucket: ${bucket.name}`);

    // Check if bucket exists
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      console.error(`❌ Error listing buckets: ${listError.message}`);
      continue;
    }

    const exists = existingBuckets?.find((b) => b.name === bucket.name);

    if (exists) {
      console.log(`   ✅ Bucket "${bucket.name}" موجود بالفعل`);
      // Update settings
      const { error: updateError } = await supabase.storage.updateBucket(bucket.name, {
        public: bucket.public,
        fileSizeLimit: bucket.fileSizeLimit,
        allowedMimeTypes: bucket.allowedMimeTypes,
      });
      if (updateError) {
        console.error(`   ❌ تحديث فشل: ${updateError.message}`);
      } else {
        console.log(`   ✅ تم تحديث الإعدادات`);
      }
    } else {
      // Create bucket
      const { error: createError } = await supabase.storage.createBucket(bucket.name, {
        public: bucket.public,
        fileSizeLimit: bucket.fileSizeLimit,
        allowedMimeTypes: bucket.allowedMimeTypes,
      });
      if (createError) {
        console.error(`   ❌ إنشاء فشل: ${createError.message}`);
      } else {
        console.log(`   ✅ تم إنشاء bucket "${bucket.name}"`);
      }
    }

    console.log(`   📝 ${bucket.description}`);
    console.log('');
  }

  console.log('✨ تم إعداد جميع Buckets بنجاح!');
}

setupBuckets().catch(console.error);
