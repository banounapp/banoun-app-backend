const jwt = require("jsonwebtoken");
const config = require("config");

const auth = (req, res, next) => {
  const Token = req.header("Authorizarion");

  if (!Token) {
    return res.status(400).json({ error: "Token Not Found" });
  }
  try {
    const secret = config.get("jwtSecret");
    const decoded = jwt.verify(Token, secret);
    req.signedId = decoded.id;

    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: `Not valid token` });
  }
};

module.exports = auth;
