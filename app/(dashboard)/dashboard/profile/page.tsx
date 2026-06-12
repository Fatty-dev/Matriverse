"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout";
import { Card, CardContent } from "@/components/ui";
import { getProfile, updateProfile } from "@/app/actions/profile";
import { calculateEDDFromLMP } from "@/lib/utils/pregnancy";
import type { Profile } from "@/types";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Not set";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function formatDateForInput(dateStr: string | null): string {
  if (!dateStr) return "";
  return dateStr.split("T")[0];
}

function getInitials(firstName?: string | null, lastName?: string | null): string {
  const first = firstName?.charAt(0)?.toUpperCase() || "";
  const last = lastName?.charAt(0)?.toUpperCase() || "";
  return first + last || "U";
}

function getFullName(firstName?: string | null, lastName?: string | null): string {
  if (firstName && lastName) return `${firstName} ${lastName}`;
  if (firstName) return firstName;
  return "User";
}

function getGestationalWeek(dueDate?: string | null): number | null {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const weeksRemaining = Math.ceil(diffDays / 7);
  const currentWeek = 40 - weeksRemaining;
  return currentWeek > 0 && currentWeek <= 42 ? currentWeek : null;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    dateOfBirth: "",
    dueDate: "",
    lastMenstrualPeriod: "",
    partnerName: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelationship: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    const profileData = await getProfile();
    setProfile(profileData);
    if (profileData) {
      setFormData({
        firstName: profileData.first_name || "",
        lastName: profileData.last_name || "",
        phone: profileData.phone || "",
        dateOfBirth: formatDateForInput(profileData.date_of_birth),
        dueDate: formatDateForInput(profileData.due_date),
        lastMenstrualPeriod: formatDateForInput(profileData.last_menstrual_period),
        partnerName: profileData.partner_name || "",
        emergencyContactName: profileData.emergency_contact_name || "",
        emergencyContactPhone: profileData.emergency_contact_phone || "",
        emergencyContactRelationship: profileData.emergency_contact_relationship || "",
      });
    }
    setIsLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Auto-calculate EDD when LMP changes
    if (name === "lastMenstrualPeriod" && value) {
      const calculatedEDD = calculateEDDFromLMP(value);
      setFormData(prev => ({ ...prev, dueDate: calculatedEDD }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      form.append(key, value);
    });

    const result = await updateProfile(form);

    if (result.success) {
      await loadProfile();
      setIsModalOpen(false);
    } else {
      setError(result.error || "Failed to update profile");
    }

    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <>
        <Header title="Profile" profile={null} />
        <main className="flex-1 px-4 sm:px-6 lg:px-12 py-6 sm:py-8 overflow-y-auto bg-gradient-to-br from-slate-50/50 to-brand-surface/30">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-mid"></div>
          </div>
        </main>
      </>
    );
  }

  const initials = getInitials(profile?.first_name, profile?.last_name);
  const fullName = getFullName(profile?.first_name, profile?.last_name);
  const week = getGestationalWeek(profile?.due_date);
  const dueDate = formatDate(profile?.due_date ?? null);

  return (
    <>
      <Header title="Profile" profile={profile} />

      <main className="flex-1 px-4 sm:px-6 lg:px-12 py-6 sm:py-8 overflow-y-auto bg-gradient-to-br from-slate-50/50 to-brand-surface/30">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-text">My Profile</h1>
          <p className="text-sm sm:text-base text-text-muted">Your pregnancy profile and health information</p>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
          <CardContent className="p-4 sm:p-6 lg:p-8">
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-brand-light/30">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-brand-light shrink-0 flex items-center justify-center mx-auto sm:mx-0">
                <span className="text-2xl sm:text-3xl font-bold text-brand-dark">{initials}</span>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-bold text-text">{fullName}</h2>
                <p className="text-sm sm:text-base text-text-muted">
                  {week ? `Week ${week} of Pregnancy` : "Pregnancy journey started"}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 sm:px-6 py-2 sm:py-2.5 border border-brand-mid text-brand-mid rounded-xl font-medium hover:bg-brand-mid hover:text-white transition-colors text-sm sm:text-base w-full sm:w-auto"
              >
                Edit Profile
              </button>
            </div>

            {/* Profile Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="flex items-center gap-3 p-4 bg-brand-surface rounded-xl">
                <svg className="w-5 h-5 text-brand-mid" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-xs text-text-muted">Email</p>
                  <p className="text-sm font-medium text-text">{profile?.email || "Not set"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-brand-surface rounded-xl">
                <svg className="w-5 h-5 text-brand-mid" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <p className="text-xs text-text-muted">Phone</p>
                  <p className="text-sm font-medium text-text">{profile?.phone || "Not set"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-brand-surface rounded-xl">
                <svg className="w-5 h-5 text-brand-mid" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-xs text-text-muted">Due Date</p>
                  <p className="text-sm font-medium text-text">{dueDate}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-brand-surface rounded-xl">
                <svg className="w-5 h-5 text-brand-mid" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <div>
                  <p className="text-xs text-text-muted">First Pregnancy</p>
                  <p className="text-sm font-medium text-text">
                    {profile?.is_first_pregnancy === true ? "Yes" : profile?.is_first_pregnancy === false ? "No" : "Not specified"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-brand-surface rounded-xl">
                <svg className="w-5 h-5 text-brand-mid" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
                </svg>
                <div>
                  <p className="text-xs text-text-muted">Date of Birth</p>
                  <p className="text-sm font-medium text-text">{formatDate(profile?.date_of_birth ?? null)}</p>
                </div>
              </div>

              {profile?.partner_name && (
                <div className="flex items-center gap-3 p-4 bg-brand-surface rounded-xl">
                  <svg className="w-5 h-5 text-brand-mid" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <div>
                    <p className="text-xs text-text-muted">Partner</p>
                    <p className="text-sm font-medium text-text">{profile.partner_name}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Emergency Contact Section */}
            {(profile?.emergency_contact_name || profile?.emergency_contact_phone) && (
              <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-brand-light/30">
                <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Emergency Contact
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl">
                    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <div>
                      <p className="text-xs text-text-muted">Contact Name</p>
                      <p className="text-sm font-medium text-text">{profile?.emergency_contact_name || "Not set"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl">
                    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div>
                      <p className="text-xs text-text-muted">Contact Phone</p>
                      <p className="text-sm font-medium text-text">{profile?.emergency_contact_phone || "Not set"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl">
                    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <div>
                      <p className="text-xs text-text-muted">Relationship</p>
                      <p className="text-sm font-medium text-text capitalize">{profile?.emergency_contact_relationship || "Not specified"}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Medical History Section */}
            {profile?.medical_history && profile.medical_history.length > 0 && (
              <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-brand-light/30">
                <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-brand-mid" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Medical History
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.medical_history.map((item: string | { condition: string }, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-brand-surface text-brand-mid text-sm rounded-full"
                    >
                      {typeof item === 'string' ? item : item.condition}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Edit Profile Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-text">Edit Profile</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Personal Information */}
              <div>
                <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-mid focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-mid focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-mid focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-mid focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Partner Name</label>
                    <input
                      type="text"
                      name="partnerName"
                      value={formData.partnerName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-mid focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Pregnancy Information */}
              <div>
                <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">Pregnancy Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Last Menstrual Period (LMP)</label>
                    <input
                      type="date"
                      name="lastMenstrualPeriod"
                      value={formData.lastMenstrualPeriod}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-mid focus:border-transparent"
                    />
                    <p className="text-xs text-text-muted mt-1">Enter LMP to auto-calculate due date</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Due Date (EDD)</label>
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-mid focus:border-transparent"
                    />
                    <p className="text-xs text-text-muted mt-1">Auto-calculated from LMP or enter manually</p>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">Emergency Contact</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Contact Name</label>
                    <input
                      type="text"
                      name="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-mid focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      name="emergencyContactPhone"
                      value={formData.emergencyContactPhone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-mid focus:border-transparent"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-text mb-1">Relationship</label>
                    <select
                      name="emergencyContactRelationship"
                      value={formData.emergencyContactRelationship}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-mid focus:border-transparent"
                    >
                      <option value="">Select relationship</option>
                      <option value="spouse">Spouse</option>
                      <option value="partner">Partner</option>
                      <option value="parent">Parent</option>
                      <option value="sibling">Sibling</option>
                      <option value="friend">Friend</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-text rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-4 py-2.5 bg-brand-mid text-white rounded-xl font-medium hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
