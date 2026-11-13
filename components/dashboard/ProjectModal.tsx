'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { X, Loader2, Upload, Image as ImageIcon } from 'lucide-react';
import { PortfolioProject } from '@/lib/default-projects';

interface ProjectModalProps {
  isOpen: boolean;
  isAr: boolean;
  editingProject: PortfolioProject | null;
  isSaving: boolean;
  onClose: () => void;
  onSave: (data: Omit<PortfolioProject, 'id'>) => Promise<void>;
}

const MAX_IMAGE_DATA_LENGTH = 650000;

function getDefaultYearMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function compressImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const img = new window.Image();
      img.onload = () => {
        const maxWidth = 960;
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const targetWidth = Math.round(img.width * scale);
        const targetHeight = Math.round(img.height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(result);
          return;
        }
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        let compressed = canvas.toDataURL('image/jpeg', 0.82);
        if (compressed.length > MAX_IMAGE_DATA_LENGTH) {
          compressed = canvas.toDataURL('image/jpeg', 0.6);
        }
        resolve(compressed);
      };
      img.onerror = () => reject(new Error('Invalid image file'));
      img.src = result;
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

export default function ProjectModal({
  isOpen,
  isAr,
  editingProject,
  isSaving,
  onClose,
  onSave,
}: ProjectModalProps) {
  const [title, setTitle] = useState(editingProject?.title ?? '');
  const [titleAr, setTitleAr] = useState(editingProject?.titleAr ?? '');
  const [description, setDescription] = useState(editingProject?.description ?? '');
  const [descriptionAr, setDescriptionAr] = useState(editingProject?.descriptionAr ?? '');
  const [date, setDate] = useState(editingProject?.date ?? getDefaultYearMonth());
  const [imageUrl, setImageUrl] = useState(editingProject?.imageUrl ?? '');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [processingImage, setProcessingImage] = useState(false);
  const [demoUrl, setDemoUrl] = useState(
    editingProject?.demoUrl ?? 'https://github.com/omaralshatti/'
  );
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleScreenshotChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setValidationError(null);

    if (!file.type.startsWith('image/')) {
      setValidationError(
        isAr ? 'يرجى اختيار ملف صورة صالح.' : 'Please select a valid image file.'
      );
      e.target.value = '';
      return;
    }

    setProcessingImage(true);
    try {
      const dataUrl = await compressImageToDataUrl(file);
      if (dataUrl.length > MAX_IMAGE_DATA_LENGTH) {
        setValidationError(
          isAr
            ? 'حجم الصورة كبير جداً حتى بعد الضغط. يرجى اختيار صورة أصغر.'
            : 'Image size is still too large after compression. Please pick a smaller image.'
        );
        e.target.value = '';
        return;
      }
      setImageUrl(dataUrl);
      setUploadedFileName(file.name);
    } catch {
      setValidationError(
        isAr ? 'تعذر معالجة الصورة المرفوعة.' : 'Unable to process the uploaded screenshot.'
      );
    } finally {
      setProcessingImage(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    const cleanTitleAr = (titleAr.trim() || cleanTitle).slice(0, 140);
    const cleanDesc = description.trim();
    const cleanDescAr = (descriptionAr.trim() || cleanDesc).slice(0, 600);
    const cleanDate = date.trim();
    const cleanImage = imageUrl.trim();
    const cleanDemo = demoUrl.trim();

    if (!cleanTitle || !cleanDesc || !cleanDate || !cleanDemo || !cleanImage) {
      setValidationError(
        isAr
          ? 'يرجى تعبئة جميع الحقول المطلوبة ورفع لقطة شاشة للمشروع.'
          : 'Please complete all required fields and upload a project screenshot.'
      );
      return;
    }

    if (
      cleanTitle.length > 140 ||
      cleanDesc.length > 600 ||
      cleanDate.length > 40 ||
      cleanImage.length > MAX_IMAGE_DATA_LENGTH
    ) {
      setValidationError(
        isAr
          ? 'تجاوز أحد الحقول الحد الأقصى للطول أو الحجم المسموح.'
          : 'One or more fields exceed the allowed character or file size limit.'
      );
      return;
    }

    await onSave({
      title: cleanTitle,
      titleAr: cleanTitleAr,
      description: cleanDesc,
      descriptionAr: cleanDescAr,
      date: cleanDate,
      imageUrl: cleanImage,
      demoUrl: cleanDemo.slice(0, 1000),
    });
  };

  const busy = isSaving || processingImage;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#0B1A33]/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
    >
      <div className="w-full max-w-xl glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/50 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#3B82F6]/20">
          <h2 id="project-modal-title" className="text-lg sm:text-xl font-semibold text-[#F2F4F8]">
            {editingProject
              ? isAr
                ? 'تعديل المشروع'
                : 'Edit Project'
              : isAr
              ? 'إضافة مشروع جديد'
              : 'Add New Project'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label={isAr ? 'إغلاق' : 'Close'}
            className="p-2 rounded-lg text-[#F2F4F8]/70 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {validationError && (
            <p className="text-xs sm:text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5">
              {validationError}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#F2F4F8]/75 mb-1.5">
                {isAr ? 'اسم المشروع (بالإنجليزية) *' : 'Project Name (English) *'}
              </label>
              <input
                type="text"
                required
                maxLength={140}
                disabled={busy}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Construction Company Landing Page"
                dir="ltr"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B1A33]/70 border border-[#3B82F6]/25 focus:border-[#3B82F6] focus:outline-none text-sm text-[#F2F4F8] placeholder:text-[#F2F4F8]/35 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#F2F4F8]/75 mb-1.5">
                {isAr ? 'اسم المشروع (بالعربية)' : 'Project Name (Arabic)'}
              </label>
              <input
                type="text"
                maxLength={140}
                disabled={busy}
                value={titleAr}
                onChange={(e) => setTitleAr(e.target.value)}
                placeholder="صفحة هبوط لشركة مقاولات"
                dir="rtl"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B1A33]/70 border border-[#3B82F6]/25 focus:border-[#3B82F6] focus:outline-none text-sm text-[#F2F4F8] placeholder:text-[#F2F4F8]/35 disabled:opacity-60"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#F2F4F8]/75 mb-1.5">
                {isAr ? 'الوصف (بالإنجليزية) *' : 'Description (English) *'}
              </label>
              <textarea
                required
                rows={3}
                maxLength={600}
                disabled={busy}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of the project architecture and features..."
                dir="ltr"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B1A33]/70 border border-[#3B82F6]/25 focus:border-[#3B82F6] focus:outline-none text-sm text-[#F2F4F8] placeholder:text-[#F2F4F8]/35 resize-none disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#F2F4F8]/75 mb-1.5">
                {isAr ? 'الوصف (بالعربية)' : 'Description (Arabic)'}
              </label>
              <textarea
                rows={3}
                maxLength={600}
                disabled={busy}
                value={descriptionAr}
                onChange={(e) => setDescriptionAr(e.target.value)}
                placeholder="وصف مختصر للمشروع ومميزاته..."
                dir="rtl"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B1A33]/70 border border-[#3B82F6]/25 focus:border-[#3B82F6] focus:outline-none text-sm text-[#F2F4F8] placeholder:text-[#F2F4F8]/35 resize-none disabled:opacity-60"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#F2F4F8]/75 mb-1.5">
                {isAr ? 'التاريخ *' : 'Date *'}
              </label>
              <input
                type="text"
                required
                maxLength={40}
                disabled={busy}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="2026-11"
                dir="ltr"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B1A33]/70 border border-[#3B82F6]/25 focus:border-[#3B82F6] focus:outline-none text-sm text-[#F2F4F8] placeholder:text-[#F2F4F8]/35 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#F2F4F8]/75 mb-1.5">
                {isAr ? 'رابط العرض المباشر *' : 'Demo URL *'}
              </label>
              <input
                type="url"
                required
                maxLength={1000}
                disabled={busy}
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                placeholder="https://github.com/omaralshatti/project"
                dir="ltr"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B1A33]/70 border border-[#3B82F6]/25 focus:border-[#3B82F6] focus:outline-none text-sm text-[#F2F4F8] placeholder:text-[#F2F4F8]/35 disabled:opacity-60"
              />
            </div>
          </div>

          {/* Screenshot Upload Field */}
          <div>
            <label className="block text-xs font-medium text-[#F2F4F8]/75 mb-1.5">
              {isAr ? 'لقطة شاشة المشروع *' : 'Project Screenshot *'}
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              disabled={busy}
              onChange={handleScreenshotChange}
              className="hidden"
            />

            <div className="rounded-2xl bg-[#0B1A33]/60 border border-[#3B82F6]/25 p-4 space-y-3">
              {imageUrl ? (
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-[#3B82F6]/20 bg-[#122544]">
                  <Image
                    src={imageUrl}
                    alt={title || 'Project screenshot preview'}
                    fill
                    sizes="(max-width: 640px) 100vw, 520px"
                    referrerPolicy="no-referrer"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-[16/9] w-full rounded-xl border border-dashed border-[#3B82F6]/30 flex flex-col items-center justify-center gap-2 text-xs text-[#F2F4F8]/50">
                  <ImageIcon className="w-7 h-7 text-[#3B82F6]/60" aria-hidden="true" />
                  <span>
                    {isAr ? 'لم يتم رفع لقطة شاشة بعد' : 'No screenshot uploaded yet'}
                  </span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-[#F2F4F8]/60 truncate max-w-[240px]" dir="ltr">
                  {uploadedFileName
                    ? uploadedFileName
                    : imageUrl
                    ? isAr
                      ? 'صورة المشروع الحالية'
                      : 'Current screenshot'
                    : isAr
                    ? 'PNG, JPG, WebP'
                    : 'PNG, JPG, WebP'}
                </span>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={busy}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-[#3B82F6]/30 hover:border-[#3B82F6] text-xs font-medium text-[#F2F4F8] transition-all disabled:opacity-60"
                >
                  {processingImage ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#3B82F6]" aria-hidden="true" />
                  ) : (
                    <Upload className="w-4 h-4 text-[#3B82F6]" aria-hidden="true" />
                  )}
                  <span>
                    {processingImage
                      ? isAr
                        ? 'جاري المعالجة...'
                        : 'Processing...'
                      : imageUrl
                      ? isAr
                        ? 'تغيير الصورة'
                        : 'Change Screenshot'
                      : isAr
                      ? 'رفع صورة'
                      : 'Upload Screenshot'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#3B82F6]/15">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-[#F2F4F8]/80 hover:text-white bg-white/5 hover:bg-white/10 border border-[#3B82F6]/20 transition-colors disabled:opacity-50"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#3B82F6] hover:bg-blue-600 text-white text-sm font-medium transition-all shadow-md shadow-[#3B82F6]/25 disabled:opacity-70 min-w-[120px]"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
              <span>
                {isSaving
                  ? isAr
                    ? 'جاري الحفظ...'
                    : 'Saving...'
                  : editingProject
                  ? isAr
                    ? 'حفظ التعديلات'
                    : 'Save Changes'
                  : isAr
                  ? 'إضافة المشروع'
                  : 'Add Project'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
