const { expressjwt } = require("express-jwt");
const { AuthenticationClient, ManagementClient } = require("auth0");
const jwks = require("jwks-rsa");

const audience = process.env.AUTH0_MANAGEMENT_AUDIENCE;
const auth0Config = {
  audience,
  domain: process.env.AUTH0_MANAGEMENT_DOMAIN,
  clientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
  clientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
};
const authenticationClient = new AuthenticationClient(auth0Config);
const managementClient = new ManagementClient(auth0Config);

let accessToken = null;
let expiresAt = null;

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

const fetchAuthethenticationToken = () => {
  return new Promise((resolve, reject) => {
    // When there is an accessToken than we return than one so we don't ask for to many tokens
    // When the expiresAt is bigger than the current date the token is expires thus we request for a new one
    if (accessToken && Date.now() <= expiresAt) {
      return resolve(accessToken);
    }

    authenticationClient.clientCredentialsGrant(
      {
        audience,
      },
      (error, response) => {
        if (error) {
          return reject(error);
        }

        accessToken = response.access_token;

        // Calculate when the accessToken expires.
        // We need to refetch a new one after this date expires
        expiresAt = Date.now() + response.expires_in * 1000;

        return resolve(response);
      }
    );
  });
};

const getUsers = (searchTerm) => {
  return new Promise(async (resolve, reject) => {
    await fetchAuthethenticationToken();

    managementClient.getUsers(
      {
        accessToken,
        audience,
        q: `name:${searchTerm ?? ""}*`,
      },
      (error, response) => {
        if (error) {
          return reject(error);
        }

        return resolve(response);
      }
    );
  });
};

const getUser = (userId) => {
  return new Promise(async (resolve, reject) => {
    await fetchAuthethenticationToken();

    managementClient.getUser(
      {
        accessToken,
        audience,
        id: userId,
      },
      (error, response) => {
        if (error) {
          return reject(error);
        }

        return resolve(response);
      }
    );
  });
};

module.exports = {
  jwtCheck,
  verifyJwtCheck,

  getUser,
  getUsers,
};
