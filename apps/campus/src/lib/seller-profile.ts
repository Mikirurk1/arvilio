export type PublicSellerProfile = {
  schoolName: string;
  legalName: string | null;
  legalAddress: string | null;
  legalCountry: string | null;
  supportEmail: string | null;
  supportPhone: string | null;
  mcc: string | null;
  termsOverrideMd: string | null;
  paymentRefundOverrideMd: string | null;
  isComplete: boolean;
};
