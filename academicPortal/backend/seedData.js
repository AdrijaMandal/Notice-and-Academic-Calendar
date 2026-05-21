const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Notice = require('./models/Notice');
const Event = require('./models/Event');

const notices = [
  {
    title: 'End Semester Examination Schedule Released',
    content:
      'The end semester examination schedule for all departments has been released. Students are advised to check the official schedule on the portal and prepare accordingly. Hall tickets will be distributed one week before exams.',
    category: 'Exam',
    isImportant: true,
    postedBy: 'Examination Cell',
  },
  {
    title: 'Annual Sports Meet 2025',
    content:
      'The Annual Sports Meet will be held from 20th to 25th May 2025. All students are encouraged to participate. Registration forms available at the Sports Department office.',
    category: 'Event',
    isImportant: false,
    postedBy: 'Sports Department',
  },
  {
    title: 'Library Timings Extended',
    content:
      'During the examination period, the central library will remain open till 10:00 PM on all working days. Students are requested to carry their ID cards.',
    category: 'General',
    isImportant: false,
    postedBy: 'Library',
  },
  {
    title: 'Fee Payment Deadline — Last Notice',
    content:
      'This is the final reminder for fee payment for the current semester. Students who have not paid their dues must do so by 30th April 2025 to avoid late fine charges.',
    category: 'Urgent',
    isImportant: true,
    postedBy: 'Accounts Office',
  },
  {
    title: 'College Closed for Eid-ul-Fitr',
    content:
      'The college will remain closed on account of Eid-ul-Fitr. Classes will resume from the next working day.',
    category: 'Holiday',
    isImportant: false,
    postedBy: 'Administration',
  },
  {
    title: 'Guest Lecture on AI & Machine Learning',
    content:
      'A guest lecture by Dr. Ramesh Gupta from IIT Kharagpur on "Future of AI in Education" will be held on 15th May 2025 at 11:00 AM in the Main Auditorium.',
    category: 'Event',
    isImportant: false,
    postedBy: 'CSE Department',
  },
];

const currentYear = new Date().getFullYear();

const events = [
  { title: 'Mid-Semester Exams Begin', date: new Date(`${currentYear}-05-05`), type: 'Exam', color: '#ef4444', description: 'Mid-semester examinations for all departments.' },
  { title: 'Annual Sports Meet', date: new Date(`${currentYear}-05-20`), endDate: new Date(`${currentYear}-05-25`), type: 'Sports', color: '#f97316', description: 'College annual sports meet.' },
  { title: 'Guest Lecture — AI & ML', date: new Date(`${currentYear}-05-15`), type: 'Academic', color: '#4f46e5', description: 'Guest lecture by Dr. Ramesh Gupta.' },
  { title: 'Eid-ul-Fitr Holiday', date: new Date(`${currentYear}-05-31`), type: 'Holiday', color: '#16a34a', description: 'College closed for Eid-ul-Fitr.' },
  { title: 'End Semester Exams', date: new Date(`${currentYear}-06-10`), endDate: new Date(`${currentYear}-06-25`), type: 'Exam', color: '#ef4444', description: 'End semester examinations.' },
  { title: 'Cultural Fest — Utkarsh', date: new Date(`${currentYear}-07-10`), type: 'Cultural', color: '#a855f7', description: 'Annual cultural festival.' },
  { title: 'Independence Day', date: new Date(`${currentYear}-08-15`), type: 'Holiday', color: '#16a34a', description: 'National holiday.' },
  { title: 'Teachers Day Celebration', date: new Date(`${currentYear}-09-05`), type: 'Festival', color: '#ec4899', description: 'Celebration for Teachers Day.' },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await Notice.deleteMany({});
    await Event.deleteMany({});
    console.log('Cleared old data');

    await Notice.insertMany(notices);
    await Event.insertMany(events);
    console.log('Seed data inserted successfully!');

    process.exit(0);
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
}

seed();
