const mongoose = require('mongoose');

const { Schema } = mongoose;

const UsersSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: false },
  password: { type: String, required: true },
  roles: [{ type: Schema.Types.ObjectId, ref: 'roles', required: true }],
});

const RolesSchema = new Schema({
  name: { type: String, required: true },
});

const Users = mongoose.model('users', UsersSchema);
const Roles = mongoose.model('roles', RolesSchema);

module.exports = { Users, Roles };
