// types/seller-application.ts
import { MyStore } from "@/lib/api/sellers";

export type ApplicationStep = 1 | 2 | 3 | 4;

export interface StepProps {
  formData: FormDataState;
  onChange: (field: keyof FormDataState, value: any) => void;
}

export interface FormDataState {
  storeName: string;
  category: string;
  description: string;
  logo: string;
  banner: string;
  ownerName: string;
  contactPhone: string;
  businessAddress: string;
  nidOrTradeLicense: string;
  taxId: string;
  payoutMethod: string;
  payoutAccountName: string;
  payoutAccountNumber: string;
  bankBranch: string;
  agreedToTerms: boolean;
}

export interface SellerApplicationFormProps {
  initialData?: MyStore | null;
  isResubmission?: boolean;
  onSuccess?: (store: MyStore) => void;
}