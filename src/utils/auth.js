const { expressjwt } = require("express-jwt");
const jwks = require("jwks-rsa");

const jwtCheck = expressjwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ["RS256"],
});

const verifyJwtCheck = (accessToken) => {
  const request = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  return new Promise((resolve, reject) => {
    jwtCheck(request, {}, (error) => {
      if (error) {
        return reject(error);
      }

      return resolve(request.auth);
    });
  });
};

module.exports = {
  jwtCheck,
  verifyJwtCheck,
};
