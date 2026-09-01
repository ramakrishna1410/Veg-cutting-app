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
  Cart: undefined;
  Orders: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MenuList: { categoryId: string };
  MenuItemDetail: { menuItemId: string };
  SlotPicker: undefined;
  Checkout: { slot: "morning" | "evening" };
};
