const mongoose = require('mongoose');

const { Schema } = mongoose;

const UsersSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: false },
  password: { type: String, required: true },
  roles: [{ type: Schema.Types.ObjectId, ref: 'roles', required: true }],
  created: { type: String, required: false },
  // inputRoles: [{ type: String, required: false }],
});

const RolesSchema = new Schema({
  name: { type: String, required: true },
});

// UsersSchema.pre('findOne', async () => {
//   const inner = async () => {
//     console.log(`UsersSchema find pre-middleware invoked:
//     this.model('roles'): ${this.model('roles').findOne({
//       name: { $in: 'us' },
//     })}`);
//     return this.model('roles').findOne({ name: { $in: 'us' } });
//   };
//   const result = await inner();
//   return result;
// });

RolesSchema.pre('save', (next) => {
  // console.log(`this.name: ${this.name}`)
  next();
});
const Roles = mongoose.model('roles', RolesSchema);

// UsersSchema.pre('save', function (next) {
//   // console.log(`User: this entries: ${Object.entries(this.toJSON())}`)
//   // console.log(`User: this.inputRoles: ${this.inputRoles}`)
//   const { inputRoles } = this;
//   if (inputRoles) {
//     inputRoles.forEach((inputRole) => {
//       Roles.findOne({ name: inputRole }, (err, foundRole) => {
//         if (err) console.log(`error finding role: ${err}`);

//         if (foundRole) {
//           console.log(
//             `${this.username} foundRole name: ${foundRole.name}, foundRole id: ${foundRole._id}`
//           );
//           const currentRoleIds = this.roles;
//           this.set('roles', [...currentRoleIds, foundRole._id]);
//           // console.log(`${this.username} intermediate this.roles: ${this.roles}`)
//           console.log(
//             `Users middleware: Post mapping: ${Object.entries(this.toJSON())}`
//           );
//         }
//       });
//     });
//   }
//   return next();
// });

const Users = mongoose.model('users', UsersSchema);
const validRoles = ['user', 'moderator', 'admin', 'public', 'seed'];
module.exports = { Users, Roles, validRoles };
