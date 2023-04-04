const initialUser1 = {
  username: 'user1',
  email: 'user1@test.com',
  password: '1',
  roles: ['user', 'seed'],
  createdBy: 'seed',
};

const initialUser2 = {
  username: 'user2',
  email: 'user2@test.com',
  password: '2',
  roles: ['user', 'seed'],
  createdBy: 'seed',
};

const initialUser3 = {
  username: 'user3',
  email: 'user3@test.com',
  password: '3',
  roles: ['user', 'seed'],
  createdBy: 'seed',
};

const initialUser4 = {
  username: 'admin',
  email: 'admin@test.com',
  password: 'admin',
  roles: ['user', 'admin'],
  createdBy: 'seed',
};

const seedList = [initialUser1, initialUser2, initialUser3, initialUser4];

module.exports = { seedList };
