class User {
  constructor(id, username, email, password, tokens = []) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.password = password;
    this.tokens = tokens;
  }
}

module.exports = User;
