"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useSession } from "@/lib/auth-client";
import {
  getDeliveryProfile,
  updateDeliveryProfile,
  DeliveryManPersonalInfo,
  DeliveryManIdentityInfo,
  DeliveryManLicenseInfo,
  DeliveryManVehicleInfo,
  DeliveryManBankInfo,
  DeliveryManPreferences,
} from "@/lib/api/delivery";
import {
  FiTruck,
  FiUser,
  FiFileText,
  FiCreditCard,
  FiCheckCircle,
  FiAlertCircle,
  FiUploadCloud,
  FiArrowRight,
  FiArrowLeft,
  FiShield,
  FiMapPin,
  FiPhone,
  FiLock,
  FiKey,
} from "react-icons/fi";

const SECTIONS = [
  { id: "personal", label: "Personal Info", icon: FiUser },
  { id: "identity", label: "Identity & NID", icon: FiShield },
  { id: "license", label: "Driving License", icon: FiFileText },
  { id: "vehicle", label: "Vehicle Details", icon: FiTruck },
  { id: "bank", label: "Payout & Banking", icon: FiCreditCard },
  { id: "preferences", label: "Work Preferences", icon: FiMapPin },
  { id: "terms", label: "Agreement & Consent", icon: FiCheckCircle },
];

export default function DeliveryRegistrationPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  // Form State
  const [personal, setPersonal] = useState<DeliveryManPersonalInfo>({
    fullName: "",
    phone: "",
    alternatePhone: "",
    email: "",
    dateOfBirth: "",
    gender: "male",
    emergencyContactName: "",
    emergencyContactPhone: "",
    currentAddress: "",
    permanentAddress: "",
    city: "Dhaka",
    district: "Dhaka",
    serviceArea: ["Dhanmondi", "Gulshan", "Banani", "Uttara"],
    profilePhoto: "",
  });

  const [identity, setIdentity] = useState<DeliveryManIdentityInfo>({
    nidNumber: "",
    nidType: "NID / Smart Card",
    nidFrontImage: "",
    nidBackImage: "",
    selfieImage: "",
  });

  const [license, setLicense] = useState<DeliveryManLicenseInfo>({
    licenseNumber: "",
    licenseType: "Professional",
    licenseExpiryDate: "",
    licenseFrontImage: "",
    licenseBackImage: "",
    drivingExperience: 2,
    vehicleExperience: "Motorcycle & Scooter operations",
  });

  const [vehicle, setVehicle] = useState<DeliveryManVehicleInfo>({
    vehicleType: "motorcycle",
    vehicleBrand: "",
    vehicleModel: "",
    vehicleColor: "",
    vehicleRegistrationNumber: "",
    vehicleRegistrationDocument: "",
    vehicleOwnershipType: "owned",
    vehiclePhoto: "",
    vehicleFrontPhoto: "",
    vehicleBackPhoto: "",
    vehicleFitnessExpiryDate: "",
    vehicleCapacity: 3,
  });

  const [bank, setBank] = useState<DeliveryManBankInfo>({
    bankName: "",
    accountNumber: "",
    accountHolderName: "",
    branchName: "",
    routingNumber: "",
    mobileBankingProvider: "bkash",
    mobileBankingNumber: "",
  });

  const [preferences, setPreferences] = useState<DeliveryManPreferences>({
    preferredServiceZones: ["Dhaka North", "Dhaka South"],
    maxActiveDeliveries: 3,
    preferredVehicleType: "motorcycle",
    availabilityPreference: "full_time",
    deliveryRadius: 15,
  });

  const [emergencyBloodGroup, setEmergencyBloodGroup] = useState("O+");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToSafety, setAgreedToSafety] = useState(false);

  // Preload existing profile if editing / resubmitting
  useEffect(() => {
    if (!sessionLoading) {
      if (!session?.user) {
        router.replace("/login?next=/delivery/register");
        return;
      }

      setPersonal((prev) => ({
        ...prev,
        fullName: prev.fullName || session.user.name || "",
        email: prev.email || session.user.email || "",
      }));

      getDeliveryProfile()
        .then((res) => {
          const profileData = "data" in res ? (res as any).data : res;
          if (profileData?.details) {
            const d = profileData.details;
            if (d.personal) setPersonal((p) => ({ ...p, ...d.personal }));
            if (d.identity) setIdentity((i) => ({ ...i, ...d.identity }));
            if (d.license) setLicense((l) => ({ ...l, ...d.license }));
            if (d.vehicle) setVehicle((v) => ({ ...v, ...d.vehicle }));
            if (d.bank) setBank((b) => ({ ...b, ...d.bank }));
            if (d.preferences) setPreferences((pr) => ({ ...pr, ...d.preferences }));
          }
        })
        .catch(() => undefined)
        .finally(() => setInitialLoading(false));
    }
  }, [session, sessionLoading, router]);

  // Handle document uploads
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldSetter: (url: string) => void, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit.");
      return;
    }

    setUploadingField(fieldName);
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"}/delivery/upload-document`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to upload document");

      const fileUrl = json.data?.url || json.url;
      fieldSetter(fileUrl);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to upload document");
    } finally {
      setUploadingField(null);
    }
  };

  const handleNext = () => {
    setErrorMsg("");
    // Step validation
    if (currentStep === 0) {
      if (!personal.fullName.trim()) return setErrorMsg("Full Name is required.");
      if (!personal.phone.trim()) return setErrorMsg("Phone Number is required.");
      if (!personal.currentAddress?.trim()) return setErrorMsg("Current Address is required.");
    }
    if (currentStep === 1) {
      if (!identity.nidNumber?.trim()) return setErrorMsg("NID Number is required.");
    }
    if (currentStep === 2) {
      if (vehicle.vehicleType !== "bicycle" && !license.licenseNumber?.trim()) {
        return setErrorMsg("Driving License Number is required for motorized vehicles.");
      }
    }
    if (currentStep === 3) {
      if (!vehicle.vehicleBrand?.trim()) return setErrorMsg("Vehicle Brand is required.");
      if (vehicle.vehicleType !== "bicycle" && !vehicle.vehicleRegistrationNumber?.trim()) {
        return setErrorMsg("Vehicle Registration Number is required.");
      }
    }

    if (currentStep < SECTIONS.length - 1) {
      setCurrentStep((p) => p + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    setErrorMsg("");
    if (currentStep > 0) {
      setCurrentStep((p) => p - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms || !agreedToSafety) {
      setErrorMsg("Please accept the Delivery Partner Agreement and Safety Consent.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const sanitizedDateOfBirth = personal.dateOfBirth?.trim() || undefined;
      const sanitizedLicenseExpiry = license.licenseExpiryDate?.trim() || undefined;
      const sanitizedFitnessExpiry = vehicle.vehicleFitnessExpiryDate?.trim() || undefined;

      await updateDeliveryProfile({
        personal: {
          ...personal,
          dateOfBirth: sanitizedDateOfBirth,
          emergencyContactName: personal.emergencyContactName || "Emergency Contact",
          emergencyContactPhone: personal.emergencyContactPhone || personal.phone,
        },
        identity,
        license: {
          ...license,
          licenseExpiryDate: sanitizedLicenseExpiry,
        },
        vehicle: {
          ...vehicle,
          vehicleFitnessExpiryDate: sanitizedFitnessExpiry,
          vehicleCapacity:
            vehicle.vehicleType === "van"
              ? 10
              : vehicle.vehicleType === "car"
              ? 5
              : vehicle.vehicleType === "motorcycle"
              ? 3
              : 1,
        },
        bank,
        preferences: {
          ...preferences,
          maxActiveDeliveries:
            vehicle.vehicleType === "van"
              ? 10
              : vehicle.vehicleType === "car"
              ? 5
              : vehicle.vehicleType === "motorcycle"
              ? 3
              : 1,
        },
      });

      router.replace("/delivery/pending");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit delivery partner application.");
    } finally {
      setLoading(false);
    }
  };

  if (sessionLoading || initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-background">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-text">Loading registration portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface dark:bg-background text-text transition-colors py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Brand & Title */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-r from-primary to-accent flex items-center justify-center text-white shadow-lg">
              <FiTruck className="text-xl" />
            </div>
            <div>
              <span className="font-black text-lg text-text tracking-tight block leading-none">ShopNest</span>
              <span className="text-[11px] font-bold text-primary tracking-wider uppercase">Delivery Fleet Onboarding</span>
            </div>
          </Link>

          <Link
            href="/delivery/pending"
            className="text-xs font-bold text-muted hover:text-primary transition"
          >
            Check Existing Status →
          </Link>
        </div>

        {/* Wizard Progress Bar */}
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-text">
              Step {currentStep + 1} of {SECTIONS.length}: {SECTIONS[currentStep].label}
            </span>
            <span className="text-xs font-bold text-primary">
              {Math.round(((currentStep + 1) / SECTIONS.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-muted-bg overflow-hidden">
            <motion.div
              className="h-full bg-linear-to-r from-primary to-accent"
              initial={{ width: "0%" }}
              animate={{ width: `${((currentStep + 1) / SECTIONS.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Stepper Navigation Pills */}
          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto [scrollbar-width:none] py-1">
            {SECTIONS.map((sec, idx) => {
              const Icon = sec.icon;
              const isPast = idx < currentStep;
              const isCurrent = idx === currentStep;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => idx <= currentStep && setCurrentStep(idx)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
                    isCurrent
                      ? "bg-primary text-white shadow-sm"
                      : isPast
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : "bg-muted-bg text-muted border border-border opacity-70"
                  }`}
                >
                  <Icon className="text-xs" />
                  <span>{sec.label}</span>
                  {isPast && <span>✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Error Alert */}
        <AnimatePresence mode="wait">
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-bold text-rose-600 dark:text-rose-400 shadow-sm"
            >
              <FiAlertCircle className="text-base shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step Container Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (currentStep < SECTIONS.length - 1) {
              handleNext();
            } else {
              handleSubmit(e);
            }
          }}
          className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-xl space-y-6"
        >
          {/* STEP 0: PERSONAL INFORMATION */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-black text-text">A. Personal Information</h2>
                <p className="text-xs text-muted">Enter your basic contact details and operational service location.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={personal.fullName}
                    onChange={(e) => setPersonal({ ...personal, fullName: e.target.value })}
                    placeholder="Enter your full name as per NID"
                    className="w-full rounded-xl border border-border bg-muted-bg px-3.5 py-2.5 text-xs text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">Primary Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={personal.phone}
                    onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
                    placeholder="e.g. 01712345678"
                    className="w-full rounded-xl border border-border bg-muted-bg px-3.5 py-2.5 text-xs text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">Alternate / WhatsApp Phone</label>
                  <input
                    type="tel"
                    value={personal.alternatePhone || ""}
                    onChange={(e) => setPersonal({ ...personal, alternatePhone: e.target.value })}
                    placeholder="Optional backup phone"
                    className="w-full rounded-xl border border-border bg-muted-bg px-3.5 py-2.5 text-xs text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={personal.email || ""}
                    onChange={(e) => setPersonal({ ...personal, email: e.target.value })}
                    placeholder="rider@example.com"
                    className="w-full rounded-xl border border-border bg-muted-bg px-3.5 py-2.5 text-xs text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={personal.dateOfBirth ? String(personal.dateOfBirth).split("T")[0] : ""}
                    onChange={(e) => setPersonal({ ...personal, dateOfBirth: e.target.value })}
                    className="w-full rounded-xl border border-border bg-muted-bg px-3.5 py-2.5 text-xs text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">Gender</label>
                  <select
                    value={personal.gender || "male"}
                    onChange={(e) => setPersonal({ ...personal, gender: e.target.value })}
                    className="w-full rounded-xl border border-border bg-muted-bg px-3.5 py-2.5 text-xs text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">Current Residential Address *</label>
                  <textarea
                    rows={2}
                    required
                    value={personal.currentAddress || ""}
                    onChange={(e) => setPersonal({ ...personal, currentAddress: e.target.value })}
                    placeholder="House, Road, Area, City"
                    className="w-full rounded-xl border border-border bg-muted-bg px-3.5 py-2.5 text-xs text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">City / Division</label>
                  <select
                    value={personal.city || "Dhaka"}
                    onChange={(e) => setPersonal({ ...personal, city: e.target.value })}
                    className="w-full rounded-xl border border-border bg-muted-bg px-3.5 py-2.5 text-xs text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Dhaka">Dhaka</option>
                    <option value="Chittagong">Chittagong</option>
                    <option value="Sylhet">Sylhet</option>
                    <option value="Rajshahi">Rajshahi</option>
                    <option value="Khulna">Khulna</option>
                    <option value="Barisal">Barisal</option>
                    <option value="Rangpur">Rangpur</option>
                    <option value="Mymensingh">Mymensingh</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">Profile Verification Photo</label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 rounded-xl border border-border bg-muted-bg px-4 py-2.5 text-xs font-bold text-text hover:border-primary cursor-pointer transition">
                      <FiUploadCloud className="text-primary text-base" />
                      <span>{uploadingField === "profilePhoto" ? "Uploading..." : "Upload Photo"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, (url) => setPersonal((p) => ({ ...p, profilePhoto: url })), "profilePhoto")}
                      />
                    </label>
                    {personal.profilePhoto && (
                      <span className="text-[11px] font-bold text-emerald-500">✓ Uploaded</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: IDENTITY VERIFICATION */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-black text-text">B. Identity Verification (KYC)</h2>
                <p className="text-xs text-muted">Upload clear images of your National ID / Smart Card or Passport.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">ID Document Type</label>
                  <select
                    value={identity.nidType || "NID / Smart Card"}
                    onChange={(e) => setIdentity({ ...identity, nidType: e.target.value })}
                    className="w-full rounded-xl border border-border bg-muted-bg px-3.5 py-2.5 text-xs text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="NID / Smart Card">National ID / Smart Card (10 or 17 digit)</option>
                    <option value="Passport">Passport</option>
                    <option value="Birth Certificate">Birth Certificate</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">NID / Document Number *</label>
                  <input
                    type="text"
                    required
                    value={identity.nidNumber || ""}
                    onChange={(e) => setIdentity({ ...identity, nidNumber: e.target.value })}
                    placeholder="Enter NID number"
                    className="w-full rounded-xl border border-border bg-muted-bg px-3.5 py-2.5 text-xs text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">NID Front Side Image</label>
                  <label className="flex items-center justify-between rounded-xl border border-dashed border-border bg-muted-bg/50 p-4 text-xs font-bold text-text hover:border-primary cursor-pointer transition">
                    <span className="truncate">
                      {uploadingField === "nidFront" ? "Uploading..." : identity.nidFrontImage ? "Replace Front Photo" : "Upload NID Front"}
                    </span>
                    <FiUploadCloud className="text-primary text-lg" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, (url) => setIdentity((i) => ({ ...i, nidFrontImage: url })), "nidFront")}
                    />
                  </label>
                  {identity.nidFrontImage && <span className="text-[10px] text-emerald-500 font-bold block mt-1">✓ Front image attached</span>}
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">NID Back Side Image</label>
                  <label className="flex items-center justify-between rounded-xl border border-dashed border-border bg-muted-bg/50 p-4 text-xs font-bold text-text hover:border-primary cursor-pointer transition">
                    <span className="truncate">
                      {uploadingField === "nidBack" ? "Uploading..." : identity.nidBackImage ? "Replace Back Photo" : "Upload NID Back"}
                    </span>
                    <FiUploadCloud className="text-primary text-lg" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, (url) => setIdentity((i) => ({ ...i, nidBackImage: url })), "nidBack")}
                    />
                  </label>
                  {identity.nidBackImage && <span className="text-[10px] text-emerald-500 font-bold block mt-1">✓ Back image attached</span>}
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">Live Verification Selfie</label>
                  <label className="flex items-center justify-between rounded-xl border border-dashed border-border bg-muted-bg/50 p-4 text-xs font-bold text-text hover:border-primary cursor-pointer transition">
                    <span className="truncate">
                      {uploadingField === "selfie" ? "Uploading..." : identity.selfieImage ? "Replace Selfie" : "Upload Front Facing Selfie with NID"}
                    </span>
                    <FiUploadCloud className="text-primary text-lg" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, (url) => setIdentity((i) => ({ ...i, selfieImage: url })), "selfie")}
                    />
                  </label>
                  {identity.selfieImage && <span className="text-[10px] text-emerald-500 font-bold block mt-1">✓ Selfie attached</span>}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: DRIVING LICENSE */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-black text-text">C. Driving Information</h2>
                <p className="text-xs text-muted">Required for Motorcycle, Car, and Van operators. Bicycle riders may skip license.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">Driving License Number</label>
                  <input
                    type="text"
                    value={license.licenseNumber || ""}
                    onChange={(e) => setLicense({ ...license, licenseNumber: e.target.value })}
                    placeholder="e.g. DK123456789"
                    className="w-full rounded-xl border border-border bg-muted-bg px-3.5 py-2.5 text-xs text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">License Type</label>
                  <select
                    value={license.licenseType || "Professional"}
                    onChange={(e) => setLicense({ ...license, licenseType: e.target.value })}
                    className="w-full rounded-xl border border-border bg-muted-bg px-3.5 py-2.5 text-xs text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Professional">Professional (Motorcycle &amp; Light Vehicle)</option>
                    <option value="Non-Professional">Non-Professional</option>
                    <option value="Learner">Learner Permit</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">License Expiry Date</label>
                  <input
                    type="date"
                    value={license.licenseExpiryDate ? String(license.licenseExpiryDate).split("T")[0] : ""}
                    onChange={(e) => setLicense({ ...license, licenseExpiryDate: e.target.value })}
                    className="w-full rounded-xl border border-border bg-muted-bg px-3.5 py-2.5 text-xs text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">Driving Experience (Years)</label>
                  <input
                    type="number"
                    min={0}
                    value={license.drivingExperience ?? 2}
                    onChange={(e) => setLicense({ ...license, drivingExperience: Number(e.target.value) })}
                    className="w-full rounded-xl border border-border bg-muted-bg px-3.5 py-2.5 text-xs text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">License Front Image</label>
                  <label className="flex items-center justify-between rounded-xl border border-dashed border-border bg-muted-bg/50 p-4 text-xs font-bold text-text hover:border-primary cursor-pointer transition">
                    <span className="truncate">
                      {uploadingField === "licenseFront" ? "Uploading..." : license.licenseFrontImage ? "Replace Front Photo" : "Upload License Front"}
                    </span>
                    <FiUploadCloud className="text-primary text-lg" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, (url) => setLicense((l) => ({ ...l, licenseFrontImage: url })), "licenseFront")}
                    />
                  </label>
                  {license.licenseFrontImage && <span className="text-[10px] text-emerald-500 font-bold block mt-1">✓ Front attached</span>}
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">License Back Image</label>
                  <label className="flex items-center justify-between rounded-xl border border-dashed border-border bg-muted-bg/50 p-4 text-xs font-bold text-text hover:border-primary cursor-pointer transition">
                    <span className="truncate">
                      {uploadingField === "licenseBack" ? "Uploading..." : license.licenseBackImage ? "Replace Back Photo" : "Upload License Back"}
                    </span>
                    <FiUploadCloud className="text-primary text-lg" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, (url) => setLicense((l) => ({ ...l, licenseBackImage: url })), "licenseBack")}
                    />
                  </label>
                  {license.licenseBackImage && <span className="text-[10px] text-emerald-500 font-bold block mt-1">✓ Back attached</span>}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: VEHICLE INFORMATION */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-black text-text">D. Vehicle Information</h2>
                <p className="text-xs text-muted">Register your delivery vehicle to determine delivery capacity and order compatibility.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">Vehicle Type *</label>
                  <select
                    value={vehicle.vehicleType || "motorcycle"}
                    onChange={(e) => setVehicle({ ...vehicle, vehicleType: e.target.value as any })}
                    className="w-full rounded-xl border border-border bg-muted-bg px-3.5 py-2.5 text-xs text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="motorcycle">Motorcycle (Standard Capacity: 3 active)</option>
                    <option value="bicycle">Bicycle (Eco Capacity: 1 active)</option>
                    <option value="car">Car (Capacity: 5 active)</option>
                    <option value="van">Van / Mini Truck (Capacity: 10 active)</option>
                    <option value="other">Other Carrier</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">Ownership Type</label>
                  <select
                    value={vehicle.vehicleOwnershipType || "owned"}
                    onChange={(e) => setVehicle({ ...vehicle, vehicleOwnershipType: e.target.value as any })}
                    className="w-full rounded-xl border border-border bg-muted-bg px-3.5 py-2.5 text-xs text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="owned">Owned by Me</option>
                    <option value="rented">Rented / Leased</option>
                    <option value="company_provided">Company Provided</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">Vehicle Brand *</label>
                  <input
                    type="text"
                    required
                    value={vehicle.vehicleBrand || ""}
                    onChange={(e) => setVehicle({ ...vehicle, vehicleBrand: e.target.value })}
                    placeholder="e.g. Yamaha, Honda, Hero, Bajaj"
                    className="w-full rounded-xl border border-border bg-muted-bg px-3.5 py-2.5 text-xs text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">Model &amp; Color</label>
                  <input
                    type="text"
                    value={vehicle.vehicleModel || ""}
                    onChange={(e) => setVehicle({ ...vehicle, vehicleModel: e.target.value })}
                    placeholder="e.g. FZ-S V3 (Black)"
                    className="w-full rounded-xl border border-border bg-muted-bg px-3.5 py-2.5 text-xs text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">Vehicle Registration Number</label>
                  <input
                    type="text"
                    value={vehicle.vehicleRegistrationNumber || ""}
                    onChange={(e) => setVehicle({ ...vehicle, vehicleRegistrationNumber: e.target.value })}
                    placeholder="e.g. Dhaka Metro HA-12-3456"
                    className="w-full rounded-xl border border-border bg-muted-bg px-3.5 py-2.5 text-xs text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {vehicle.vehicleType !== "bicycle" && (
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">Vehicle Fitness Expiry Date (Optional)</label>
                    <input
                      type="date"
                      value={vehicle.vehicleFitnessExpiryDate ? String(vehicle.vehicleFitnessExpiryDate).split("T")[0] : ""}
                      onChange={(e) => setVehicle({ ...vehicle, vehicleFitnessExpiryDate: e.target.value })}
                      className="w-full rounded-xl border border-border bg-muted-bg px-3.5 py-2.5 text-xs text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">Vehicle Photo</label>
                  <label className="flex items-center justify-between rounded-xl border border-dashed border-border bg-muted-bg/50 p-4 text-xs font-bold text-text hover:border-primary cursor-pointer transition">
                    <span className="truncate">
                      {uploadingField === "vehPhoto" ? "Uploading..." : vehicle.vehiclePhoto ? "Replace Vehicle Photo" : "Upload Vehicle Photo"}
                    </span>
                    <FiUploadCloud className="text-primary text-lg" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, (url) => setVehicle((v) => ({ ...v, vehiclePhoto: url })), "vehPhoto")}
                    />
                  </label>
                  {vehicle.vehiclePhoto && <span className="text-[10px] text-emerald-500 font-bold block mt-1">✓ Vehicle photo attached</span>}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: BANK & PAYOUT INFORMATION */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-black text-text">E. Payout &amp; Banking Details</h2>
                <p className="text-xs text-muted">Receive your delivery earnings and incentives via Mobile Banking (bKash/Nagad) or Bank Account.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">Payout Method</label>
                  <select
                    value={bank.mobileBankingProvider || "bkash"}
                    onChange={(e) => setBank({ ...bank, mobileBankingProvider: e.target.value as any })}
                    className="w-full rounded-xl border border-border bg-muted-bg px-3.5 py-2.5 text-xs text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="bkash">bKash (Personal / Agent)</option>
                    <option value="nagad">Nagad</option>
                    <option value="rocket">Rocket</option>
                    <option value="bank">Traditional Bank Account</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">
                    {bank.mobileBankingProvider === "bank" ? "Bank Account Number" : "Mobile Wallet Number"}
                  </label>
                  <input
                    type="text"
                    value={bank.mobileBankingNumber || bank.accountNumber || ""}
                    onChange={(e) => setBank({ ...bank, mobileBankingNumber: e.target.value, accountNumber: e.target.value })}
                    placeholder="e.g. 01712345678"
                    className="w-full rounded-xl border border-border bg-muted-bg px-3.5 py-2.5 text-xs text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {bank.mobileBankingProvider === "bank" && (
                  <>
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">Bank Name</label>
                      <input
                        type="text"
                        value={bank.bankName || ""}
                        onChange={(e) => setBank({ ...bank, bankName: e.target.value })}
                        placeholder="e.g. Dutch-Bangla Bank, BRAC Bank"
                        className="w-full rounded-xl border border-border bg-muted-bg px-3.5 py-2.5 text-xs text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">Account Holder Name</label>
                      <input
                        type="text"
                        value={bank.accountHolderName || ""}
                        onChange={(e) => setBank({ ...bank, accountHolderName: e.target.value })}
                        placeholder="Account name as in bank"
                        className="w-full rounded-xl border border-border bg-muted-bg px-3.5 py-2.5 text-xs text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: WORK PREFERENCES & SAFETY */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-black text-text">F. Work Preferences &amp; Emergency Info</h2>
                <p className="text-xs text-muted">Configure your operational zones and emergency safety contact.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">Availability Schedule</label>
                  <select
                    value={preferences.availabilityPreference || "full_time"}
                    onChange={(e) => setPreferences({ ...preferences, availabilityPreference: e.target.value as any })}
                    className="w-full rounded-xl border border-border bg-muted-bg px-3.5 py-2.5 text-xs text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="full_time">Full Time (All Shifts)</option>
                    <option value="part_time">Part Time (Evening / Morning)</option>
                    <option value="weekends">Weekends Only</option>
                    <option value="on_call">Flexible On-Call</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">Preferred Operating Radius (km)</label>
                  <input
                    type="number"
                    min={2}
                    max={50}
                    value={preferences.deliveryRadius ?? 15}
                    onChange={(e) => setPreferences({ ...preferences, deliveryRadius: Number(e.target.value) })}
                    className="w-full rounded-xl border border-border bg-muted-bg px-3.5 py-2.5 text-xs text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">Emergency Contact Name *</label>
                  <input
                    type="text"
                    value={personal.emergencyContactName || ""}
                    onChange={(e) => setPersonal({ ...personal, emergencyContactName: e.target.value })}
                    placeholder="Parent / Spouse / Relative Name"
                    className="w-full rounded-xl border border-border bg-muted-bg px-3.5 py-2.5 text-xs text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">Emergency Phone *</label>
                  <input
                    type="tel"
                    value={personal.emergencyContactPhone || ""}
                    onChange={(e) => setPersonal({ ...personal, emergencyContactPhone: e.target.value })}
                    placeholder="Emergency Contact Phone"
                    className="w-full rounded-xl border border-border bg-muted-bg px-3.5 py-2.5 text-xs text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">Blood Group</label>
                  <select
                    value={emergencyBloodGroup}
                    onChange={(e) => setEmergencyBloodGroup(e.target.value)}
                    className="w-full rounded-xl border border-border bg-muted-bg px-3.5 py-2.5 text-xs text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: TERMS & AGREEMENT */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-black text-text">G. Terms, Agreement &amp; Submission</h2>
                <p className="text-xs text-muted">Review your agreement to ShopNest delivery fleet guidelines and safety compliance.</p>
              </div>

              <div className="rounded-2xl border border-border bg-muted-bg/50 p-4 text-xs space-y-3 max-h-56 overflow-y-auto">
                <p className="font-bold text-text">Delivery Partner Code of Conduct &amp; Service Agreement:</p>
                <p className="text-muted leading-relaxed">
                  1. As a ShopNest Delivery Partner, you agree to handle parcels with maximum care, respect customer privacy, and uphold road safety regulations at all times.
                </p>
                <p className="text-muted leading-relaxed">
                  2. You agree to deliver packages only after verifying the customer’s 6-digit OTP and never falsely complete a delivery without customer confirmation.
                </p>
                <p className="text-muted leading-relaxed">
                  3. Live GPS telemetry is transmitted only during active deliveries to ensure safety and provide accurate tracking to the buyer.
                </p>
                <p className="text-muted leading-relaxed">
                  4. Any fraudulent claims or tampering with packages will result in immediate suspension and forfeiture of platform access.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded cursor-pointer accent-primary"
                  />
                  <span className="text-xs text-text leading-snug">
                    I agree to the <Link href="/terms" className="text-primary font-bold hover:underline">Delivery Partner Agreement</Link> and <Link href="/privacy" className="text-primary font-bold hover:underline">Privacy Policy</Link>.
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToSafety}
                    onChange={(e) => setAgreedToSafety(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded cursor-pointer accent-primary"
                  />
                  <span className="text-xs text-text leading-snug">
                    I certify that all documents and information provided are genuine, authentic, and subject to administrative verification.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Bottom Action Controls */}
          <div className="flex items-center justify-between border-t border-border pt-4">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-bold text-text hover:border-primary transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <FiArrowLeft />
              <span>Previous</span>
            </button>

            {currentStep < SECTIONS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 rounded-xl bg-linear-to-r from-primary to-accent px-6 py-2.5 text-xs font-bold text-white shadow-md hover:shadow-primary/30 transition hover:scale-105 cursor-pointer"
              >
                <span>Continue</span>
                <FiArrowRight />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || !agreedToTerms || !agreedToSafety}
                className="flex items-center gap-2 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 px-8 py-3 text-xs font-bold text-white shadow-lg hover:shadow-emerald-500/30 transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <FiCheckCircle />
                    <span>Submit Partner Application</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
