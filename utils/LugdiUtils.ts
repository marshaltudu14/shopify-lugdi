const LugdiUtils = {
  location_cookieName: "LugdiCountryCode",
  location_name_country_cookie: "LugdiCountryName",
  product_quantity: 20, // Number of max products to be shown in a page.
  maxProductQuantityUserCanAdd: 10, // Number of max quantity for a single product a user can add.

  auth: {
    accessTokenCookie: "lugdi_shopify_access_token",
    refreshTokenCookie: "lugdi_shopify_refresh_token",
    idTokenCookie: "lugdi_shopify_id_token",
    expiresAtCookie: "lugdi_shopify_expires_at",
    codeVerifierCookie: "lugdi_shopify_code_verifier",
    stateCookie: "lugdi_shopify_state",
  },
};

export default LugdiUtils;
