import { query } from '../config/database.js';
import { articleService } from '../services/articleService.js';
import { authService } from '../services/authService.js';

async function test() {
  try {
    const adminUser = { id: 1, role: 'super_admin', full_name: 'Super Admin' };
    console.log('1. Testing createArticle as super_admin with published status...');
    const art = await articleService.createArticle({
      title: 'Direct Published Test Article ' + Date.now(),
      shortDescription: 'Testing publishing news to find any error that occurs',
      articleBody: '<p>This is a test article body that is definitely more than 20 characters long.</p>',
      categoryId: 1,
      status: 'published'
    }, adminUser, '127.0.0.1');
    console.log('Created published article:', art.id, art.status);

    console.log('2. Testing updateArticle to published status...');
    const updated = await articleService.updateArticle(art.id, {
      status: 'published',
      revisionNotes: 'Approved and published'
    }, adminUser, '127.0.0.1');
    console.log('Updated article:', updated.id, updated.status);

    console.log('3. Testing reporter publish attempt...');
    const reporterUser = { id: 3, role: 'reporter', full_name: 'Reporter' };
    try {
      await articleService.updateArticle(art.id, {
        status: 'published'
      }, reporterUser, '127.0.0.1');
    } catch (repErr) {
      console.log('Reporter publish threw expected error:', repErr.message);
    }

    console.log('ALL TESTS COMPLETED');
  } catch (err) {
    console.error('FAILED WITH ERROR:', err);
  }
  process.exit(0);
}

test();
