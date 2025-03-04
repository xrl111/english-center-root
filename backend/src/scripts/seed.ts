import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ims';

const sampleCourses = [
  {
    title: 'Introduction to Web Development',
    description: 'Learn the basics of HTML, CSS, and JavaScript.',
    level: 'Beginner',
    duration: '3 months',
    image: 'https://example.com/images/web-dev.jpg',
    startDate: new Date('2025-04-01'),
    endDate: new Date('2025-06-30'),
    isActive: true,
  },
  {
    title: 'Advanced React Programming',
    description: 'Master React.js and modern frontend development.',
    level: 'Advanced',
    duration: '4 months',
    image: 'https://example.com/images/react.jpg',
    startDate: new Date('2025-05-01'),
    endDate: new Date('2025-08-31'),
    isActive: true,
  },
];

const sampleNews = [
  {
    title: 'New Course Announcement',
    content: 'We are excited to announce our new Web Development course starting next month.',
    category: 'Announcement',
    publishDate: new Date('2025-03-15'),
    isPublished: true,
    tags: ['courses', 'web-development'],
  },
  {
    title: 'Student Success Story',
    content: 'One of our students landed a job at a major tech company.',
    category: 'Achievement',
    publishDate: new Date('2025-03-10'),
    isPublished: true,
    tags: ['success', 'students'],
  },
];

const sampleSchedules = [
  {
    title: 'Web Development - Introduction to HTML',
    description: 'First class of the Web Development course.',
    startTime: new Date('2025-04-01T09:00:00Z'),
    endTime: new Date('2025-04-01T11:00:00Z'),
    instructor: 'John Doe',
    location: 'Room 101',
    isCanceled: false,
  },
  {
    title: 'React - Component Basics',
    description: 'Introduction to React components and props.',
    startTime: new Date('2025-05-01T14:00:00Z'),
    endTime: new Date('2025-05-01T16:00:00Z'),
    instructor: 'Jane Smith',
    location: 'Room 102',
    isCanceled: false,
  },
];

async function seed() {
  try {
    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db();

    // Clear existing data
    await db.collection('courses').deleteMany({});
    await db.collection('news').deleteMany({});
    await db.collection('schedules').deleteMany({});

    // Insert sample data
    await db.collection('courses').insertMany(sampleCourses);
    await db.collection('news').insertMany(sampleNews);
    await db.collection('schedules').insertMany(sampleSchedules);

    console.log('Database seeded successfully!');
    
    // Add references between collections
    const courses = await db.collection('courses').find().toArray();
    const courseIds = courses.map(course => course._id);

    // Add course references to schedules
    await Promise.all(
      sampleSchedules.map(async (_, index) => {
        await db.collection('schedules').updateOne(
          { title: sampleSchedules[index].title },
          { $set: { course: courseIds[index % courseIds.length] } }
        );
      })
    );

    console.log('References added successfully!');
    await client.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();