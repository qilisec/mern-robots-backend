// const { Users } = require('./users-model');

const initialUser1 = {
  username: 'user1',
  email: 'user1@test.com',
  password: '1',
  roles: ['user'],
  //   roles: [{ name: 'user' }],
};

const initialUser2 = {
  username: 'user2',
  email: 'user2@test.com',
  password: '2',
  roles: ['user'],
};

const initialUser3 = {
  username: 'user3',
  email: 'user3@test.com',
  password: '3',
  roles: ['user'],
};

// const initialUser1 = new Users({
//   username: 'user1',
//   email: 'user1@test.com',
//   password: '1',
// });

// const initialUser2 = new Users({
//   username: 'user2',
//   email: 'user2@test.com',
//   password: '2',
// });

// const initialUser3 = new Users({
//   username: 'user3',
//   email: 'user3@test.com',
//   password: '3',
// });

const seedList = [initialUser1, initialUser2, initialUser3];

module.exports = { seedList };
