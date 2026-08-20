export type AuthStackParamList = {
  PhoneLogin: undefined;
  OtpVerify: { verificationId: string; phone: string };
  CompleteProfile: undefined;
};

export type OnboardingStackParamList = {
  AddressCapture: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Subscriptions: undefined;
  Orders: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  CategoryDetail: { categoryId: string };
  SlotPlanPicker: { categoryId: string };
  Checkout: {
    categoryId: string;
    plan: "weekly" | "monthly";
    slot: "morning" | "evening";
  };
};
