require('dotenv').config();
const sequelize = require('./config/sequelize');
const { User, Department, syncModels } = require('./models');

const DEPARTMENTS = ['CSE', 'AIDS', 'ECE', 'EEE', 'MECH', 'CYBER', 'CSBS', 'AIML', 'IT'];

const seedDatabase = async () => {
  try {
    await sequelize.authenticate();
    await syncModels();

    // Clear tables in correct FK order
    await User.destroy({ where: {}, truncate: true, cascade: true });
    await Department.destroy({ where: {}, truncate: true, cascade: true });

    await User.create({
      name: 'System Admin',
      email: 'admin@college.edu',
      password: 'admin123',
      role: 'Admin'
    });
    console.log('Admin created');

    for (const dept of DEPARTMENTS) {
      const hod = await User.create({
        name: `${dept} HOD`,
        email: `${dept.toLowerCase()}_hod@college.edu`,
        password: 'hod123',
        role: 'HOD',
        department: dept,
        staffId: `${dept}_HOD_001`
      });

      const innovationHead = await User.create({
        name: `${dept} Innovation Head`,
        email: `${dept.toLowerCase()}_innovation@college.edu`,
        password: 'innovation123',
        role: 'InnovationHead',
        department: dept,
        staffId: `${dept}_INN_001`
      });

      const cfi = await User.create({
        name: `${dept} CFI`,
        email: `${dept.toLowerCase()}_cfi@college.edu`,
        password: 'cfi123',
        role: 'CFI',
        department: dept,
        staffId: `${dept}_CFI_001`
      });

      await Department.create({
        name: dept,
        hodId:            hod.id,
        innovationHeadId: innovationHead.id,
        cfiId:            cfi.id
      });

      console.log(`${dept} department seeded`);
    }

    console.log('\nDatabase seeded successfully');
    console.log('Admin:          admin@college.edu / admin123');
    console.log('HOD:            <dept>_hod@college.edu / hod123');
    console.log('InnovationHead: <dept>_innovation@college.edu / innovation123');
    console.log('CFI:            <dept>_cfi@college.edu / cfi123');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
