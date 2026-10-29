"use client";

import React, { useState, useMemo } from "react";
import {
  Plus,
  Phone,
  Mail,
  Edit2,
  Trash2,
  Sparkles,
} from "lucide-react";
import { useUtsav } from "@/hooks/useUtsavStore";
import { formatINR } from "@/lib/budget/math";
import { Modal } from "@/components/ui/Modal";
import { VendorItem, VendorStatus } from "@/types";

export function VendorsSection() {
  const { activeEvent, updateVendor, addVendor, deleteVendor, addToast } = useUtsav();

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<VendorItem | null>(null);
  const [questionsModalVendor, setQuestionsModalVendor] = useState<VendorItem | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("Catering");
  const [formStatus, setFormStatus] = useState<VendorStatus>("to_contact");
  const [formPerson, setFormPerson] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formQuoted, setFormQuoted] = useState<number>(0);
  const [formRange, setFormRange] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const vendors = useMemo(() => activeEvent?.vendors || [], [activeEvent?.vendors]);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    vendors.forEach((v) => set.add(v.category));
    return ["all", ...Array.from(set)];
  }, [vendors]);

  const filteredVendors = useMemo(() => {
    if (activeCategory === "all") return vendors;
    return vendors.filter((v) => v.category === activeCategory);
  }, [vendors, activeCategory]);

  if (!activeEvent) return null;

  const handleOpenAdd = () => {
    setEditingVendor(null);
    setFormName("");
    setFormCategory(activeCategory !== "all" ? activeCategory : "Catering");
    setFormStatus("to_contact");
    setFormPerson("");
    setFormPhone("");
    setFormEmail("");
    setFormQuoted(0);
    setFormRange("");
    setFormNotes("");
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (v: VendorItem) => {
    setEditingVendor(v);
    setFormName(v.name);
    setFormCategory(v.category);
    setFormStatus(v.status);
    setFormPerson(v.contactPerson || "");
    setFormPhone(v.phone || "");
    setFormEmail(v.email || "");
    setFormQuoted(v.quotedPrice);
    setFormRange(v.estimatedRange);
    setFormNotes(v.notes);
    setIsAddModalOpen(true);
  };

  const handleSubmitVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingVendor) {
      updateVendor({
        ...editingVendor,
        name: formName.trim(),
        category: formCategory,
        status: formStatus,
        contactPerson: formPerson.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim(),
        quotedPrice: formQuoted,
        estimatedRange: formRange.trim(),
        notes: formNotes.trim(),
      });
      addToast({
        type: "success",
        title: "Vendor Updated",
        message: `${formName} updated. Booked amounts sync to budget automatically.`,
      });
    } else {
      addVendor({
        name: formName.trim(),
        category: formCategory,
        status: formStatus,
        contactPerson: formPerson.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim(),
        quotedPrice: formQuoted,
        estimatedRange: formRange.trim(),
        notes: formNotes.trim(),
        questionsToAsk: [
          `What are your cancellation policies and backup dates?`,
          `Are there any overtime fees or local transport logistics costs?`,
        ],
      });
      addToast({
        type: "success",
        title: "Vendor Added",
        message: `${formName} added to directory.`,
      });
    }
    setIsAddModalOpen(false);
  };

  const handleStatusChange = (vendor: VendorItem, nextStatus: VendorStatus) => {
    updateVendor({ ...vendor, status: nextStatus });
    addToast({
      type: "info",
      title: "Status Changed",
      message: `${vendor.name} marked as "${nextStatus.replace("_", " ")}".`,
    });
  };

  const getStatusBadge = (s: VendorStatus) => {
    switch (s) {
      case "booked":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      case "contacted":
        return "bg-saffron-500/20 text-saffron-300 border-saffron-500/40";
      case "to_contact":
        return "bg-plum-500/20 text-plum-300 border-plum-500/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ivory-100">
            Vendor Directory
          </h1>
          <p className="text-xs text-ivory-300 mt-1">
            Track quotes, contracts, and auto-sync booked prices with your budget
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-saffron-500 hover:bg-saffron-400 text-plum-950 font-bold text-xs tracking-wide shadow-glass transition-all focus:outline-none focus:ring-2 focus:ring-saffron-400"
        >
          <Plus className="w-4 h-4" />
          <span>Add Vendor</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
                isSelected
                  ? "bg-saffron-500 text-plum-950 border-saffron-400 shadow-sm"
                  : "bg-plum-900/40 text-ivory-300 border-plum-700/60 hover:text-ivory-100"
              }`}
            >
              {cat === "all" ? "All Vendors" : cat}
            </button>
          );
        })}
      </div>

      {/* Vendor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVendors.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-ivory-400">
            No vendors found in this category.
          </div>
        ) : (
          filteredVendors.map((vendor) => {
            return (
              <div
                key={vendor.id}
                className="p-5 rounded-2xl bg-plum-900/40 border border-plum-700/50 backdrop-blur-md shadow-glass flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-plum-950 border border-plum-800 text-ivory-300">
                      {vendor.category}
                    </span>

                    {/* Status Dropdown */}
                    <select
                      value={vendor.status}
                      onChange={(e) =>
                        handleStatusChange(vendor, e.target.value as VendorStatus)
                      }
                      className={`text-xs font-semibold px-2 py-0.5 rounded border focus:outline-none focus:ring-1 focus:ring-saffron-400 cursor-pointer ${getStatusBadge(
                        vendor.status,
                      )}`}
                    >
                      <option value="to_contact">To Contact</option>
                      <option value="contacted">Contacted</option>
                      <option value="booked">Booked</option>
                    </select>
                  </div>

                  <h3 className="font-display text-lg font-bold text-ivory-100">{vendor.name}</h3>

                  {vendor.contactPerson && (
                    <p className="text-xs text-ivory-300 mt-1">POC: {vendor.contactPerson}</p>
                  )}

                  {/* Quoted Price / Est Range */}
                  <div className="my-3 p-3 rounded-xl bg-plum-950/60 border border-plum-800/80">
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="text-ivory-400">Quoted Price:</span>
                      <span className="font-display text-base font-bold text-saffron-300">
                        {formatINR(vendor.quotedPrice)}
                      </span>
                    </div>
                    {vendor.estimatedRange && (
                      <div className="text-[11px] text-ivory-400/80 mt-1 flex justify-between">
                        <span>Market Range:</span>
                        <span>{vendor.estimatedRange}</span>
                      </div>
                    )}
                  </div>

                  {vendor.notes && (
                    <p className="text-xs text-ivory-300/80 line-clamp-2 leading-relaxed">
                      {vendor.notes}
                    </p>
                  )}

                  {/* Contact Info */}
                  <div className="mt-3 space-y-1 text-xs text-ivory-300">
                    {vendor.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-saffron-400" />
                        <span>{vendor.phone}</span>
                      </div>
                    )}
                    {vendor.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-saffron-400" />
                        <span className="truncate">{vendor.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-plum-800/60 flex items-center justify-between">
                  {/* AI Questions Trigger */}
                  <button
                    type="button"
                    onClick={() => setQuestionsModalVendor(vendor)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-saffron-400 hover:text-saffron-300"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Interview Questions</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(vendor)}
                      className="p-1.5 text-ivory-400 hover:text-ivory-100 rounded-lg hover:bg-white/10 transition-colors"
                      aria-label={`Edit ${vendor.name}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteVendor(vendor.id)}
                      className="p-1.5 text-rose-400/80 hover:text-rose-300 rounded-lg hover:bg-rose-500/10 transition-colors"
                      aria-label={`Delete ${vendor.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Vendor Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingVendor ? "Edit Vendor" : "Add Vendor"}
      >
        <form onSubmit={handleSubmitVendor} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ivory-200 mb-1">Vendor Name *</label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Royal Rajputana Mandap Stylists"
              className="w-full px-3 py-2 rounded-xl bg-plum-950 border border-plum-700 text-ivory-100 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ivory-200 mb-1">Category</label>
              <input
                type="text"
                required
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                placeholder="e.g. Venue, Catering, Decor"
                className="w-full px-3 py-2 rounded-xl bg-plum-950 border border-plum-700 text-ivory-100 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ivory-200 mb-1">Status</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as VendorStatus)}
                className="w-full px-3 py-2 rounded-xl bg-plum-950 border border-plum-700 text-ivory-100 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400"
              >
                <option value="to_contact">To Contact</option>
                <option value="contacted">Contacted</option>
                <option value="booked">Booked (Syncs to Budget)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ivory-200 mb-1">
                Quoted / Booked Price (₹)
              </label>
              <input
                type="number"
                min="0"
                step="5000"
                value={formQuoted}
                onChange={(e) => setFormQuoted(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-plum-950 border border-plum-700 text-ivory-100 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ivory-200 mb-1">
                Estimated Range Text
              </label>
              <input
                type="text"
                value={formRange}
                onChange={(e) => setFormRange(e.target.value)}
                placeholder="e.g. ₹2,00,000 - ₹3,00,000"
                className="w-full px-3 py-2 rounded-xl bg-plum-950 border border-plum-700 text-ivory-100 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ivory-200 mb-1">POC Name</label>
              <input
                type="text"
                value={formPerson}
                onChange={(e) => setFormPerson(e.target.value)}
                placeholder="e.g. Ananya"
                className="w-full px-3 py-2 rounded-xl bg-plum-950 border border-plum-700 text-ivory-100 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ivory-200 mb-1">Phone</label>
              <input
                type="tel"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 rounded-xl bg-plum-950 border border-plum-700 text-ivory-100 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ivory-200 mb-1">Email</label>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="vendor@domain.com"
                className="w-full px-3 py-2 rounded-xl bg-plum-950 border border-plum-700 text-ivory-100 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ivory-200 mb-1">Notes</label>
            <textarea
              rows={2}
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="Contract terms, deliverables, deposit deadlines"
              className="w-full px-3 py-2 rounded-xl bg-plum-950 border border-plum-700 text-ivory-100 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-plum-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-ivory-300 hover:text-ivory-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-sm font-bold bg-saffron-500 hover:bg-saffron-400 text-plum-950"
            >
              {editingVendor ? "Update Vendor" : "Save Vendor"}
            </button>
          </div>
        </form>
      </Modal>

      {/* AI Interview Questions Modal */}
      {questionsModalVendor && (
        <Modal
          isOpen={!!questionsModalVendor}
          onClose={() => setQuestionsModalVendor(null)}
          title={`Interview Questions: ${questionsModalVendor.name}`}
          description={`Smart questions to ask during discussions for ${questionsModalVendor.category}`}
        >
          <div className="space-y-3">
            {questionsModalVendor.questionsToAsk && questionsModalVendor.questionsToAsk.length > 0 ? (
              questionsModalVendor.questionsToAsk.map((q, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-plum-950/70 border border-plum-800 flex items-start gap-3"
                >
                  <span className="w-5 h-5 rounded-full bg-saffron-500/20 text-saffron-300 text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    {idx + 1}
                  </span>
                  <p className="text-sm text-ivory-100 leading-relaxed">{q}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-ivory-400">No preset questions saved for this vendor.</p>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => setQuestionsModalVendor(null)}
              className="px-4 py-2 rounded-xl text-sm font-bold bg-saffron-500 text-plum-950"
            >
              Done
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

