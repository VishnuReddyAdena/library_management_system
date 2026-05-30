const mongoose = require('mongoose');
const { User } = require('./models/User');
const { Publisher, Author, Category, Book, Member } = require('./models/Library');
require('dotenv').config();

const usersData = [
  { email: 'admin@library.edu', password: 'password123', role: 'admin', is_staff: true },
  { email: 'librarian@library.edu', password: 'password123', role: 'librarian', is_staff: true },
  { email: 'faculty@library.edu', password: 'password123', role: 'faculty', is_staff: false },
  { email: 'student@library.edu', password: 'password123', role: 'student', is_staff: false },
  { email: 'vishnureddycom4@gmail.com', password: '7095410421', role: 'admin', is_staff: true }
];

const publishersData = [
  { name: "O'Reilly Media", address: "1005 Gravenstein Highway North, Sebastopol, CA 95472", contact_email: "support@oreilly.com" },
  { name: "Pearson Education", address: "80 Strand, London, WC2R 0RL, United Kingdom", contact_email: "support@pearson.com" },
  { name: "Addison-Wesley Professional", address: "75 Arlington Street, Boston, MA 02116", contact_email: "contact@awprofessional.com" }
];

const authorsData = [
  { name: "Robert C. Martin", biography: "Software engineer and author of Clean Code.", date_of_birth: new Date("1952-12-05") },
  { name: "Martin Fowler", biography: "British software developer and author on Refactoring.", date_of_birth: new Date("1963-12-18") },
  { name: "Brian W. Kernighan", biography: "Canadian computer scientist and co-creator of C.", date_of_birth: new Date("1942-01-01") },
  { name: "Dennis M. Ritchie", biography: "Creator of C and co-creator of Unix.", date_of_birth: new Date("1941-09-09") }
];

const categoriesData = [
  { name: "Software Design & Architecture" },
  { name: "Programming Languages" },
  { name: "Computer Systems" }
];

const seed = async (mongoUri = null) => {
  try {
    const uri = mongoUri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/library_db';
    
    // Connect to database if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri);
    }
    
    console.log('Seeding database...');
    
    // Clean up collections
    await User.deleteMany({});
    await Publisher.deleteMany({});
    await Author.deleteMany({});
    await Category.deleteMany({});
    await Book.deleteMany({});
    await Member.deleteMany({});
    
    // Seed Users
    const users = [];
    for (const u of usersData) {
      const user = new User({ email: u.email, role: u.role, is_staff: u.is_staff, status: 'active' });
      await user.setPassword(u.password);
      await user.save();
      users.push(user);
      console.log(`Seeded user: ${user.email}`);
    }

    // Seed Publishers
    const publishers = [];
    for (const p of publishersData) {
      const pub = new Publisher(p);
      await pub.save();
      publishers.push(pub);
    }
    console.log(`Seeded ${publishers.length} publishers.`);

    // Seed Authors
    const authors = [];
    for (const a of authorsData) {
      const auth = new Author(a);
      await auth.save();
      authors.push(auth);
    }
    console.log(`Seeded ${authors.length} authors.`);

    // Seed Categories
    const categories = [];
    for (const c of categoriesData) {
      const cat = new Category(c);
      await cat.save();
      categories.push(cat);
    }
    console.log(`Seeded ${categories.length} categories.`);

    // Seed Books
    const cleanCode = new Book({
      _id: '9780132350884',
      title: 'Clean Code',
      edition: '1st Edition',
      price: 49.99,
      status: 'Available',
      language: 'English',
      publisher_id: publishers[2]._id, // Addison-Wesley
      category_id: categories[0]._id, // Software Design
      authors: [authors[0]._id] // Robert C. Martin
    });
    await cleanCode.save();

    const refactoring = new Book({
      _id: '9780134425467',
      title: 'Refactoring: Improving the Design of Existing Code',
      edition: '2nd Edition',
      price: 54.99,
      status: 'Available',
      language: 'English',
      publisher_id: publishers[2]._id, // Addison-Wesley
      category_id: categories[0]._id, // Software Design
      authors: [authors[1]._id] // Martin Fowler
    });
    await refactoring.save();

    const cLanguage = new Book({
      _id: '9780131103627',
      title: 'The C Programming Language',
      edition: '2nd Edition',
      price: 39.99,
      status: 'Available',
      language: 'English',
      publisher_id: publishers[1]._id, // Pearson
      category_id: categories[1]._id, // Programming Languages
      authors: [authors[2]._id, authors[3]._id] // Brian Kernighan & Dennis Ritchie
    });
    await cLanguage.save();
    
    console.log('Seeded books.');

    // Seed Member profiles for non-staff seeded users (faculty and student)
    for (const user of users) {
      if (user.role === 'student' || user.role === 'faculty') {
        const member = new Member({
          user_id: user._id,
          membership_type: user.role === 'student' ? 'Student' : 'Faculty',
          expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        });
        await member.save();
        console.log(`Seeded member profile for user: ${user.email}`);
      }
    }
    
    console.log('Database seeding successfully completed! 🎉');
  } catch (err) {
    console.error('Error during seeding database: ', err);
  }
};

// Run directly if called from CLI
if (require.main === module) {
  seed().then(() => mongoose.disconnect());
}

module.exports = seed;
