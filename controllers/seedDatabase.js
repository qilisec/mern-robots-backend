const { reseedUsers } = require('./dbSeedController');

const initializeUserDb = async () => {
  console.log(`initializingUserDb`);
  try {
    const dbUsers = await reseedUsers({}, {});
    return dbUsers;
  } catch (err) {
    console.log(`initializeUserDb err`, err);
  }
};

initializeUserDb();
