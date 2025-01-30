export default () => ({
  mongodb: {
    uri: process.env.MONGODB_URI,
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
  },
  bcrypt: {
    saltRounds: 10,
  },
});
