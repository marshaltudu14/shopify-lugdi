import { gql } from "@apollo/client";
import { initializeApollo } from "./apollo/apollo-client";

const client = initializeApollo();

const CUSTOMER_BEGIN_PASSWORDLESS = gql`
  mutation customerBeginPasswordless($email: String!) {
    customerBeginPasswordless(email: $email) {
      success
      errors {
        message
      }
    }
  }
`;

const CUSTOMER_ACCESS_TOKEN_CREATE_WITH_OTP = gql`
  mutation customerAccessTokenCreateWithOtp(
    $email: String!
    $otpCode: String!
  ) {
    customerAccessTokenCreateWithOtp(email: $email, otpCode: $otpCode) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        message
      }
    }
  }
`;
