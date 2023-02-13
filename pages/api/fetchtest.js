import fetch from "cross-fetch";
import commercelayerjsAuth from "@commercelayer/js-auth";
import Cors from "cors";

// Initializing the cors middleware
const cors = Cors({
  methods: ["GET", "HEAD"],
});

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

const getCommerceLayerAccessToken = async () => {
  try {
    console.log("Fetching Access Token...");
    console.log(`Executing Function => getCommerceLayerAccessToken`);
    const { accessToken } = await commercelayerjsAuth.getIntegrationToken({
      clientId: process.env.CL_CLIENT_ID,
      clientSecret: process.env.CL_CLIENT_SECRET,
      endpoint: process.env.CL_BASE_ENDPOINT,
    });
    return accessToken;
  } catch (err) {
    throw err;
  }
};

export default async function handler(req, res) {
  // Run the middleware
  await runMiddleware(req, res, cors);
  const accessToken = await getCommerceLayerAccessToken();
  const API_URL = `${process.env.CL_BASE_ENDPOINT}/api/skus/${process.env.CL_SKU_ID}?include=delivery_lead_times`;
  await fetch(API_URL, {
    method: "GET",
    headers: {
      Accept: "application/vnd.api+json",
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((res) => {
      if (res.status >= 400) {
        throw new Error("Bad response from server");
      }
      return res.json();
    })
    .then((data) => {
      res.status(200).json({ status: 200, data });
    })
    .catch((err) => {
      console.error(err);
    });
}
