import { supabaseAdmin, isSupabaseConfigured } from '../src/config/supabase.js';

async function run() {
  if (!isSupabaseConfigured || !supabaseAdmin) {
    console.error('Supabase is not configured!');
    process.exit(1);
  }

  console.log('1. Clearing registrations table...');
  const { error: regErr } = await supabaseAdmin
    .from('registrations')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // delete all
  if (regErr) console.error('Error clearing registrations:', regErr);
  else console.log('✅ Registrations table cleared.');

  console.log('2. Clearing announcements table...');
  const { error: annErr } = await supabaseAdmin
    .from('announcements')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // delete all
  if (annErr) console.error('Error clearing announcements:', annErr);
  else console.log('✅ Announcements table cleared.');

  console.log('3. Updating event_sessions with 9 stages from image...');
  const { error: delSessErr } = await supabaseAdmin
    .from('event_sessions')
    .delete()
    .gte('sequence_number', 0);
  if (delSessErr) console.error('Error deleting old sessions:', delSessErr);

  const stages = [
    {
      sequence_number: 1,
      title: 'Welcome Address',
      start_time: '10:00 AM',
      end_time: '10:15 AM',
      description: 'AU-QUASAR Management',
      key_activities: ['Welcome Address by AU-QUASAR Management', 'Opening remarks & event introduction']
    },
    {
      sequence_number: 2,
      title: 'Chief Guest Address',
      start_time: '10:15 AM',
      end_time: '10:30 AM',
      description: 'Shri. Mahadesha V, Director, STPI - Bengaluru',
      key_activities: ['Keynote address by Chief Guest Shri. Mahadesha V', 'STPI Bengaluru perspectives & ecosystem support']
    },
    {
      sequence_number: 3,
      title: 'Dr. Kadiyali Srivatsa',
      start_time: '10:30 AM',
      end_time: '10:45 AM',
      description: 'Session topic to be announced',
      key_activities: ['Session address by Dr. Kadiyali Srivatsa', 'Interactive deep-tech Q&A']
    },
    {
      sequence_number: 4,
      title: 'DataDice & CommunIDy™',
      start_time: '10:45 AM',
      end_time: '11:00 AM',
      description: 'Bhanu Surya on the company and the CommunIDy™ product',
      key_activities: ['Company address by Bhanu Surya', 'CommunIDy™ platform demonstration']
    },
    {
      sequence_number: 5,
      title: 'Snacks Break',
      start_time: '11:00 AM',
      end_time: '11:15 AM',
      description: 'Networking & refreshments',
      key_activities: ['Networking session & refreshments', 'Room assignments for competition']
    },
    {
      sequence_number: 6,
      title: 'Round 1 - Three Rooms',
      start_time: '11:15 AM',
      end_time: '12:00 PM',
      description: 'Students, startups and enthusiasts compete in three different rooms',
      key_activities: ['Parallel breakout pitches in Room 1, 2, and 3', 'Initial judging & evaluation']
    },
    {
      sequence_number: 7,
      title: 'Final Round',
      start_time: '12:00 PM',
      end_time: '12:40 PM',
      description: 'Top two from each room - six finalists',
      key_activities: ['Top six finalists pitch on main stage', 'In-depth jury Q&A']
    },
    {
      sequence_number: 8,
      title: 'Jury Deliberation',
      start_time: '12:40 PM',
      end_time: '12:50 PM',
      description: 'The jury panel decides the winners',
      key_activities: ['Jury scoring collation & debate', 'Final decision on award winners']
    },
    {
      sequence_number: 9,
      title: 'Winners & Closing',
      start_time: '12:50 PM',
      end_time: '1:00 PM',
      description: 'Winners announced, event closes',
      key_activities: ['Award ceremony & felicitations', 'Closing remarks & wrap-up']
    }
  ];

  const { data: inserted, error: insErr } = await supabaseAdmin
    .from('event_sessions')
    .insert(stages)
    .select();

  if (insErr) {
    console.error('Error inserting stages:', insErr);
  } else {
    console.log(`✅ Inserted ${inserted.length} event sessions from schedule image.`);
  }

  process.exit(0);
}

run();
