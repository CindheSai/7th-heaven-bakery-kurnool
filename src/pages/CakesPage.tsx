import {
  AlertCircle,
  CheckCircle2,
  Eye,
  Heart,
  ImagePlus,
  MessageCircle,
  X,
} from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SafeImage, VegMark } from '../components/BrandMark.tsx';
import { useBakery } from '../context/BakeryContext.tsx';
import { IMAGES } from '../data/seedData.ts';
import type { CakeCollection } from '../types/bakery.ts';

export function CakesPage() {
  const { cakeCollections, settings } = useBakery();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSlug = searchParams.get('collection') || 'all';

  const [showRefModal, setShowRefModal] = useState(false);
  const enquirySectionRef = useRef<HTMLElement>(null);

  // Enquiry Form State
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [cakeCategory, setCakeCategory] = useState('Classic Cakes');
  const [preferredFlavour, setPreferredFlavour] = useState('Butterscotch');
  const [cakeWeight, setCakeWeight] = useState('1 KG');
  const [shapeOrDesign, setShapeOrDesign] = useState('Standard Round');
  const [requiredDate, setRequiredDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [instructions, setInstructions] = useState('');
  const [referenceImageUrl, setReferenceImageUrl] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submittedEnquiry, setSubmittedEnquiry] = useState<{
    id: string;
    whatsappUrl: string;
  } | null>(null);

  const selectedCollectionObj = useMemo(
    () => cakeCollections.find((c) => c.name === cakeCategory) || cakeCollections[0],
    [cakeCollections, cakeCategory]
  );

  useEffect(() => {
    if (selectedCollectionObj && selectedCollectionObj.flavours.length > 0) {
      const exists = selectedCollectionObj.flavours.some((f) => f.name === preferredFlavour);
      if (!exists) {
        setPreferredFlavour(selectedCollectionObj.flavours[0].name);
      }
    }
  }, [selectedCollectionObj, preferredFlavour]);

  const visibleCollections = useMemo(() => {
    if (activeSlug === 'all') return cakeCollections;
    return cakeCollections.filter((c) => c.slug === activeSlug);
  }, [cakeCollections, activeSlug]);

  const handleEnquireClick = (collection: CakeCollection, flavourName?: string) => {
    setCakeCategory(collection.name);
    if (flavourName) {
      setPreferredFlavour(flavourName);
    } else if (collection.flavours[0]) {
      setPreferredFlavour(collection.flavours[0].name);
    }
    if (collection.slug === 'shape-cake') {
      setShapeOrDesign('Custom Shape (e.g. Car / Doll)');
    } else if (collection.slug === '3d-customised-cake') {
      setShapeOrDesign('3D Fondant Customised Design');
    } else if (collection.slug === 'photo-cake') {
      setShapeOrDesign('Edible Photo Print Cake');
    }
    enquirySectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormError(null);

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setFormError('Please upload a JPEG, PNG, or WebP reference image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFormError('Reference image must be smaller than 5 MB.');
      return;
    }

    setUploadingImage(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Failed to read image file.'));
        reader.readAsDataURL(file);
      });

      const res = await fetch('/api/enquiries/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Image upload failed.');
      }
      setReferenceImageUrl(data.url);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to upload image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmittedEnquiry(null);

    if (customerName.trim().length < 2) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!/^[0-9+\-\s]{10,15}$/.test(mobileNumber.trim())) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customerName: customerName.trim(),
        mobileNumber: mobileNumber.trim(),
        cakeCategory,
        preferredFlavour: preferredFlavour.trim(),
        cakeWeight,
        shapeOrDesign: shapeOrDesign.trim(),
        requiredDate,
        referenceImageUrl: referenceImageUrl || undefined,
        instructions: instructions.trim() || undefined,
      };

      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not submit cake enquiry.');
      }

      const fullRefUrl = referenceImageUrl
        ? `${window.location.origin}${referenceImageUrl}`
        : 'Not attached';

      const msgLines = [
        `Hello ${settings.brandName}, I have a Custom Cake Enquiry (${data.enquiry.id}):`,
        '',
        `Name: ${payload.customerName}`,
        `Mobile: ${payload.mobileNumber}`,
        `Category: ${payload.cakeCategory}`,
        `Preferred Flavour: ${payload.preferredFlavour}`,
        `Weight: ${payload.cakeWeight}`,
        `Shape / Design: ${payload.shapeOrDesign}`,
        `Required Date: ${payload.requiredDate}`,
        `Reference Image: ${fullRefUrl}`,
        payload.instructions ? `Instructions: ${payload.instructions}` : '',
        '',
        'Please confirm availability and final pricing.',
      ].filter(Boolean);

      const whatsappUrl = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
        msgLines.join('\n')
      )}`;

      setSubmittedEnquiry({ id: data.enquiry.id, whatsappUrl });
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="bg-[#FFF9F1] border-b border-[#EEE7DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-xs font-medium text-[#81766D]">
              <span className="inline-flex items-center gap-1.5 text-[#28231F] font-semibold">
                <VegMark className="w-3.5 h-3.5" />
                <span>100% PURE VEG</span>
              </span>
              <span aria-hidden="true">·</span>
              <span>13 Cake Collections</span>
              <span aria-hidden="true">·</span>
              <span>Prices excluding taxes</span>
            </div>

            <button
              type="button"
              onClick={() => setShowRefModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#EEE7DF] hover:border-[#F36B21] text-xs font-semibold text-[#28231F] transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-[#F36B21]" />
              <span>View Original Menu Sheet</span>
            </button>
          </div>

          <div className="max-w-3xl space-y-2.5">
            <h1 className="font-editorial text-4xl sm:text-5xl font-semibold text-[#28231F]">
              Celebration Cakes &amp; Custom Creations
            </h1>
            <p className="text-sm sm:text-base text-[#81766D] leading-relaxed">
              From Classic and Indian fusion cakes to Baked Cheesecakes, Photo Cakes, Shape Cakes, and 3D Fondant designs. Any printed price marked for verification is confirmed directly by our Kurnool team before billing.
            </p>
          </div>

          {/* Collection Filter Strip */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSearchParams({}, { replace: true })}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                activeSlug === 'all'
                  ? 'bg-[#28231F] text-white'
                  : 'bg-white text-[#81766D] border border-[#EEE7DF] hover:text-[#28231F]'
              }`}
            >
              All Collections ({cakeCollections.length})
            </button>
            {cakeCollections.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSearchParams({ collection: c.slug }, { replace: true })}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  activeSlug === c.slug
                    ? 'bg-[#F36B21] text-white'
                    : 'bg-white text-[#81766D] border border-[#EEE7DF] hover:text-[#28231F]'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Cake Collections Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {visibleCollections.map((collection) => (
          <article
            key={collection.id}
            className="rounded-3xl border border-[#EEE7DF] bg-white overflow-hidden shadow-[0_8px_30px_rgba(40,35,31,0.04)]"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Left Image & Pricing Overview */}
              <div className="lg:col-span-5 bg-[#FFF9F1]/70 border-b lg:border-b-0 lg:border-r border-[#EEE7DF] flex flex-col justify-between">
                <div>
                  <div className="aspect-[4/3] overflow-hidden">
                    <SafeImage
                      src={collection.image}
                      alt={`${collection.name} representative presentation`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 sm:p-7 space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#28231F]">
                        <VegMark className="w-3.5 h-3.5" />
                        <span>Pure Veg</span>
                      </span>
                      {collection.priceVerificationStatus === 'needs_verification' && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-[#C94E16]">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Pending verification</span>
                        </span>
                      )}
                    </div>

                    <h2 className="font-editorial text-3xl font-semibold text-[#28231F]">
                      {collection.name}
                    </h2>
                    <p className="text-sm text-[#81766D] leading-relaxed">
                      {collection.description}
                    </p>

                    {/* Pricing Breakdown */}
                    <div className="pt-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {collection.halfKgPrice !== null && (
                        <div className="p-3 rounded-xl bg-white border border-[#EEE7DF]">
                          <p className="text-[11px] uppercase tracking-wider text-[#81766D]">
                            Half KG
                          </p>
                          <p className="text-lg font-semibold text-[#28231F] tabular-nums mt-0.5">
                            ₹{collection.halfKgPrice}
                            {collection.priceVerificationStatus === 'needs_verification' ? '*' : ''}
                          </p>
                        </div>
                      )}
                      {collection.oneKgPrice !== null && (
                        <div className="p-3 rounded-xl bg-white border border-[#EEE7DF]">
                          <p className="text-[11px] uppercase tracking-wider text-[#81766D]">
                            1 KG
                          </p>
                          <p className="text-lg font-semibold text-[#28231F] tabular-nums mt-0.5">
                            ₹{collection.oneKgPrice}
                          </p>
                        </div>
                      )}
                      {collection.pastryPrice != null && (
                        <div className="p-3 rounded-xl bg-white border border-[#EEE7DF]">
                          <p className="text-[11px] uppercase tracking-wider text-[#81766D]">
                            {collection.pastrySizeLabel || 'Pastry'}
                          </p>
                          <p className="text-lg font-semibold text-[#28231F] tabular-nums mt-0.5">
                            ₹{collection.pastryPrice}
                            {collection.priceVerificationStatus === 'needs_verification' ? '*' : ''}
                          </p>
                        </div>
                      )}
                      {collection.perKgPrice != null && (
                        <div className="p-3 rounded-xl bg-white border border-[#EEE7DF] col-span-2">
                          <p className="text-[11px] uppercase tracking-wider text-[#81766D]">
                            Starting Per KG
                          </p>
                          <p className="text-lg font-semibold text-[#28231F] tabular-nums mt-0.5">
                            ₹{collection.perKgPrice}
                          </p>
                        </div>
                      )}
                    </div>

                    {collection.verificationNote && (
                      <p className="text-xs text-[#C94E16] bg-white border border-[#EEE7DF] rounded-xl p-3 leading-relaxed">
                        Note: {collection.verificationNote}
                      </p>
                    )}
                  </div>
                </div>

                <div className="px-6 sm:px-7 pb-7">
                  <button
                    type="button"
                    onClick={() => handleEnquireClick(collection)}
                    className="w-full py-3 px-5 rounded-full bg-[#F36B21] hover:bg-[#C94E16] text-white text-xs font-semibold uppercase tracking-wide transition-colors"
                  >
                    Enquire for {collection.name}
                  </button>
                </div>
              </div>

              {/* Right Flavours & Calorie Table */}
              <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#EEE7DF] pb-3">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-[#28231F]">
                      Available Flavours ({collection.flavours.length})
                    </h3>
                    {collection.serveSizeNote && (
                      <span className="text-xs text-[#81766D]">{collection.serveSizeNote}</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
                    {collection.flavours.map((flavour) => (
                      <div
                        key={flavour.name}
                        className="flex items-center justify-between gap-2 py-2 border-b border-[#EEE7DF]/70 text-sm"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-medium text-[#28231F] truncate">
                            {flavour.name}
                          </span>
                          {flavour.isSignature && (
                            <Heart
                              className="w-3.5 h-3.5 text-[#F36B21] fill-[#F36B21] shrink-0"
                              aria-label="House favourite"
                            />
                          )}
                        </div>

                        <div className="flex items-center gap-3 shrink-0 text-xs tabular-nums">
                          {flavour.calories && (
                            <span className="text-[#81766D]">{flavour.calories}</span>
                          )}
                          {flavour.serveSizeGrams && (
                            <span className="text-[#81766D]">{flavour.serveSizeGrams}g</span>
                          )}
                          {flavour.pastryPrice && (
                            <span className="font-semibold text-[#28231F]">
                              Pastry ₹{flavour.pastryPrice}
                            </span>
                          )}
                          {flavour.price500g && (
                            <span className="font-semibold text-[#28231F]">
                              ₹{flavour.price500g}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleEnquireClick(collection, flavour.name)}
                            className="text-[#C94E16] hover:text-[#F36B21] font-semibold"
                          >
                            Select
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-[#81766D] pt-2">
                  *Prices are excluding taxes. Signature heart marks reflect highlights from the in-store menu card.
                </p>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* CUSTOM CAKE ENQUIRY FORM */}
      <section
        ref={enquirySectionRef}
        id="custom-cake-enquiry"
        className="bg-[#FFF9F1] border-t border-[#EEE7DF] py-16 sm:py-20"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-2 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#F36B21]">
              Custom Cake Enquiry
            </p>
            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#28231F]">
              Design Your Celebration Cake
            </h2>
            <p className="text-sm sm:text-base text-[#81766D] max-w-2xl mx-auto">
              Share your preferred category, flavour, weight, and design inspiration. Submitting saves your enquiry for our bakers and prepares a direct WhatsApp message to confirm availability and final pricing.
            </p>
          </div>

          <form
            onSubmit={handleEnquirySubmit}
            className="rounded-3xl bg-white border border-[#EEE7DF] p-6 sm:p-10 shadow-sm space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label htmlFor="cust-name" className="text-xs font-semibold text-[#28231F]">
                  Customer Name *
                </label>
                <input
                  id="cust-name"
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EEE7DF] text-sm focus:outline-none focus:border-[#F36B21]"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="cust-mobile" className="text-xs font-semibold text-[#28231F]">
                  Mobile Number *
                </label>
                <input
                  id="cust-mobile"
                  type="tel"
                  required
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EEE7DF] text-sm tabular-nums focus:outline-none focus:border-[#F36B21]"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="cake-cat" className="text-xs font-semibold text-[#28231F]">
                  Cake Category *
                </label>
                <select
                  id="cake-cat"
                  value={cakeCategory}
                  onChange={(e) => setCakeCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EEE7DF] text-sm bg-white focus:outline-none focus:border-[#F36B21]"
                >
                  {cakeCollections.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="cake-flavour" className="text-xs font-semibold text-[#28231F]">
                  Preferred Flavour *
                </label>
                {selectedCollectionObj && selectedCollectionObj.flavours.length > 1 ? (
                  <select
                    id="cake-flavour"
                    value={preferredFlavour}
                    onChange={(e) => setPreferredFlavour(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#EEE7DF] text-sm bg-white focus:outline-none focus:border-[#F36B21]"
                  >
                    {selectedCollectionObj.flavours.map((f) => (
                      <option key={f.name} value={f.name}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id="cake-flavour"
                    type="text"
                    required
                    value={preferredFlavour}
                    onChange={(e) => setPreferredFlavour(e.target.value)}
                    placeholder="Specify base flavour"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#EEE7DF] text-sm focus:outline-none focus:border-[#F36B21]"
                  />
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="cake-weight" className="text-xs font-semibold text-[#28231F]">
                  Cake Weight *
                </label>
                <select
                  id="cake-weight"
                  value={cakeWeight}
                  onChange={(e) => setCakeWeight(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EEE7DF] text-sm bg-white focus:outline-none focus:border-[#F36B21]"
                >
                  <option value="500g (Half KG)">500g (Half KG)</option>
                  <option value="1 KG">1 KG</option>
                  <option value="1.5 KG">1.5 KG</option>
                  <option value="2 KG">2 KG</option>
                  <option value="3 KG+ (Multi-Tier)">3 KG+ (Multi-Tier)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="cake-date" className="text-xs font-semibold text-[#28231F]">
                  Required Delivery / Pickup Date *
                </label>
                <input
                  id="cake-date"
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={requiredDate}
                  onChange={(e) => setRequiredDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EEE7DF] text-sm focus:outline-none focus:border-[#F36B21]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="cake-shape" className="text-xs font-semibold text-[#28231F]">
                Shape / Design Preference *
              </label>
              <input
                id="cake-shape"
                type="text"
                required
                value={shapeOrDesign}
                onChange={(e) => setShapeOrDesign(e.target.value)}
                placeholder="e.g. Round, Heart, Car Shape, Photo Print, Two-Tier Fondant"
                className="w-full px-4 py-2.5 rounded-xl border border-[#EEE7DF] text-sm focus:outline-none focus:border-[#F36B21]"
              />
            </div>

            {/* Reference Image Upload */}
            <div className="space-y-2">
              <label htmlFor="cake-ref-img" className="text-xs font-semibold text-[#28231F]">
                Reference Design / Photo Upload (Optional, JPEG/PNG/WebP up to 5MB)
              </label>
              <div className="flex flex-wrap items-center gap-4">
                <label
                  htmlFor="cake-ref-img"
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[#C94E16]/50 bg-[#FFF9F1] hover:border-[#F36B21] text-xs font-semibold text-[#C94E16] transition-colors"
                >
                  <ImagePlus className="w-4 h-4" />
                  <span>{uploadingImage ? 'Uploading...' : 'Choose Reference Image'}</span>
                </label>
                <input
                  id="cake-ref-img"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="sr-only"
                />
                {referenceImageUrl && (
                  <div className="flex items-center gap-2.5">
                    <img
                      src={referenceImageUrl}
                      alt="Uploaded cake reference preview"
                      className="w-12 h-12 rounded-lg object-cover border border-[#EEE7DF]"
                    />
                    <button
                      type="button"
                      onClick={() => setReferenceImageUrl('')}
                      className="text-xs text-[#81766D] hover:text-[#C94E16]"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="cake-notes" className="text-xs font-semibold text-[#28231F]">
                Additional Instructions (Message on Cake, Colours, Pickup/Delivery Notes)
              </label>
              <textarea
                id="cake-notes"
                rows={3}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Write any inscription text or custom details..."
                className="w-full px-4 py-2.5 rounded-xl border border-[#EEE7DF] text-sm focus:outline-none focus:border-[#F36B21]"
              />
            </div>

            {formError && (
              <div
                role="alert"
                className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {submittedEnquiry && (
              <div
                role="status"
                className="p-4 rounded-xl bg-[#FFF9F1] border border-[#F36B21]/40 text-sm text-[#28231F] space-y-2"
              >
                <div className="flex items-center gap-2 font-semibold text-[#C94E16]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Enquiry Recorded ({submittedEnquiry.id})</span>
                </div>
                <p className="text-xs text-[#81766D]">
                  Your cake request is saved for our team. Order confirmation is subject to availability and final pricing verification from 7th Heaven Bakery &amp; Cafe.
                </p>
                <a
                  href={submittedEnquiry.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F36B21] text-white text-xs font-semibold"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Open WhatsApp Message Again</span>
                </a>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#EEE7DF]">
              <p className="text-xs text-[#81766D] max-w-md">
                Submitting sends an enquiry only — orders are confirmed once our bakery verifies design feasibility, availability, and final price.
              </p>
              <button
                type="submit"
                disabled={submitting || uploadingImage}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#F36B21] hover:bg-[#C94E16] disabled:opacity-60 text-white text-xs font-semibold uppercase tracking-wide transition-colors whitespace-nowrap shrink-0"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{submitting ? 'Submitting...' : 'Submit & Open WhatsApp Enquiry'}</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Original Menu Reference Modal */}
      {showRefModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#28231F]/70 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-label="Original Cake Catalogue Reference"
        >
          <div className="relative w-full max-w-4xl bg-white rounded-2xl border border-[#EEE7DF] overflow-hidden shadow-2xl">
            <div className="px-5 py-3.5 border-b border-[#EEE7DF] flex items-center justify-between">
              <p className="text-sm font-semibold text-[#28231F]">
                Original In-Store Cake Catalogue Photograph
              </p>
              <button
                type="button"
                onClick={() => setShowRefModal(false)}
                aria-label="Close reference modal"
                className="w-9 h-9 inline-flex items-center justify-center rounded-full text-[#81766D] hover:bg-[#FFF9F1]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 bg-[#FFF9F1] flex items-center justify-center max-h-[80vh] overflow-auto">
              <img
                src={IMAGES.originalCakeMenuRef}
                alt="7th Heaven Bakery & Cafe printed cake menu reference"
                className="max-h-[72vh] w-auto object-contain rounded-lg -rotate-90"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
